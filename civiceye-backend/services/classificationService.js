const { classifyFromLabels, classifySeverity } = require('../utils/taxonomy');

/**
 * Issue Classification Module (Section V.C).
 * Combines Vision API label output with description keyword cues to
 * produce a category, department, and severity for a submitted complaint.
 */
function classifyIssue({ labels, description }) {
  const { category, department, confidence } = classifyFromLabels(labels);
  const severity = classifySeverity(description);

  return {
    category,
    department,
    severity,
    classificationConfidence: Number(confidence.toFixed(3)),
  };
}

module.exports = { classifyIssue };
