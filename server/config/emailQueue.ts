import Queue from 'bull';
import { sendEmail } from '../services/emailService';
import { logger } from '../logger';

const emailQueue = new Queue('email-queue', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

emailQueue.process(async (job) => {
  try {
    await sendEmail(job.data.to, job.data.subject, job.data.text);
    logger.info(`Email sent to ${job.data.to}`);
  } catch (error) {
    logger.error(`Error sending email to ${job.data.to}:`, error);
    throw error;
  }
});

export async function enqueueEmails(emailJobs: { to: string; subject: string; text: string }[]) {
  try {
    await emailQueue.addBulk(emailJobs.map(job => ({ data: job })));
    logger.info(`Enqueued ${emailJobs.length} emails`);
  } catch (error) {
    logger.error('Error enqueuing emails:', error);
    throw error;
  }
}
