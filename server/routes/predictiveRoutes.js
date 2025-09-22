const express = require('express');
const router = express.Router();
const PredictiveData = require('../models/PredictiveData');
const SensorData = require('../models/SensorData');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../models/User');

// Middleware to check prediction permissions
const checkPredictionPermission = (req, res, next) => {
  if (!req.user.hasPermission(PERMISSIONS.DATA_VIEW)) {
    return res.status(403).json({ error: 'Insufficient permissions to access predictions' });
  }
  next();
};

// GET predictions for a sensor
router.get('/sensor/:sensorId', auth, checkPredictionPermission, async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { type = 'water_usage', startDate, endDate } = req.query;

    let query = { sensorId, predictionType: type };

    if (startDate && endDate) {
      query['timeRange.start'] = { $gte: new Date(startDate) };
      query['timeRange.end'] = { $lte: new Date(endDate) };
    }

    const predictions = await PredictiveData.find(query)
      .sort({ 'timeRange.start': 1 });

    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET latest predictions for all sensors
router.get('/latest', auth, checkPredictionPermission, async (req, res) => {
  try {
    const { type = 'water_usage' } = req.query;

    const latestPredictions = await PredictiveData.aggregate([
      { $match: { predictionType: type } },
      { $sort: { 'timeRange.end': -1 } },
      {
        $group: {
          _id: '$sensorId',
          latestPrediction: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$latestPrediction' }
      }
    ]);

    res.json(latestPredictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET predictions within date range
router.get('/range', auth, checkPredictionPermission, async (req, res) => {
  try {
    const { startDate, endDate, type = 'water_usage' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const predictions = await PredictiveData.find({
      predictionType: type,
      'timeRange.start': { $gte: new Date(startDate) },
      'timeRange.end': { $lte: new Date(endDate) }
    }).sort({ 'timeRange.start': 1 });

    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new prediction
router.post('/', auth, checkPredictionPermission, async (req, res) => {
  try {
    const predictionData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const prediction = new PredictiveData(predictionData);
    await prediction.save();

    res.status(201).json(prediction);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Prediction already exists for this sensor and time range' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

// PUT update prediction
router.put('/:id', auth, checkPredictionPermission, async (req, res) => {
  try {
    const prediction = await PredictiveData.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json(prediction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE prediction
router.delete('/:id', auth, checkPredictionPermission, async (req, res) => {
  try {
    const prediction = await PredictiveData.findByIdAndDelete(req.params.id);

    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    res.json({ message: 'Prediction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET prediction statistics
router.get('/stats/overview', auth, checkPredictionPermission, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage['timeRange.start'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const stats = await PredictiveData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            predictionType: '$predictionType',
            sensorId: '$sensorId'
          },
          count: { $sum: 1 },
          avgAccuracy: { $avg: '$modelMetadata.accuracy' },
          latestPrediction: { $max: '$timeRange.end' }
        }
      },
      {
        $group: {
          _id: '$_id.predictionType',
          totalPredictions: { $sum: 1 },
          sensors: { $sum: 1 },
          avgAccuracy: { $avg: '$avgAccuracy' },
          latestPrediction: { $max: '$latestPrediction' }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET prediction accuracy trends
router.get('/accuracy/trends', auth, checkPredictionPermission, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const accuracyTrends = await PredictiveData.aggregate([
      {
        $match: {
          'timeRange.start': { $gte: startDate },
          'modelMetadata.accuracy': { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timeRange.start' } },
            predictionType: '$predictionType'
          },
          avgAccuracy: { $avg: '$modelMetadata.accuracy' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json(accuracyTrends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
