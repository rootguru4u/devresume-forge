import Resume from '../models/Resume';
import sqsService from '../services/sqs.service';
import logger from '../utils/logger';

export const createResume = async (req, res) => {
  try {
    const { userId } = req.user;
    const resumeData = { ...req.body, userId };

    // Create resume in database
    const resume = await Resume.create(resumeData);

    // Queue resume processing
    await sqsService.queueResumeUpdate({
      userId,
      resumeId: resume._id,
      updates: resumeData,
      generatePdf: true
    });

    res.status(201).json({
      success: true,
      data: resume,
      message: 'Resume created successfully. PDF generation in progress.'
    });
  } catch (error) {
    logger.error('Error creating resume:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating resume'
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updates = req.body;

    // Verify resume exists and belongs to user
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Queue resume update
    await sqsService.queueResumeUpdate({
      userId,
      resumeId: id,
      updates,
      generatePdf: req.body.generatePdf || false
    });

    res.status(200).json({
      success: true,
      message: 'Resume update queued successfully'
    });
  } catch (error) {
    logger.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating resume'
    });
  }
};

export const generatePDF = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    // Verify resume exists and belongs to user
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    // Queue PDF generation
    await sqsService.queuePdfGeneration({
      userId,
      resumeId: id,
      template: req.body.template || 'default'
    });

    res.status(200).json({
      success: true,
      message: 'PDF generation queued successfully'
    });
  } catch (error) {
    logger.error('Error queuing PDF generation:', error);
    res.status(500).json({
      success: false,
      error: 'Error generating PDF'
    });
  }
};

export const getResume = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    logger.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching resume'
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const resume = await Resume.findOneAndDelete({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting resume'
    });
  }
}; 