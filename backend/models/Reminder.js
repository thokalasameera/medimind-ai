import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  medName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dosage: {
    type: DataTypes.STRING,
    defaultValue: '1 tablet'
  },
  frequency: {
    type: DataTypes.STRING,
    defaultValue: 'Once daily' // 'Once daily', 'Twice daily', 'Three times daily'
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '09:00' // HH:MM 24-hr format
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  completedToday: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

export default Reminder;
