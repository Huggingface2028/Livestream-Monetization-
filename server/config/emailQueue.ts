import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
const sqs = new SQSClient({ region: process.env.AWS_REGION });

const MAX_SQS_BATCH_SIZE = 10;

export const enqueueEmails = async (emails: Array<{ to: string, subject: string, text: string }>) => {
  const chunks = chunkArray(emails, MAX_SQS_BATCH_SIZE);
  
  const results = await Promise.allSettled(
    chunks.map(async (chunk, index) => {
      const entries = chunk.map((email, i) => ({
        Id: `email-${index}-${i}`,
        MessageBody: JSON.stringify(email),
        MessageAttributes: {
          service: { 
            DataType: "String",
            StringValue: "email-service"
          }
        }
      }));

      try {
        return await sqs.send(new SendMessageBatchCommand({
          QueueUrl: process.env.EMAIL_QUEUE_URL,
          Entries: entries
        }));
      } catch (error) {
        console.error(`Failed to send batch ${index}:`, error);
        throw error;
      }
    })
  );

  const failedBatches = results.filter(r => r.status === 'rejected');
  if (failedBatches.length > 0) {
    throw new Error(`${failedBatches.length} email batches failed to enqueue`);
  }
};

function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from(
    { length: Math.ceil(array.length / size) },
    (_, index) => array.slice(index * size, (index + 1) * size)
  );
}