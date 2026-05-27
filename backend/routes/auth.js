import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medimind_cyber_secure_jwt_token_2026_prediction_prevent_protect';

// REGISTER NEW PATIENT
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Please provide name, email, and password." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        bloodType: user.bloodType,
        weight: user.weight,
        height: user.height,
        waterTarget: user.waterTarget,
        sleepTarget: user.sleepTarget
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// LOG IN PATIENT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide email and password." });
    }

    // Check user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: "Access granted. Welcome back.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        bloodType: user.bloodType,
        weight: user.weight,
        height: user.height,
        waterTarget: user.waterTarget,
        sleepTarget: user.sleepTarget
      }
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET PROFILE INFO (PROTECTED)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "Patient profile not found." });
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE PROFILE (PROTECTED)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, age, gender, bloodType, weight, height, waterTarget, sleepTarget } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "Patient profile not found." });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (bloodType !== undefined) user.bloodType = bloodType;
    if (weight !== undefined) user.weight = weight;
    if (height !== undefined) user.height = height;
    if (waterTarget !== undefined) user.waterTarget = waterTarget;
    if (sleepTarget !== undefined) user.sleepTarget = sleepTarget;

    await user.save();

    return res.json({
      success: true,
      message: "Holographic bio-profile synchronized successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        bloodType: user.bloodType,
        weight: user.weight,
        height: user.height,
        waterTarget: user.waterTarget,
        sleepTarget: user.sleepTarget
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
