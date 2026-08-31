const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");

const Issue = require("../models/Issue");
const { detectLabels } = require("../services/visionService");
const { classifyIssue } = require("../services/classificationService");
const { routeToDepartment, notify } = require("../services/routingService");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

async function saveImageToDisk(file) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = (file.mimetype.split("/")[1] || "jpg").replace("jpeg", "jpg");
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, file.buffer);
  return `/uploads/${filename}`;
}

/**
 * POST /api/issues
 * Implements Algorithm 1 (Table II) steps 3-10:
 * validate -> forward to Vision API -> classify -> determine severity/dept
 * -> store -> dispatch routing notification.
 */
const createIssue = asyncHandler(async (req, res) => {
  const { title, description, lat, lng, address } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("An image file is required (field name: image)");
  }
  if (lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error("lat and lng are required");
  }
  if (!title || !title.trim()) {
    res.status(400);
    throw new Error("title is required");
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    res.status(400);
    throw new Error("lat and lng must be valid numbers");
  }

  // Step 4-5: AI Detection Module (Google Cloud Vision)
  let labels = [];
  try {
    labels = await detectLabels(req.file.buffer);
  } catch (err) {
    // Vision API failure should not block submission; fall back to
    // unclassified so the complaint can still be routed for manual review.
    console.error("[vision] label detection failed:", err.message);
  }

  // Step 6-8: Issue Classification + Department Routing determination
  const { category, department, severity, classificationConfidence } =
    classifyIssue({
      labels,
      description,
    });

  const imageUrl = await saveImageToDisk(req.file);

  // Step 9: Store the annotated complaint record in MongoDB
  const issue = new Issue({
    citizen: req.user._id,
    title: title.trim(),
    description,
    imageUrl,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
      address,
    },
    visionLabels: labels,
    category,
    severity,
    classificationConfidence,
    department,
    status: "Submitted",
    statusHistory: [{ status: "Submitted", changedBy: req.user._id }],
  });

  routeToDepartment(issue); // Step 10: routing timestamp
  await issue.save();

  notify("issue.created", { issueId: issue._id, department: issue.department });

  res.status(201).json({ success: true, issue: issue.toClientObject() });
});

// GET /api/issues/user - citizen's own complaints
const getMyIssues = asyncHandler(async (req, res) => {
  const issues = await Issue.find({ citizen: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, issues: issues.map((i) => i.toClientObject()) });
});

// GET /api/issues/:id - single issue (owner or admin)
const getIssueById = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    res.status(404);
    throw new Error("Issue not found");
  }

  const isOwner = issue.citizen.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin" || req.user.role === "system_admin";
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("Forbidden");
  }

  res.json({ success: true, issue: issue.toClientObject() });
});

// GET /api/issues - admin view, with filtering (Section V.C, Administrative Dashboard)
const getAllIssues = asyncHandler(async (req, res) => {
  const {
    status,
    category,
    department,
    severity,
    page = 1,
    limit = 25,
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (severity) filter.severity = severity;

  // system_admin sees all departments; department-scoped admins see only theirs
  if (req.user.role === "admin" && req.user.department) {
    filter.department = req.user.department;
  } else if (department) {
    filter.department = department;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 25));

  const [issues, total] = await Promise.all([
    Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate("citizen", "name email"),
    Issue.countDocuments(filter),
  ]);

  res.json({
    success: true,
    issues: issues.map((i) => ({
      ...i.toClientObject(),
      citizen: i.citizen
        ? { name: i.citizen.name, email: i.citizen.email }
        : null,
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

const ALLOWED_STATUS_TRANSITIONS = {
  Submitted: ["In Progress", "Rejected"],
  "In Progress": ["Resolved", "Rejected"],
  Resolved: [],
  Rejected: [],
};
// PATCH /api/issues/:id/status - admin updates status (Section VII.F)
const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = Object.keys(ALLOWED_STATUS_TRANSITIONS);

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`status must be one of: ${validStatuses.join(", ")}`);
  }

  const issue = await Issue.findById(req.params.id);
  if (!issue) {
    res.status(404);
    throw new Error("Issue not found");
  }

  if (
    req.user.role === "admin" &&
    req.user.department &&
    issue.department !== req.user.department
  ) {
    res.status(403);
    throw new Error("Forbidden: issue is outside your department");
  }
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[issue.status] || [];

  if (!allowedTransitions.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status transition: ${issue.status} -> ${status}`);
  }

  issue.status = status;
  issue.statusHistory.push({ status, note, changedBy: req.user._id });
  await issue.save();

  notify("issue.statusUpdated", { issueId: issue._id, status });

  res.json({ success: true, issue: issue.toClientObject() });
});

// GET /api/issues/stats - Administrative Dashboard summary statistics
const getStats = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "admin" && req.user.department) {
    filter.department = req.user.department;
  }

  const [total, byStatus, byCategory, byDepartment] = await Promise.all([
    Issue.countDocuments(filter),
    Issue.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $match: filter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
    Issue.aggregate([
      { $match: filter },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]),
  ]);

  const toMap = (arr) => Object.fromEntries(arr.map((a) => [a._id, a.count]));

  res.json({
    success: true,
    stats: {
      total,
      byStatus: toMap(byStatus),
      byCategory: toMap(byCategory),
      byDepartment: toMap(byDepartment),
    },
  });
});

// GET /api/issues/heatmap - Geo-Visualization and Analytics Module (Section V.C)
const getHeatmapPoints = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "admin" && req.user.department) {
    filter.department = req.user.department;
  }

  const points = await Issue.find(filter, "location category severity status");

  res.json({
    success: true,
    points: points.map((p) => ({
      lat: p.location.coordinates[1],
      lng: p.location.coordinates[0],
      category: p.category,
      severity: p.severity,
      status: p.status,
    })),
  });
});

module.exports = {
  createIssue,
  getMyIssues,
  getIssueById,
  getAllIssues,
  updateIssueStatus,
  getStats,
  getHeatmapPoints,
};
