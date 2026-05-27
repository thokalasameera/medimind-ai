import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'medimind_cyber_secure_jwt_token_2026_prediction_prevent_protect';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Authentication token missing. Access denied."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id, email, name
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired session token. Please log in again."
    });
  }
};
