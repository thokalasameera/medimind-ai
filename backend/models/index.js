import sequelize from '../config/database.js';
import User from './User.js';
import HealthRecord from './HealthRecord.js';
import Reminder from './Reminder.js';
import DailyMetric from './DailyMetric.js';

// Define Associations
User.hasMany(HealthRecord, { foreignKey: 'userId', onDelete: 'CASCADE' });
HealthRecord.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Reminder, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reminder.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(DailyMetric, { foreignKey: 'userId', onDelete: 'CASCADE' });
DailyMetric.belongsTo(User, { foreignKey: 'userId' });

export {
  sequelize,
  User,
  HealthRecord,
  Reminder,
  DailyMetric
};
