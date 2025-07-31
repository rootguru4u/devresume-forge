import { 
  SendMessageCommand, 
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SendMessageBatchCommand
} from '@aws-sdk/client-sqs';
import { sqsClient, SQS_QUEUES } from '../config/aws';
import logger from '../utils/logger';

class SQSService {
  constructor() {
    this.client = sqsClient;
  }

  // Send a single message to a queue
  async sendMessage(queueUrl, message, groupId = null) {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
        ...(groupId && {
          MessageGroupId: groupId,
          MessageDeduplicationId: Date.now().toString()
        })
      });

      const response = await this.client.send(command);
      logger.info(`Message sent to SQS: ${response.MessageId}`);
      return response;
    } catch (error) {
      logger.error('Error sending message to SQS:', error);
      throw error;
    }
  }

  // Send multiple messages in batch
  async sendBatchMessages(queueUrl, messages) {
    try {
      const entries = messages.map((msg, index) => ({
        Id: `msg${index}`,
        MessageBody: JSON.stringify(msg),
        ...(msg.groupId && {
          MessageGroupId: msg.groupId,
          MessageDeduplicationId: `${msg.groupId}-${Date.now()}-${index}`
        })
      }));

      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries
      });

      const response = await this.client.send(command);
      logger.info(`Batch messages sent to SQS: ${response.Successful.length} successful`);
      return response;
    } catch (error) {
      logger.error('Error sending batch messages to SQS:', error);
      throw error;
    }
  }

  // Receive messages from queue
  async receiveMessages(queueUrl, maxMessages = 10) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMessages,
        WaitTimeSeconds: 20, // Long polling
        MessageAttributeNames: ['All']
      });

      const response = await this.client.send(command);
      return response.Messages || [];
    } catch (error) {
      logger.error('Error receiving messages from SQS:', error);
      throw error;
    }
  }

  // Delete a message after processing
  async deleteMessage(queueUrl, receiptHandle) {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle
      });

      await this.client.send(command);
      logger.info('Message deleted from SQS');
    } catch (error) {
      logger.error('Error deleting message from SQS:', error);
      throw error;
    }
  }

  // Queue a resume update
  async queueResumeUpdate(resumeData) {
    return this.sendMessage(
      SQS_QUEUES.RESUME_UPDATES,
      {
        type: 'RESUME_UPDATE',
        data: resumeData,
        timestamp: new Date().toISOString()
      },
      `user-${resumeData.userId}`
    );
  }

  // Queue PDF generation
  async queuePdfGeneration(resumeData) {
    return this.sendMessage(
      SQS_QUEUES.PDF_GENERATION,
      {
        type: 'PDF_GENERATION',
        data: resumeData,
        timestamp: new Date().toISOString()
      }
    );
  }

  // Queue notification
  async queueNotification(notification) {
    return this.sendMessage(
      SQS_QUEUES.NOTIFICATIONS,
      {
        type: 'NOTIFICATION',
        data: notification,
        timestamp: new Date().toISOString()
      }
    );
  }
}

export default new SQSService(); 