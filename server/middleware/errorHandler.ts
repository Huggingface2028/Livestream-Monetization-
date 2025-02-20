import { ErrorRequestHandler } from 'express';
import { logger } from '../logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    error: 'An unexpected error occurred',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
