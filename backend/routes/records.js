import express from 'express';
import { HealthRecord } from '../models/index.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL DIAGNOSTIC RECORDS FOR THE AUTHENTICATED PATIENT
router.get('/', authenticateToken, async (req, res) => {
  try {
    const records = await HealthRecord.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    // Parse serialized text columns back into JSON structures for React frontend consumption
    const parsedRecords = records.map(rec => ({
      ...rec.toJSON(),
      inputData: JSON.parse(rec.inputData),
      suggestions: JSON.parse(rec.suggestions)
    }));

    return res.json({
      success: true,
      records: parsedRecords
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// LOG A NEW DIAGNOSTIC OR RISK PREDICTION RECORD
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, inputData, riskScore, category, suggestions } = req.body;

    if (!type || riskScore === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: "Missing required record parameters (type, riskScore, category)."
      });
    }

    const record = await HealthRecord.create({
      userId: req.user.id,
      type,
      inputData: typeof inputData === 'object' ? JSON.stringify(inputData) : inputData,
      riskScore: parseFloat(riskScore),
      category,
      suggestions: typeof suggestions === 'object' ? JSON.stringify(suggestions) : suggestions
    });

    return res.status(201).json({
      success: true,
      message: "Health diagnostic metric indexed successfully.",
      record: {
        ...record.toJSON(),
        inputData: JSON.parse(record.inputData),
        suggestions: JSON.parse(record.suggestions)
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
