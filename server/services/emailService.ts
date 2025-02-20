import nodemailer from 'nodemailer';
import { logger } from '../logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    });
    logger.info('Message sent: %s', info.messageId);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}
