import { AuditLog } from '../models/AuditLog';

export const authLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    const auditEntry = {
      timestamp: new Date(),
      userId: req.user?.id,
      eventType: req.authEventType,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      success: res.statusCode < 400,
      metadata: req.authMetadata,
      duration: Date.now() - start
    };

    await AuditLog.create(auditEntry);
  });

  next();
};
