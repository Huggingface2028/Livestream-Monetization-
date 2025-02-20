import { RequestHandler } from 'express';
import { logger } from '../logger';

export const pkceSessionMiddleware: RequestHandler = (req, res, next) => {
  // Implement PKCE session handling here
  logger.info('PKCE session middleware');
  next();
};
