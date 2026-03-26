import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const dbConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || '01',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// If DATABASE_URL is provided (e.g. from Aiven), use it
const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  dbConfig.uri = connectionString;
  // Aiven requires SSL, let's configure it if a CA path is provided
  if (process.env.DB_CA_PATH) {
    dbConfig.ssl = {
      ca: fs.readFileSync(path.resolve(process.cwd(), process.env.DB_CA_PATH)),
      rejectUnauthorized: true
    };
  }
}

const finalConfig: any = connectionString ? {
  uri: connectionString,
  ssl: dbConfig.ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
} : dbConfig;

export const pool = mysql.createPool(finalConfig);

export const initDb = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
  }
};
