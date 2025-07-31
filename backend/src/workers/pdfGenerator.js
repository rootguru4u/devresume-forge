import sqsService from '../services/sqs.service';
import { SQS_QUEUES } from '../config/aws';
import Resume from '../models/Resume';
import logger from '../utils/logger';

class PDFGenerator {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('PDF generator is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting PDF generator');

    while (this.isRunning) {
      try {
        // Receive messages from the PDF generation queue
        const messages = await sqsService.receiveMessages(SQS_QUEUES.PDF_GENERATION);

        for (const message of messages) {
          await this.processMessage(message);
        }
      } catch (error) {
        logger.error('Error in PDF generator:', error);
        // Wait before retrying on error
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async processMessage(message) {
    try {
      const { data } = JSON.parse(message.Body);
      logger.info(`Processing PDF generation for resume: ${data.resumeId}`);

      // Generate PDF
      const pdfUrl = await this.generatePDF(data);

      // Update resume with PDF URL
      await Resume.findByIdAndUpdate(data.resumeId, {
        $set: { pdfUrl }
      });

      // Delete message after successful processing
      await sqsService.deleteMessage(SQS_QUEUES.PDF_GENERATION, message.ReceiptHandle);

      // Queue notification
      await sqsService.queueNotification({
        userId: data.userId,
        type: 'PDF_GENERATED',
        message: 'Your resume PDF has been generated successfully',
        data: { pdfUrl }
      });

    } catch (error) {
      logger.error('Error processing PDF generation:', error);
      throw error; // Let the message return to queue for retry
    }
  }

  async generatePDF(data) {
    // TODO: Implement actual PDF generation logic
    // This is a placeholder for the PDF generation implementation
    logger.info('Generating PDF for resume:', data.resumeId);
    
    // Simulate PDF generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock PDF URL
    return `https://storage.devresume.com/${data.userId}/${data.resumeId}.pdf`;
  }

  stop() {
    this.isRunning = false;
    logger.info('Stopping PDF generator');
  }
}

export default new PDFGenerator(); 