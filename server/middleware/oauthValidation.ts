import StateManager from '../services/stateService';

const stateManager = new StateManager();

export const validateState = async (req, res, next) => {
  const { state } = req.query;
  const userId = req.user?.id; // From session
  
  if (!state || !userId) {
    return res.status(400).json({ error: 'Missing state parameter' });
  }

  const isValid = await stateManager.validateState(state, userId);
  if (!isValid) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }
  
  next();
};