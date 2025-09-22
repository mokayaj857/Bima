const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdminActivity = require('../models/AdminActivity');
const auth = require('../middleware/auth');
const { authorizeAdminLevel } = require('./authRoutes');

// Helper function to log admin activity
const logAdminActivity = async (adminId, action, resource, details = {}, metadata = {}) => {
  try {
    await AdminActivity.logActivity(adminId, action, resource, details, metadata);
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

// Get all users (admin only)
router.get('/users', auth, authorizeAdminLevel('level_1'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    await logAdminActivity(req.user.id, 'user_view', {
      type: 'user',
      id: null,
      name: 'User listing',
      details: { filters: { role, search }, count: total }
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
router.post('/users', auth, authorizeAdminLevel('level_2'), async (req, res) => {
  try {
    const { email, username, password, role, adminLevel } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const userData = { email, username, password };
    if (role) userData.role = role;
    if (adminLevel) userData.adminLevel = adminLevel;

    const user = new User(userData);
    await user.save();

    await logAdminActivity(req.user.id, 'user_created', {
      type: 'user',
      id: user._id,
      name: user.username,
      details: { role: user.role, adminLevel: user.adminLevel }
    });

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        adminLevel: user.adminLevel
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only)
router.put('/users/:id', auth, authorizeAdminLevel('level_2'), async (req, res) => {
  try {
    const { username, email, role, adminLevel, blocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role, adminLevel, blocked, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAdminActivity(req.user.id, 'user_updated', {
      type: 'user',
      id: user._id,
      name: user.username,
      details: { changes: { role, adminLevel, blocked } }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, authorizeAdminLevel('level_3'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAdminActivity(req.user.id, 'user_deleted', {
      type: 'user',
      id: user._id,
      name: user.username,
      details: { deletedUser: { email: user.email, role: user.role } }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin activity logs
router.get('/activity', auth, authorizeAdminLevel('level_1'), async (req, res) => {
  try {
    const { page = 1, limit = 50, action, startDate, endDate } = req.query;

    let query = {};
    if (action) query.action = action;
    if (startDate && endDate) {
      query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const activities = await AdminActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('adminId', 'username email');

    const total = await AdminActivity.countDocuments(query);

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalActivities: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system statistics (admin only)
router.get('/stats', auth, authorizeAdminLevel('level_1'), async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const activityStats = await AdminActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      userStats,
      activityStats,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
