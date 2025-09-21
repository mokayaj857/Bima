const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');

// Mock sensor data generator
function generateMockSensorData() {
  const sensors = [];
  for (let i = 1; i <= 24; i++) {
    sensors.push({
      id: i,
      lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Around NYC
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      name: `Sensor ${i}`,
      status: Math.random() > 0.1 ? 'Active' : 'Warning',
    });
  }
  return sensors;
}

// GET all sensor data
router.get('/sensors', async (req, res) => {
  try {
    const data = await SensorData.find();
    if (data.length === 0) {
      // Return mock data if no data in DB
      res.json(generateMockSensorData());
    } else {
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new sensor data
router.post('/sensors', async (req, res) => {
  try {
    const newData = new SensorData(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
