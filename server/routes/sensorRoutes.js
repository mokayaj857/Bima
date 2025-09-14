const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');

// GET all sensor data
router.get('/sensors', async (req, res) => {
  try {
    const data = await SensorData.find();
    res.json(data);
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
