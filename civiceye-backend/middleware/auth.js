const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * API Gateway auth enforcement (Section VI): validates the JWT bearer
 * token and attaches the authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    throw new Error('Not authenticated: missing bearer token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authenticated: user not found or disabled');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authenticated: invalid or expired token');
  }
});

/**
 * Role-based route protection distinguishing citizen and administrator
 * accounts (Section VIII, Implementation).
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Forbidden: requires role(s): ${roles.join(', ')}`);
    }
    next();
  };
}

module.exports = { protect, requireRole };
