const express = require('express');
const router = express.Router();
const AnomalyLog = require('../models/AnomalyLog');
const SensorData = require('../models/SensorData');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../models/User');

// Middleware to check anomaly permissions
const checkAnomalyPermission = (req, res, next) => {
  if (!req.user.hasPermission(PERMISSIONS.ANOMALY_VIEW)) {
    return res.status(403).json({ error: 'Insufficient permissions to access anomalies' });
  }
  next();
};

// GET anomalies with filtering
router.get('/', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const {
      sensorId,
      type,
      severity,
      status = 'detected',
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    if (sensorId) query.sensorId = sensorId;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;

    if (startDate && endDate) {
      query['data.timestamp'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const anomalies = await AnomalyLog.find(query)
      .sort({ 'data.timestamp': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'username email')
      .populate('response.assignedTo', 'username email');

    const total = await AnomalyLog.countDocuments(query);

    res.json({
      anomalies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAnomalies: total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET anomaly by ID
router.get('/:id', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const anomaly = await AnomalyLog.findById(req.params.id)
      .populate('userId', 'username email')
      .populate('response.assignedTo', 'username email');

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json(anomaly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new anomaly
router.post('/', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const anomalyData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const anomaly = new AnomalyLog(anomalyData);
    await anomaly.save();

    res.status(201).json(anomaly);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update anomaly
router.put('/:id', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const anomaly = await AnomalyLog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    .populate('userId', 'username email')
    .populate('response.assignedTo', 'username email');

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json(anomaly);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update anomaly status
router.put('/:id/status', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const userId = req.user._id;

    const anomaly = await AnomalyLog.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          'response.actionsTaken': {
            timestamp: new Date(),
            action: `Status changed to ${status}`,
            performedBy: userId,
            notes: notes || ''
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('userId', 'username email')
    .populate('response.assignedTo', 'username email');

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json(anomaly);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE anomaly
router.delete('/:id', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const anomaly = await AnomalyLog.findByIdAndDelete(req.params.id);

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json({ message: 'Anomaly deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET anomaly statistics
router.get('/stats/overview', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage['data.timestamp'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const stats = await AnomalyLog.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            severity: '$severity',
            status: '$status'
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: '$detection.confidence' }
        }
      },
      {
        $group: {
          _id: '$_id.severity',
          total: { $sum: '$count' },
          byStatus: {
            $push: {
              status: '$_id.status',
              count: '$count',
              avgConfidence: '$avgConfidence'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET critical anomalies requiring attention
router.get('/critical/active', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const anomalies = await AnomalyLog.find({
      severity: { $in: ['high', 'critical'] },
      status: { $in: ['detected', 'investigating'] }
    })
    .sort({ severity: 1, 'data.timestamp': 1 })
    .populate('userId', 'username email')
    .populate('response.assignedTo', 'username email');

    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET anomalies by sensor
router.get('/sensor/:sensorId/history', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { sensorId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const anomalies = await AnomalyLog.find({
      sensorId,
      'data.timestamp': { $gte: startDate }
    })
    .sort({ 'data.timestamp': -1 })
    .populate('userId', 'username email')
    .populate('response.assignedTo', 'username email');

    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST assign anomaly to user
router.post('/:id/assign', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const anomaly = await AnomalyLog.findByIdAndUpdate(
      req.params.id,
      {
        'response.assignedTo': assignedTo,
        'response.priority': 'medium',
        $push: {
          'response.actionsTaken': {
            timestamp: new Date(),
            action: 'Anomaly assigned',
            performedBy: req.user._id,
            notes: `Assigned to user ${assignedTo}`
          }
        },
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('userId', 'username email')
    .populate('response.assignedTo', 'username email');

    if (!anomaly) {
      return res.status(404).json({ error: 'Anomaly not found' });
    }

    res.json(anomaly);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET anomaly trends over time
router.get('/trends/timeline', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const trends = await AnomalyLog.aggregate([
      {
        $match: {
          'data.timestamp': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$data.timestamp' } },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk update anomalies
router.post('/bulk-update', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { anomalyIds, updates } = req.body;

    const result = await AnomalyLog.updateMany(
      { _id: { $in: anomalyIds } },
      { ...updates, updatedAt: new Date() }
    );

    res.json({
      message: 'Anomalies updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET anomaly response time analysis
router.get('/analysis/response-times', auth, checkAnomalyPermission, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = {};
    if (startDate && endDate) {
      matchStage['data.timestamp'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const analysis = await AnomalyLog.aggregate([
      { $match: matchStage },
      {
        $match: {
          'response.actionsTaken': { $exists: true, $ne: [] }
        }
      },
      {
        $project: {
          sensorId: 1,
          severity: 1,
          responseTime: {
            $subtract: [
              { $arrayElemAt: ['$response.actionsTaken.timestamp', 0] },
              '$data.timestamp'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$severity',
          avgResponseTime: { $avg: '$responseTime' },
          minResponseTime: { $min: '$responseTime' },
          maxResponseTime: { $max: '$responseTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
