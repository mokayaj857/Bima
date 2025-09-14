const mongoose = require('mongoose');

const waterFlowDataSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  value: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WaterFlowData', waterFlowDataSchema);
