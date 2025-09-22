const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sensorId: {
    type: String,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'cost_optimization',
      'carbon_reduction',
      'maintenance',
      'usage_efficiency',
      'infrastructure_upgrade',
      'behavioral_change'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['immediate', 'short_term', 'medium_term', 'long_term']
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    problem: String,
    solution: String,
    benefits: [String],
    implementation: {
      steps: [String],
      timeline: String,
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
      }
    },
    cost: {
      estimated: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      paybackPeriod: String // e.g., "6 months", "2 years"
    },
    impact: {
      waterSavings: {
        amount: Number,
        unit: String,
        percentage: Number
      },
      costSavings: {
        amount: Number,
        currency: String,
        percentage: Number
      },
      carbonReduction: {
        amount: Number,
        unit: String,
        percentage: Number
      }
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'implemented', 'dismissed', 'expired'],
    default: 'active'
  },
  effectiveness: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    actualSavings: {
      water: Number,
      cost: Number,
      carbon: Number
    },
    implementationDate: Date,
    notes: String
  },
  triggers: {
    data: {
      type: mongoose.Schema.Types.Mixed // Store the data that triggered this recommendation
    },
    thresholds: {
      type: mongoose.Schema.Types.Mixed // Store threshold values used
    }
  },
  metadata: {
    algorithm: String,
    confidence: Number, // 0-1
    generatedAt: Date,
    expiresAt: Date,
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
recommendationSchema.index({ userId: 1, type: 1, status: 1 });
recommendationSchema.index({ sensorId: 1, priority: 1 });
recommendationSchema.index({ 'metadata.expiresAt': 1 });

// Update timestamp on save
recommendationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get active recommendations for a user
recommendationSchema.statics.getActiveRecommendations = function(userId, limit = 10) {
  return this.find({
    userId,
    status: 'active',
    'metadata.expiresAt': { $gt: new Date() }
  })
  .sort({ priority: 1, createdAt: -1 })
  .limit(limit);
};

// Static method to get recommendations by type
recommendationSchema.statics.getByType = function(userId, type, status = 'active') {
  return this.find({
    userId,
    type,
    status
  })
  .sort({ createdAt: -1 });
};

// Static method to update recommendation effectiveness
recommendationSchema.statics.updateEffectiveness = function(id, effectivenessData) {
  return this.findByIdAndUpdate(
    id,
    {
      $set: {
        'effectiveness.score': effectivenessData.score,
        'effectiveness.actualSavings': effectivenessData.actualSavings,
        'effectiveness.implementationDate': effectivenessData.implementationDate,
        'effectiveness.notes': effectivenessData.notes,
        status: 'implemented'
      }
    },
    { new: true }
  );
};

// Static method to get cost savings summary
recommendationSchema.statics.getCostSavingsSummary = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        status: 'implemented',
        'effectiveness.implementationDate': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCostSavings: { $sum: '$effectiveness.actualSavings.cost' },
        totalWaterSavings: { $sum: '$effectiveness.actualSavings.water' },
        totalCarbonReduction: { $sum: '$effectiveness.actualSavings.carbon' },
        implementedCount: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Recommendation', recommendationSchema);
