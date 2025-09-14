const express = require('express');
const router = express.Router();
const WaterFlowData = require('../models/WaterFlowData');

// GET all water flow data
router.get('/water-flow', async (req, res) => {
  try {
    const data = await WaterFlowData.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new water flow data
router.post('/water-flow', async (req, res) => {
  try {
    const newData = new WaterFlowData(req.body);
    await newData.save();
    res.status(201).json(newData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
