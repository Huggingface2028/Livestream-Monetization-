import { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../logger';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

export const rateLimiterMiddleware: RequestHandler = (req, res, next) => {
  limiter(req, res, next);
};
