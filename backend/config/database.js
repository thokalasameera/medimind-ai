import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'mysql') {
  console.log("⚡ [DB] Connecting to MySQL database...");
  sequelize = new Sequelize(
    process.env.DB_NAME || 'medimind_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      logging: false, // Turn off verbose logs for premium console feel
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.log("⚡ [DB] Connecting to SQLite database...");
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_FILE || 'database.sqlite',
    logging: false
  });
}

export default sequelize;
