const mongoose = require('mongoose');

const predictiveDataSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
    index: true
  },
  predictionType: {
    type: String,
    enum: ['water_usage', 'carbon_footprint', 'maintenance', 'cost_optimization'],
    required: true
  },
  predictionData: {
    timestamps: [Date],
    values: [Number],
    confidence: [Number] // Confidence scores for each prediction
  },
  modelMetadata: {
    algorithm: String,
    trainingDate: Date,
    accuracy: Number,
    features: [String]
  },
  timeRange: {
    start: Date,
    end: Date,
    interval: String // 'hourly', 'daily', 'weekly', 'monthly'
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

// Index for efficient querying
predictiveDataSchema.index({ sensorId: 1, predictionType: 1, 'timeRange.start': 1 });

// Update timestamp on save
predictiveDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get latest predictions for a sensor
predictiveDataSchema.statics.getLatestPredictions = function(sensorId, predictionType) {
  return this.find({
    sensorId,
    predictionType
  })
  .sort({ 'timeRange.end': -1 })
  .limit(1);
};

// Static method to get predictions within date range
predictiveDataSchema.statics.getPredictionsInRange = function(sensorId, predictionType, startDate, endDate) {
  return this.find({
    sensorId,
    predictionType,
    'timeRange.start': { $gte: startDate },
    'timeRange.end': { $lte: endDate }
  })
  .sort({ 'timeRange.start': 1 });
};

module.exports = mongoose.model('PredictiveData', predictiveDataSchema);
