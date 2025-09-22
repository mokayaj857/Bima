const mongoose = require('mongoose');

const anomalyLogSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'flow_anomaly',
      'pressure_anomaly',
      'leak_detection',
      'sensor_malfunction',
      'quality_issue',
      'usage_pattern_change',
      'maintenance_required'
    ]
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['detected', 'investigating', 'confirmed', 'resolved', 'false_positive'],
    default: 'detected',
    index: true
  },
  detection: {
    method: {
      type: String,
      enum: ['threshold', 'ml_model', 'pattern_recognition', 'manual'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    algorithm: String,
    parameters: mongoose.Schema.Types.Mixed
  },
  data: {
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    actualValue: Number,
    expectedValue: Number,
    deviation: Number,
    deviationPercentage: Number,
    threshold: Number,
    sensorReadings: {
      flowRate: Number,
      pressure: Number,
      temperature: Number,
      quality: mongoose.Schema.Types.Mixed
    }
  },
  analysis: {
    rootCause: String,
    affectedComponents: [String],
    potentialImpact: {
      waterLoss: Number,
      costImpact: Number,
      healthRisk: String,
      environmentalImpact: String
    },
    recommendations: [String]
  },
  response: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    estimatedFixTime: Number, // in hours
    actualFixTime: Number,
    actionsTaken: [{
      timestamp: Date,
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }],
    resolution: {
      timestamp: Date,
      method: String,
      effectiveness: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor']
      },
      notes: String
    }
  },
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'dashboard']
    },
    recipient: String,
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  metadata: {
    weatherConditions: {
      temperature: Number,
      humidity: Number,
      precipitation: Number
    },
    systemLoad: Number,
    falsePositive: {
      type: Boolean,
      default: false
    },
    tags: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
anomalyLogSchema.index({ sensorId: 1, 'data.timestamp': -1 });
anomalyLogSchema.index({ severity: 1, status: 1, createdAt: -1 });
anomalyLogSchema.index({ userId: 1, type: 1, status: 1 });

// Update timestamp on save
anomalyLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for response time
anomalyLogSchema.virtual('responseTime').get(function() {
  if (this.response.actionsTaken && this.response.actionsTaken.length > 0) {
    const firstAction = this.response.actionsTaken[0];
    return firstAction.timestamp - this.data.timestamp;
  }
  return null;
});

// Static method to get anomalies by time range
anomalyLogSchema.statics.getAnomaliesInRange = function(startDate, endDate, filters = {}) {
  const query = {
    'data.timestamp': { $gte: startDate, $lte: endDate },
    ...filters
  };

  return this.find(query)
    .sort({ 'data.timestamp': -1 })
    .populate('userId', 'username email')
    .populate('response.assignedTo', 'username email');
};

// Static method to get anomaly statistics
anomalyLogSchema.statics.getAnomalyStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'data.timestamp': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          severity: '$severity',
          status: '$status'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$detection.confidence' },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
};

// Static method to get critical anomalies requiring attention
anomalyLogSchema.statics.getCriticalAnomalies = function() {
  return this.find({
    severity: { $in: ['high', 'critical'] },
    status: { $in: ['detected', 'investigating'] }
  })
  .sort({ severity: 1, 'data.timestamp': 1 })
  .populate('userId', 'username email')
  .populate('response.assignedTo', 'username email');
};

// Static method to update anomaly status
anomalyLogSchema.statics.updateStatus = function(id, status, userId, notes = '') {
  const updateData = {
    status,
    $push: {
      'response.actionsTaken': {
        timestamp: new Date(),
        action: `Status changed to ${status}`,
        performedBy: userId,
        notes
      }
    }
  };

  return this.findByIdAndUpdate(id, updateData, { new: true });
};

module.exports = mongoose.model('AnomalyLog', anomalyLogSchema);
