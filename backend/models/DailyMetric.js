import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DailyMetric = sequelize.define('DailyMetric', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  waterIntake: {
    type: DataTypes.FLOAT, // in ml
    defaultValue: 0
  },
  sleepHours: {
    type: DataTypes.FLOAT, // in hours
    defaultValue: 0
  },
  sleepQuality: {
    type: DataTypes.STRING, // 'Excellent', 'Good', 'Fair', 'Poor'
    defaultValue: 'Good'
  },
  restingHeartRate: {
    type: DataTypes.INTEGER, // in bpm
    defaultValue: 72
  }
});

export default DailyMetric;
