import { SQSClient } from '@aws-sdk/client-sqs';

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const SQS_QUEUES = {
  RESUME_UPDATES: process.env.SQS_RESUME_UPDATES_URL,
  PDF_GENERATION: process.env.SQS_PDF_GENERATION_URL,
  NOTIFICATIONS: process.env.SQS_NOTIFICATIONS_URL
}; 