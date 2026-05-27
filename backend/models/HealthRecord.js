import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HealthRecord = sequelize.define('HealthRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // 'symptom', 'diabetes', 'heart'
    allowNull: false
  },
  inputData: {
    type: DataTypes.TEXT, // JSON serialized input parameters
    allowNull: false,
    defaultValue: '{}'
  },
  riskScore: {
    type: DataTypes.FLOAT, // Risk percentage or health score
    allowNull: false
  },
  category: {
    type: DataTypes.STRING, // e.g. 'Low Risk', 'High Risk', 'Mild Severity'
    allowNull: false
  },
  suggestions: {
    type: DataTypes.TEXT, // JSON serialized array of doctor guidelines
    allowNull: false,
    defaultValue: '[]'
  }
});

export default HealthRecord;
