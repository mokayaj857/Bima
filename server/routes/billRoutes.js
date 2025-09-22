const express = require('express');
const router = express.Router();
const BillData = require('../models/BillData');
const auth = require('../middleware/auth');
const { PERMISSIONS } = require('../models/User');
const multer = require('multer');
const pdf = require('pdf-parse');

// Middleware to check bill permissions
const checkBillPermission = (req, res, next) => {
  if (!req.user.hasPermission(PERMISSIONS.BILL_VIEW)) {
    return res.status(403).json({ error: 'Insufficient permissions to access bills' });
  }
  next();
};

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed'), false);
    }
  }
});

// GET bills for a user
router.get('/', auth, checkBillPermission, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    let query = { userId };

    if (startDate && endDate) {
      query['billingPeriod.endDate'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const bills = await BillData.find(query)
      .sort({ 'billingPeriod.endDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BillData.countDocuments(query);

    res.json({
      bills,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBills: total
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bill by ID
router.get('/:id', auth, checkBillPermission, async (req, res) => {
  try {
    const bill = await BillData.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST upload and parse bill
router.post('/upload', auth, checkBillPermission, upload.single('bill'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      const pdfData = await pdf(req.file.buffer);
      extractedText = pdfData.text;
    } else {
      // For images, you would use OCR here (tesseract.js)
      // For now, we'll simulate text extraction
      extractedText = 'Simulated OCR text extraction from image';
    }

    // Parse the extracted text to get bill data
    const parsedData = parseBillText(extractedText, req.user._id);

    const bill = new BillData(parsedData);
    await bill.save();

    res.status(201).json({
      message: 'Bill uploaded and parsed successfully',
      bill
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update bill
router.put('/:id', auth, checkBillPermission, async (req, res) => {
  try {
    const bill = await BillData.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json(bill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE bill
router.delete('/:id', auth, checkBillPermission, async (req, res) => {
  try {
    const bill = await BillData.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET bill statistics
router.get('/stats/summary', auth, checkBillPermission, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    const matchStage = {
      userId: userId.toString()
    };

    if (startDate && endDate) {
      matchStage['billingPeriod.endDate'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const stats = await BillData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$charges.totalAmount' },
          totalUsage: { $sum: '$consumption.usageAmount' },
          averageBill: { $avg: '$charges.totalAmount' },
          highestBill: { $max: '$charges.totalAmount' },
          lowestBill: { $min: '$charges.totalAmount' },
          billCount: { $sum: 1 }
        }
      }
    ]);

    res.json(stats[0] || {
      totalAmount: 0,
      totalUsage: 0,
      averageBill: 0,
      highestBill: 0,
      lowestBill: 0,
      billCount: 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET usage trends
router.get('/trends/usage', auth, checkBillPermission, async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const userId = req.user._id;
    const startDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);

    const usageTrends = await BillData.aggregate([
      {
        $match: {
          userId: userId.toString(),
          'billingPeriod.endDate': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$billingPeriod.endDate' },
            month: { $month: '$billingPeriod.endDate' }
          },
          totalUsage: { $sum: '$consumption.usageAmount' },
          averageCost: { $avg: '$charges.totalAmount' },
          billCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(usageTrends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET cost comparison
router.get('/analysis/cost-comparison', auth, checkBillPermission, async (req, res) => {
  try {
    const userId = req.user._id;
    const currentYear = new Date().getFullYear();

    const comparison = await BillData.aggregate([
      {
        $match: {
          userId: userId.toString(),
          'billingPeriod.endDate': {
            $gte: new Date(currentYear - 1, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: { $year: '$billingPeriod.endDate' },
          totalAmount: { $sum: '$charges.totalAmount' },
          totalUsage: { $sum: '$consumption.usageAmount' },
          billCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json(comparison);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper function to parse bill text (simplified version)
function parseBillText(text, userId) {
  // This is a simplified parser - in production, you'd use more sophisticated NLP
  const lines = text.split('\n');
  let billData = {
    userId,
    billNumber: extractBillNumber(lines),
    provider: extractProvider(lines),
    billingPeriod: extractBillingPeriod(lines),
    charges: extractCharges(lines),
    consumption: extractConsumption(lines),
    payment: extractPaymentInfo(lines)
  };

  // Calculate totals
  billData.charges.totalAmount = Object.values(billData.charges).reduce((sum, charge) => {
    return sum + (charge.total || 0);
  }, 0);

  return billData;
}

// Helper functions for text extraction
function extractBillNumber(lines) {
  const billNumberLine = lines.find(line =>
    line.toLowerCase().includes('bill number') ||
    line.toLowerCase().includes('invoice number') ||
    line.toLowerCase().includes('account number')
  );
  return billNumberLine ? billNumberLine.split(':')[1]?.trim() || 'UNKNOWN' : 'UNKNOWN';
}

function extractProvider(lines) {
  const providerLine = lines.find(line =>
    line.toLowerCase().includes('water company') ||
    line.toLowerCase().includes('utility') ||
    line.toLowerCase().includes('municipality')
  );
  return providerLine ? 'water_company' : 'utility_company';
}

function extractBillingPeriod(lines) {
  // Simplified - would need more sophisticated date parsing
  return {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  };
}

function extractCharges(lines) {
  // Simplified charge extraction
  return {
    waterUsage: { amount: 100, rate: 0.05, total: 5.00 },
    sewerage: { amount: 100, rate: 0.03, total: 3.00 },
    environmental: { amount: 100, rate: 0.01, total: 1.00 },
    taxes: { amount: 9, rate: 0.08, total: 0.72 }
  };
}

function extractConsumption(lines) {
  return {
    previousReading: 1000,
    currentReading: 1100,
    usageAmount: 100,
    unit: 'cubic_meters'
  };
}

function extractPaymentInfo(lines) {
  return {
    status: 'pending',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    paymentMethod: 'auto'
  };
}

module.exports = router;
