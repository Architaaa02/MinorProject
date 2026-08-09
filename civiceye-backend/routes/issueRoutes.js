const express = require('express');
const {
  createIssue,
  getMyIssues,
  getIssueById,
  getAllIssues,
  updateIssueStatus,
  getStats,
  getHeatmapPoints,
} = require('../controllers/issueController');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Order matters: specific string routes before the generic /:id route.
router.get('/user', protect, getMyIssues);
router.get('/stats', protect, requireRole('admin', 'system_admin'), getStats);
router.get('/heatmap', protect, requireRole('admin', 'system_admin'), getHeatmapPoints);

router.get('/', protect, requireRole('admin', 'system_admin'), getAllIssues);
router.post('/', protect, requireRole('citizen'), upload.single('image'), createIssue);

router.get('/:id', protect, getIssueById);
router.patch('/:id/status', protect, requireRole('admin', 'system_admin'), updateIssueStatus);

module.exports = router;
