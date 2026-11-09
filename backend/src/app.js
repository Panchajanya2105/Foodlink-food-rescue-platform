import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeNoSql } from './middleware/sanitize.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// General API rate limiter (disabled during testing)
if (config.env !== 'test') {
  app.use('/api', apiLimiter);
  app.use(morgan('dev'));
}

// Cookie parser for HttpOnly authentication tokens
app.use(cookieParser());

// Request parsers with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL injection sanitizer
app.use(sanitizeNoSql);

// API Base Route
app.use('/api', apiRouter);

// 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

export default app;
