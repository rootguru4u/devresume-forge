import sqsService from '../services/sqs.service';
import { SQS_QUEUES } from '../config/aws';
import Resume from '../models/Resume';
import logger from '../utils/logger';

class ResumeProcessor {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Resume processor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting resume processor');

    while (this.isRunning) {
      try {
        // Receive messages from the resume updates queue
        const messages = await sqsService.receiveMessages(SQS_QUEUES.RESUME_UPDATES);

        for (const message of messages) {
          await this.processMessage(message);
        }
      } catch (error) {
        logger.error('Error in resume processor:', error);
        // Wait before retrying on error
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async processMessage(message) {
    try {
      const { type, data } = JSON.parse(message.Body);
      logger.info(`Processing resume message of type: ${type}`);

      switch (type) {
        case 'RESUME_UPDATE':
          await this.handleResumeUpdate(data);
          break;
        default:
          logger.warn(`Unknown message type: ${type}`);
      }

      // Delete message after successful processing
      await sqsService.deleteMessage(SQS_QUEUES.RESUME_UPDATES, message.ReceiptHandle);

      // Queue PDF generation if needed
      if (data.generatePdf) {
        await sqsService.queuePdfGeneration(data);
      }

      // Queue notification
      await sqsService.queueNotification({
        userId: data.userId,
        type: 'RESUME_UPDATED',
        message: 'Your resume has been updated successfully'
      });

    } catch (error) {
      logger.error('Error processing resume message:', error);
      throw error; // Let the message return to queue for retry
    }
  }

  async handleResumeUpdate(data) {
    const { userId, resumeId, updates } = data;

    // Update resume in database
    const resume = await Resume.findOneAndUpdate(
      { _id: resumeId, userId },
      { $set: updates },
      { new: true }
    );

    if (!resume) {
      throw new Error(`Resume not found: ${resumeId}`);
    }

    logger.info(`Resume updated successfully: ${resumeId}`);
    return resume;
  }

  stop() {
    this.isRunning = false;
    logger.info('Stopping resume processor');
  }
}

export default new ResumeProcessor(); 