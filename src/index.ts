// src/index.ts

import express from 'express';
import { Pool } from 'pg'; // PostgreSQL client
import { dbConfig } from './config/environment';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { userRoutes } from './routes/user.route';
import { productRoutes } from './routes/product.route';
import { inventoryRoutes } from './routes/inventory.route';

const app = express();
const port = process.env.PORT || 3008;

// Enhanced middleware setup
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

let dbPool: Pool;

// Retry mechanism for database connection
const createDbConnection = async (): Promise<Pool> => {
  const pool = new Pool(dbConfig);

  let attempts = 0;
  const maxAttempts = 5;
  const delay = 500; // Delay between retries in ms

  while (attempts < maxAttempts) {
    try {
      const client = await pool.connect();
      console.log('Database connection established');
      client.release(); // Release the connection back to the pool
      return pool;
    } catch (error) {
      console.error(`Database connection attempt ${attempts + 1} failed:`, error);
      attempts += 1;
      if (attempts < maxAttempts) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Maximum connection attempts reached');
        throw error; // After max attempts, throw the error
      }
    }
  }

  return pool;
};

// Error handling middleware
const errorHandler = (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

// 404 handler
const notFoundHandler = (req: express.Request, res: express.Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
};

// Initialize server
const initializeServer = async () => {
  try {
    dbPool = await createDbConnection(); // Initialize the database connection with retry logic

    // Base route
    app.get('/', (req, res) => {
      res.json({ message: 'API is running' });
    });

    // Mount user routes
    app.use('/api/users', userRoutes(dbPool));
    app.use('/api/', productRoutes(dbPool));
    app.use('/api/', inventoryRoutes(dbPool));

    // Middleware for error handling
    app.use(errorHandler);

    // 404 handler
    app.use(notFoundHandler);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
initializeServer();
