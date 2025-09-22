const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_role_changed',
      'sensor_added',
      'sensor_updated',
      'sensor_deleted',
      'anomaly_resolved',
      'recommendation_implemented',
      'system_settings_changed',
      'bill_processed',
      'report_generated',
      'maintenance_scheduled',
      'alert_configuration_changed',
      'data_exported',
      'login',
      'logout',
      'failed_login',
      'password_reset',
      'permission_changed'
    ]
  },
  resource: {
    type: {
      type: String,
      enum: ['user', 'sensor', 'anomaly', 'recommendation', 'system', 'bill', 'report', 'auth']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    details: mongoose.Schema.Types.Mixed
  },
  details: {
    description: String,
    changes: mongoose.Schema.Types.Mixed, // Store before/after values
    reason: String,
    impact: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
    location: {
      country: String,
      region: String,
      city: String
    },
    device: {
      type: String,
      os: String,
      browser: String
    }
  },
  security: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    flagged: {
      type: Boolean,
      default: false
    },
    flags: [String] // e.g., 'unusual_location', 'suspicious_timing'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient querying
adminActivitySchema.index({ adminId: 1, timestamp: -1 });
adminActivitySchema.index({ action: 1, timestamp: -1 });
adminActivitySchema.index({ 'security.riskLevel': 1, timestamp: -1 });
adminActivitySchema.index({ timestamp: -1 });

// Static method to get admin activity for a user
adminActivitySchema.statics.getAdminActivity = function(adminId, startDate, endDate, limit = 50) {
  const query = {
    adminId,
    timestamp: { $gte: startDate, $lte: endDate }
  };

  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('adminId', 'username email');
};

// Static method to get activity by action type
adminActivitySchema.statics.getActivityByAction = function(action, startDate, endDate, limit = 20) {
  return this.find({
    action,
    timestamp: { $gte: startDate, $lte: endDate }
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .populate('adminId', 'username email');
};

// Static method to get security events
adminActivitySchema.statics.getSecurityEvents = function(startDate, endDate, riskLevel = 'high') {
  return this.find({
    'security.riskLevel': { $gte: riskLevel },
    timestamp: { $gte: startDate, $lte: endDate }
  })
  .sort({ timestamp: -1 })
  .populate('adminId', 'username email');
};

// Static method to get activity statistics
adminActivitySchema.statics.getActivityStats = function(adminId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        adminId: mongoose.Types.ObjectId(adminId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          action: '$action',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': -1, count: -1 }
    }
  ]);
};

// Static method to log admin activity
adminActivitySchema.statics.logActivity = function(adminId, action, resource, details = {}, metadata = {}) {
  const activityData = {
    adminId,
    action,
    resource,
    details,
    metadata,
    timestamp: new Date()
  };

  // Determine risk level based on action
  if (['user_deleted', 'system_settings_changed', 'permission_changed'].includes(action)) {
    activityData.security = { ...activityData.security, riskLevel: 'high' };
  } else if (['failed_login', 'password_reset'].includes(action)) {
    activityData.security = { ...activityData.security, riskLevel: 'medium' };
  }

  return this.create(activityData);
};

// Static method to get recent suspicious activities
adminActivitySchema.statics.getSuspiciousActivities = function(hours = 24) {
  const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.find({
    'security.flagged': true,
    timestamp: { $gte: startDate }
  })
  .sort({ timestamp: -1 })
  .populate('adminId', 'username email');
};

module.exports = mongoose.model('AdminActivity', adminActivitySchema);
