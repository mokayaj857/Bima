const mongoose = require('mongoose');

const billDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['water_company', 'utility_company', 'municipality']
  },
  billingPeriod: {
    startDate: Date,
    endDate: Date
  },
  charges: {
    waterUsage: {
      amount: Number, // in cubic meters or gallons
      rate: Number,   // cost per unit
      total: Number    // total cost for water usage
    },
    sewerage: {
      amount: Number,
      rate: Number,
      total: Number
    },
    environmental: {
      amount: Number,
      rate: Number,
      total: Number
    },
    taxes: {
      amount: Number,
      rate: Number,
      total: Number
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  consumption: {
    previousReading: Number,
    currentReading: Number,
    usageAmount: Number, // calculated difference
    unit: {
      type: String,
      enum: ['cubic_meters', 'gallons', 'liters'],
      default: 'cubic_meters'
    }
  },
  carbonFootprint: {
    co2Emissions: Number, // kg CO2 equivalent
    calculationMethod: String,
    factors: {
      waterTreatment: Number,
      distribution: Number,
      wastewater: Number
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending'
    },
    dueDate: Date,
    paidDate: Date,
    paymentMethod: String
  },
  metadata: {
    fileName: String,
    fileSize: Number,
    uploadDate: Date,
    ocrConfidence: Number,
    processingTime: Number // in milliseconds
  },
  analysis: {
    costComparison: {
      previousBill: Number,
      changeAmount: Number,
      changePercentage: Number
    },
    usageComparison: {
      previousUsage: Number,
      changeAmount: Number,
      changePercentage: Number
    },
    efficiency: {
      score: Number, // 0-100
      rating: String, // 'excellent', 'good', 'fair', 'poor'
      recommendations: [String]
    }
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
billDataSchema.index({ userId: 1, 'billingPeriod.endDate': -1 });
billDataSchema.index({ billNumber: 1 }, { unique: true });
billDataSchema.index({ 'payment.dueDate': 1 });

// Update timestamp on save
billDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for days in billing period
billDataSchema.virtual('billingPeriodDays').get(function() {
  if (this.billingPeriod.startDate && this.billingPeriod.endDate) {
    return Math.ceil((this.billingPeriod.endDate - this.billingPeriod.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for daily average usage
billDataSchema.virtual('dailyAverageUsage').get(function() {
  const days = this.billingPeriodDays;
  if (days && this.consumption.usageAmount) {
    return this.consumption.usageAmount / days;
  }
  return null;
});

// Static method to get bills for a user in date range
billDataSchema.statics.getBillsInRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    'billingPeriod.endDate': { $gte: startDate, $lte: endDate }
  })
  .sort({ 'billingPeriod.endDate': -1 });
};

// Static method to calculate total spending for a user
billDataSchema.statics.getTotalSpending = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        'billingPeriod.endDate': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$charges.totalAmount' },
        totalUsage: { $sum: '$consumption.usageAmount' },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('BillData', billDataSchema);
