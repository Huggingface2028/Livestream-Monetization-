import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { checkRevocation } from '../validation/tokenValidation';

const JWT_CONFIG = {
  accessToken: {
    expiresIn: '15m',
    algorithm: 'RS256',
    privateKey: process.env.JWT_ACCESS_PRIVATE_KEY, // Separate keys
    publicKey: process.env.JWT_ACCESS_PUBLIC_KEY
  },
  refreshToken: {
    expiresIn: '7d',
    algorithm: 'RS256',
    privateKey: process.env.JWT_REFRESH_PRIVATE_KEY, // Separate keys
    publicKey: process.env.JWT_REFRESH_PUBLIC_KEY
  }
};

export const generateTokens = (payload: object) => ({
  accessToken: jwt.sign(payload, JWT_CONFIG.accessToken.privateKey, {
    algorithm: JWT_CONFIG.accessToken.algorithm,
    expiresIn: JWT_CONFIG.accessToken.expiresIn
  }),
  refreshToken: jwt.sign(payload, JWT_CONFIG.refreshToken.privateKey, {
    algorithm: JWT_CONFIG.refreshToken.algorithm,
    expiresIn: JWT_CONFIG.refreshToken.expiresIn
  })
});


// Use public key for verification
export const verifyToken = (token: string) => 
  jwt.verify(token, process.env.JWT_PUBLIC_KEY);


type AuthRequired = (req: Request, res: Response, next: NextFunction) => void;

const authRequired: AuthRequired = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check revocation first
  if (await checkRevocation(accessToken, res.status, req.headers)) {
    return res.status(401).json({ error: 'Token revoked' });
  }

  try {
    const verified = jwt.verify(accessToken, JWT_CONFIG.accessToken.publicKey);
    req.userId = verified.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid access token' });
  }
};


export { authRequired };
