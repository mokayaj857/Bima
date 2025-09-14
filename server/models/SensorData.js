const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
