import  revocationManager  from '../services/revocationService';

export const checkRevocation = async (req, res, next) => {
  if (await revocationManager.isRevoked(req.cookies.access_token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }
  next();
};
