const mongoose = require('mongoose');

const CATEGORIES = [
  'Road Damage',
  'Drainage Problem',
  'Illegal Dumping',
  'Streetlight Failure',
  'Fallen Tree',
  'Other',
];

const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Water & Drainage',
  'Sanitation & Waste Management',
  'Electrical & Street Lighting',
  'Parks & Environment',
  'General Administration',
];

const STATUSES = ['Submitted', 'In Progress', 'Resolved', 'Rejected'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const visionLabelSchema = new mongoose.Schema(
  {
    description: String,
    score: Number,
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // --- Submission (Section V.C, User Submission Module) ---
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 1000 },
    imageUrl: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        // [longitude, latitude], GeoJSON order
        type: [Number],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length === 2,
          message: 'coordinates must be [longitude, latitude]',
        },
      },
      address: { type: String, trim: true },
    },

    // --- AI Detection + Classification (Section VII.B/C) ---
    visionLabels: [visionLabelSchema],
    category: { type: String, enum: CATEGORIES, default: 'Other' },
    severity: { type: String, enum: SEVERITIES, default: 'Medium' },
    classificationConfidence: { type: Number, min: 0, max: 1, default: 0 },

    // --- Routing (Section VII.E) ---
    department: { type: String, enum: DEPARTMENTS, required: true },
    routedAt: { type: Date },

    // --- Status tracking (Section VII.F) ---
    status: { type: String, enum: STATUSES, default: 'Submitted' },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

issueSchema.index({ location: '2dsphere' });
issueSchema.index({ department: 1, status: 1 });
issueSchema.index({ category: 1 });
issueSchema.index({ citizen: 1 });

issueSchema.methods.toClientObject = function toClientObject() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    imageUrl: this.imageUrl,
    location: {
      lat: this.location.coordinates[1],
      lng: this.location.coordinates[0],
      address: this.location.address,
    },
    category: this.category,
    severity: this.severity,
    department: this.department,
    status: this.status,
    statusHistory: this.statusHistory,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Issue', issueSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.STATUSES = STATUSES;
module.exports.SEVERITIES = SEVERITIES;
