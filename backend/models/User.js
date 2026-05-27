import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  gender: {
    type: DataTypes.STRING,
    defaultValue: 'Not Specified'
  },
  weight: {
    type: DataTypes.FLOAT,
    defaultValue: 70.0 // in kg
  },
  height: {
    type: DataTypes.FLOAT,
    defaultValue: 170.0 // in cm
  },
  bloodType: {
    type: DataTypes.STRING,
    defaultValue: 'O+'
  },
  waterTarget: {
    type: DataTypes.FLOAT,
    defaultValue: 3000 // ml
  },
  sleepTarget: {
    type: DataTypes.FLOAT,
    defaultValue: 8.0 // hours
  }
});

export default User;
