import { Request, Response, NextFunction } from 'express';
import { validateRedirectUri } from '../validation/redirectValidator';
import { Session } from 'express-session';

interface CustomSession extends Session {
  userId: string;
}

export const securityChecks = {
  validateSession: (req: Request & { session: CustomSession }) => {
    if (!req.session?.userId) throw new Error('Unauthenticated');
  },

  validateOAuthParams: (req: Request) => {
    if (!validateRedirectUri(req.query.redirect_uri as string)) {
      throw new Error('Invalid redirect URI');
    }
  }
};