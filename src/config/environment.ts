// src/config/environment.ts

import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const hostname = process.env.DB_HOST;
const database = process.env.DB_DATABASE;
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432; // Default to 5432 for PostgreSQL if not provided
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

// Validate environment variables
if (!hostname || !database || !username || !password) {
  throw new Error('Missing required environment variables for database configuration');
}

export const dbConfig = {
  host: hostname,
  user: username,
  password: password,
  database: database,
  port: port,
  connectionTimeoutMillis: 30000, // Increased timeout duration
  idleTimeoutMillis: 300000, // Idle timeout for connections
  max: 10, // Max connections in pool
  min: 2, // Min connections in pool
};

export const createDbConnection = async (): Promise<Pool> => {
  const pool = new Pool(dbConfig);

  try {
    // Attempt to connect to the PostgreSQL database
    await pool.connect();
    console.log('Connected to the PostgreSQL database!');
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }

  // Gracefully shutdown by closing the connection pool on process termination
  process.on('SIGINT', async () => {
    console.log('Shutting down, closing database connection...');
    await pool.end(); // Close all connections in the pool
    console.log('Database connection closed');
    process.exit(0);
  });

  return pool;
};

