/**
 * Rule-based classification taxonomy.
 *
 * Maps Google Cloud Vision API label output to the civic issue taxonomy
 * described in Section V.A ("road damage, drainage problems, illegal
 * dumping, streetlight failure, fallen trees") and to the responsible
 * municipal department (Section VII.D).
 *
 * This is intentionally a plain, editable configuration object rather than
 * a trained model — Section VII.C notes the design goal of avoiding a
 * custom deep-learning model while remaining adaptable to new categories
 * through configuration changes.
 */

const CATEGORY_RULES = [
  {
    category: 'Road Damage',
    department: 'Roads & Infrastructure',
    // Vision API label keywords (lowercased, substring match) that map to this category
    keywords: [
      'pothole', 'road', 'asphalt', 'pavement', 'crack', 'road surface',
      'street', 'highway', 'tarmac', 'rubble', 'rut',
    ],
  },
  {
    category: 'Drainage Problem',
    department: 'Water & Drainage',
    keywords: [
      'drain', 'drainage', 'sewer', 'sewage', 'flood', 'water',
      'puddle', 'waterlogging', 'manhole', 'gutter', 'overflow',
    ],
  },
  {
    category: 'Illegal Dumping',
    department: 'Sanitation & Waste Management',
    keywords: [
      'trash', 'garbage', 'waste', 'litter', 'dump', 'rubbish',
      'landfill', 'debris pile', 'junk', 'plastic bag', 'refuse',
    ],
  },
  {
    category: 'Streetlight Failure',
    department: 'Electrical & Street Lighting',
    keywords: [
      'streetlight', 'street light', 'lamp post', 'lamppost',
      'light fixture', 'electric pole', 'utility pole', 'wire', 'cable',
    ],
  },
  {
    category: 'Fallen Tree',
    department: 'Parks & Environment',
    keywords: [
      'tree', 'branch', 'fallen', 'log', 'trunk', 'foliage', 'plant',
      'vegetation',
    ],
  },
];

const DEFAULT_CATEGORY = 'Other';
const DEFAULT_DEPARTMENT = 'General Administration';

// Keyword cues from the free-text description used to escalate severity
// (Section VII.D: "keyword cues extracted from the text description").
const SEVERITY_KEYWORDS = {
  Critical: ['danger', 'dangerous', 'collapsed', 'urgent', 'emergency', 'live wire', 'exposed wire', 'accident', 'injur'],
  High: ['large', 'severe', 'blocking', 'major', 'flooding', 'overflowing', 'deep', 'huge'],
  Medium: ['moderate', 'ongoing', 'growing', 'spreading'],
  Low: ['minor', 'small', 'slight'],
};

/**
 * Maps a set of Google Cloud Vision labels (each { description, score })
 * to a civic issue category + department using substring keyword matching.
 * Chooses the rule with the most keyword hits weighted by label confidence.
 */
function classifyFromLabels(labels = []) {
  const normalized = labels.map((l) => ({
    description: String(l.description || '').toLowerCase(),
    score: typeof l.score === 'number' ? l.score : 0.5,
  }));

  let best = null;

  for (const rule of CATEGORY_RULES) {
    let ruleScore = 0;
    for (const label of normalized) {
      for (const keyword of rule.keywords) {
        if (label.description.includes(keyword)) {
          ruleScore += label.score;
          break; // avoid double counting one label against the same rule
        }
      }
    }
    if (ruleScore > 0 && (!best || ruleScore > best.ruleScore)) {
      best = { ...rule, ruleScore };
    }
  }

  if (!best) {
    return {
      category: DEFAULT_CATEGORY,
      department: DEFAULT_DEPARTMENT,
      confidence: 0,
    };
  }

  // Normalize a rough confidence figure into [0,1] for display purposes.
  const confidence = Math.min(1, best.ruleScore / Math.max(1, normalized.length));

  return {
    category: best.category,
    department: best.department,
    confidence,
  };
}

/**
 * Determines severity by combining the classified category with keyword
 * cues extracted from the citizen's free-text description (Section VII.D).
 */
function classifySeverity(description = '') {
  const text = String(description || '').toLowerCase();

  for (const level of ['Critical', 'High', 'Medium', 'Low']) {
    if (SEVERITY_KEYWORDS[level].some((kw) => text.includes(kw))) {
      return level;
    }
  }
  return 'Medium'; // default when no cues are present
}

module.exports = {
  CATEGORY_RULES,
  DEFAULT_CATEGORY,
  DEFAULT_DEPARTMENT,
  classifyFromLabels,
  classifySeverity,
};
