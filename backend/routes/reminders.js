import express from 'express';
import { Reminder } from '../models/index.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET ALL MEDICINE REMINDERS
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: { userId: req.user.id },
      order: [['time', 'ASC']]
    });
    return res.json({ success: true, reminders });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE NEW REMINDER
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { medName, dosage, frequency, time } = req.body;

    if (!medName || !time) {
      return res.status(400).json({ success: false, error: "Medicine name and dosage intake time are required." });
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      medName,
      dosage: dosage || '1 tablet',
      frequency: frequency || 'Once daily',
      time
    });

    return res.status(201).json({
      success: true,
      message: "Medical alert scheduled successfully.",
      reminder
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// TOGGLE REMINDER ACTIVE STATE
router.put('/toggle/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ success: false, error: "Reminder alert not found." });
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    return res.json({
      success: true,
      message: `Medicine alert ${reminder.isActive ? 'activated' : 'deactivated'}.`,
      reminder
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// MARK MEDICATION AS TAKEN TODAY / RESET TAKEN STATE
router.put('/complete/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!reminder) {
      return res.status(404).json({ success: false, error: "Reminder not found." });
    }

    reminder.completedToday = !reminder.completedToday;
    await reminder.save();

    return res.json({
      success: true,
      message: reminder.completedToday ? "Dose taken logged. Stay healthy!" : "Dose logs reversed.",
      reminder
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE REMINDER
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedCount = await Reminder.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, error: "Reminder not found." });
    }

    return res.json({
      success: true,
      message: "Medical alert scheduler removed."
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// MANUALLY OR PROGRAMMATICALLY RESET COMPLETIONS FOR ALL USERS (E.G. CALLED AT MIDNIGHT)
router.post('/reset-completion', authenticateToken, async (req, res) => {
  try {
    await Reminder.update(
      { completedToday: false },
      { where: { userId: req.user.id } }
    );
    return res.json({ success: true, message: "Medication clocks cycled for the new day." });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
