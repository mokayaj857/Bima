const express = require('express');
const router = express.Router();
const Recommendation = require('../models/Recommendation');
const SensorData = require('../models/SensorData');
const BillData = require('../models/BillData');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../models/User');

// Middleware to check AI permissions
const checkAIPermission = (req, res, next) => {
  if (!req.user.hasPermission(PERMISSIONS.DATA_VIEW)) {
    return res.status(403).json({ error: 'Insufficient permissions to access AI features' });
  }
  next();
};

// GET recommendations for a user
router.get('/', auth, checkAIPermission, async (req, res) => {
  try {
    const { type, category, status = 'active', limit = 10 } = req.query;
    const userId = req.user._id;

    let query = { userId, status };

    if (type) query.type = type;
    if (category) query.category = category;

    const recommendations = await Recommendation.find(query)
      .sort({ priority: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username email');

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recommendation by ID
router.get('/:id', auth, checkAIPermission, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate recommendations
router.post('/generate', auth, checkAIPermission, async (req, res) => {
  try {
    const { sensorId, type = 'cost_optimization' } = req.body;
    const userId = req.user._id;

    // Generate recommendations based on sensor data and usage patterns
    const recommendations = await generateRecommendations(userId, sensorId, type);

    // Save recommendations to database
    const savedRecommendations = [];
    for (const rec of recommendations) {
      const recommendation = new Recommendation(rec);
      await recommendation.save();
      savedRecommendations.push(recommendation);
    }

    res.status(201).json({
      message: 'Recommendations generated successfully',
      recommendations: savedRecommendations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update recommendation status
router.put('/:id/status', auth, checkAIPermission, async (req, res) => {
  try {
    const { status, effectiveness } = req.body;

    const updateData = { status, updatedAt: new Date() };

    if (effectiveness) {
      updateData.effectiveness = effectiveness;
    }

    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json(recommendation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE recommendation
router.delete('/:id', auth, checkAIPermission, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.json({ message: 'Recommendation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recommendation statistics
router.get('/stats/summary', auth, checkAIPermission, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const matchStage = { userId: userId.toString() };
    if (startDate && endDate) {
      matchStage.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const stats = await Recommendation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          implemented: {
            $sum: { $cond: [{ $eq: ['$status', 'implemented'] }, 1, 0] }
          },
          avgPriority: { $avg: { $cond: [{ $eq: ['$priority', 'critical'] }, 4, { $cond: [{ $eq: ['$priority', 'high'] }, 3, { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1]}]}]} }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET cost savings from implemented recommendations
router.get('/savings/cost', auth, checkAIPermission, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    const matchStage = {
      userId: userId.toString(),
      status: 'implemented'
    };

    if (startDate && endDate) {
      matchStage['effectiveness.implementationDate'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const savings = await Recommendation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCostSavings: { $sum: '$effectiveness.actualSavings.cost' },
          totalWaterSavings: { $sum: '$effectiveness.actualSavings.water' },
          totalCarbonReduction: { $sum: '$effectiveness.actualSavings.carbon' },
          implementedCount: { $sum: 1 },
          avgEffectiveness: { $avg: '$effectiveness.score' }
        }
      }
    ]);

    res.json(savings[0] || {
      totalCostSavings: 0,
      totalWaterSavings: 0,
      totalCarbonReduction: 0,
      implementedCount: 0,
      avgEffectiveness: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recommendations by priority
router.get('/priority/:level', auth, checkAIPermission, async (req, res) => {
  try {
    const { level } = req.params;
    const userId = req.user._id;

    const recommendations = await Recommendation.find({
      userId,
      priority: level,
      status: 'active'
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST bulk update recommendations
router.post('/bulk-update', auth, checkAIPermission, async (req, res) => {
  try {
    const { recommendationIds, updates } = req.body;
    const userId = req.user._id;

    const result = await Recommendation.updateMany(
      {
        _id: { $in: recommendationIds },
        userId
      },
      { ...updates, updatedAt: new Date() }
    );

    res.json({
      message: 'Recommendations updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to generate recommendations based on data analysis
async function generateRecommendations(userId, sensorId, type) {
  const recommendations = [];

  try {
    // Get recent sensor data for analysis
    const recentData = await SensorData.find({
      sensorId: sensorId || { $exists: true }
    })
    .sort({ timestamp: -1 })
    .limit(100);

    // Get recent bill data
    const recentBills = await BillData.find({ userId })
      .sort({ 'billingPeriod.endDate': -1 })
      .limit(5);

    // Generate cost optimization recommendations
    if (type === 'cost_optimization' || type === 'all') {
      if (recentBills.length > 1) {
        const avgBill = recentBills.reduce((sum, bill) => sum + bill.charges.totalAmount, 0) / recentBills.length;
        const latestBill = recentBills[0];

        if (latestBill.charges.totalAmount > avgBill * 1.2) {
          recommendations.push({
            userId,
            sensorId,
            type: 'cost_optimization',
            category: 'immediate',
            title: 'High Water Usage Detected',
            description: 'Your latest bill shows higher than average water consumption',
            priority: 'high',
            details: {
              problem: 'Water usage has increased by more than 20% compared to your average',
              solution: 'Check for leaks, optimize irrigation schedules, and consider water-efficient fixtures',
              benefits: ['Reduce water bills', 'Lower environmental impact', 'Prevent potential leaks'],
              implementation: {
                steps: [
                  'Conduct a leak inspection of your property',
                  'Install water-efficient showerheads and faucets',
                  'Adjust irrigation timers based on weather',
                  'Monitor daily usage with smart meters'
                ],
                timeline: '2-4 weeks',
                difficulty: 'medium'
              },
              cost: {
                estimated: 150,
                paybackPeriod: '3-6 months'
              },
              impact: {
                waterSavings: { amount: 20, unit: 'percent', percentage: 20 },
                costSavings: { amount: avgBill * 0.2, currency: 'USD', percentage: 20 },
                carbonReduction: { amount: 15, unit: 'percent', percentage: 15 }
              }
            },
            metadata: {
              algorithm: 'usage_analysis',
              confidence: 0.85,
              generatedAt: new Date(),
              expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
            }
          });
        }
      }
    }

    // Generate maintenance recommendations
    if (type === 'maintenance' || type === 'all') {
      // Check for sensors that might need maintenance
      const oldData = recentData.filter(data => {
        const age = Date.now() - new Date(data.timestamp).getTime();
        return age > 7 * 24 * 60 * 60 * 1000; // Older than 7 days
      });

      if (oldData.length > recentData.length * 0.5) {
        recommendations.push({
          userId,
          sensorId,
          type: 'maintenance',
          category: 'short_term',
          title: 'Sensor Maintenance Required',
          description: 'Some sensors may need calibration or maintenance',
          priority: 'medium',
          details: {
            problem: 'Irregular sensor readings detected',
            solution: 'Schedule maintenance and calibration for water monitoring sensors',
            benefits: ['Improve accuracy', 'Prevent false alarms', 'Ensure reliable monitoring'],
            implementation: {
              steps: [
                'Contact maintenance team',
                'Schedule sensor calibration',
                'Test sensor accuracy',
                'Update firmware if needed'
              ],
              timeline: '1-2 weeks',
              difficulty: 'easy'
            },
            cost: {
              estimated: 300,
              paybackPeriod: '1-2 months'
            },
            impact: {
              waterSavings: { amount: 5, unit: 'percent', percentage: 5 },
              costSavings: { amount: 50, currency: 'USD', percentage: 10 },
              carbonReduction: { amount: 3, unit: 'percent', percentage: 3 }
            }
          },
          metadata: {
            algorithm: 'sensor_analysis',
            confidence: 0.75,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });
      }
    }

    // Generate behavioral recommendations
    if (type === 'behavioral_change' || type === 'all') {
      recommendations.push({
        userId,
        sensorId,
        type: 'behavioral_change',
        category: 'medium_term',
        title: 'Optimize Water Usage Patterns',
        description: 'Adjust your water usage habits for better efficiency',
        priority: 'low',
        details: {
          problem: 'Water usage patterns could be optimized',
          solution: 'Implement water conservation habits and smart scheduling',
          benefits: ['Reduce utility costs', 'Environmental conservation', 'Better resource management'],
          implementation: {
            steps: [
              'Use dishwasher only for full loads',
              'Take shorter showers',
              'Fix dripping faucets immediately',
              'Water garden during cooler hours'
            ],
            timeline: '1-3 months',
            difficulty: 'easy'
          },
          cost: {
            estimated: 0,
            paybackPeriod: 'immediate'
          },
          impact: {
            waterSavings: { amount: 15, unit: 'percent', percentage: 15 },
            costSavings: { amount: 100, currency: 'USD', percentage: 15 },
            carbonReduction: { amount: 10, unit: 'percent', percentage: 10 }
          }
        },
        metadata: {
          algorithm: 'pattern_analysis',
          confidence: 0.65,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
        }
      });
    }

  } catch (error) {
    console.error('Error generating recommendations:', error);
  }

  return recommendations;
}

module.exports = router;
