export const rotateSession = (req, res, next) => {
  const temp = req.session;
  
  req.session.regenerate((err) => {
    if (err) return next(err);
    
    // Preserve only necessary session data
    req.session.userId = temp.userId;
    req.session.token_hash = temp.token_hash;
    
    next();
  });
};
