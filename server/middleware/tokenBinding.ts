import { RequestHandler } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';

export const tokenBindingMiddleware: RequestHandler = (req, res, next) => {
  const tokenId = uuidv4();
  req.tokenId = tokenId;

  res.setHeader('Token-Id', tokenId);

  logger.info(`Token ID ${tokenId} generated for request ${req.method} ${req.originalUrl}`);

  next();
};
