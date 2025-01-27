import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error'
      : err.message,
    stack: process.env.NODE_ENV === 'development' 
      ? err.stack 
      : undefined,
    correlationId: req.correlationId // Add UUID tracking
  });
};
