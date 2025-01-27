import { Consumer } from 'sqs-consumer';
import { sendEmail } from './services/emailService';

const worker = Consumer.create({
  queueUrl: process.env.EMAIL_QUEUE_URL,
  handleMessage: async (message) => {
    try {
      const { to, subject, text } = JSON.parse(message.Body);
      await sendEmail(to, subject, text);
      console.log('Successfully sent email to:', to);
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error; // SQS will automatically retry
    }
  },
  batchSize: 10, // Process 10 messages at once
  visibilityTimeout: 30 // 30 seconds to process before retry
});

worker.on('error', (err) => console.error('Queue error:', err));
worker.on('processing_error', (err) => console.error('Processing error:', err));

export const createWorker = () => worker.start();
