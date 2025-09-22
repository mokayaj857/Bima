const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to authorize roles
const authorizeRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient permissions' });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Middleware to authorize admin levels
const authorizeAdminLevel = (requiredLevel) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.isAdmin()) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const levelHierarchy = { 'level_1': 1, 'level_2': 2, 'level_3': 3 };
      const userLevel = levelHierarchy[user.adminLevel] || 0;
      const requiredLevelValue = levelHierarchy[requiredLevel] || 0;

      if (userLevel < requiredLevelValue) {
        return res.status(403).json({ error: 'Insufficient admin level' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeAdminLevel
};
