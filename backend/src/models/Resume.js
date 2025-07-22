const mongoose = require('mongoose');

// Schema for work experience entries
const experienceSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  current: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  achievements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Achievement cannot exceed 500 characters']
  }],
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot exceed 50 characters']
  }]
}, {
  _id: true
});

// Schema for education entries
const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [100, 'Degree cannot exceed 100 characters']
  },
  fieldOfStudy: {
    type: String,
    trim: true,
    maxlength: [100, 'Field of study cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  current: {
    type: Boolean,
    default: false
  },
  gpa: {
    type: Number,
    min: [0, 'GPA cannot be negative'],
    max: [4.0, 'GPA cannot exceed 4.0']
  },
  honors: [{
    type: String,
    trim: true,
    maxlength: [100, 'Honor cannot exceed 100 characters']
  }],
  relevantCourses: [{
    type: String,
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  }]
}, {
  _id: true
});

// Schema for skills
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: [50, 'Skill name cannot exceed 50 characters']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  category: {
    type: String,
    enum: ['Technical', 'Language', 'Soft Skills', 'Tools', 'Other'],
    default: 'Technical'
  },
  yearsOfExperience: {
    type: Number,
    min: [0, 'Years of experience cannot be negative'],
    max: [50, 'Years of experience seems too high']
  }
}, {
  _id: true
});

// Schema for projects
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology name cannot exceed 50 characters']
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  current: {
    type: Boolean,
    default: false
  },
  url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  github: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Please enter a valid GitHub URL']
  },
  highlights: [{
    type: String,
    trim: true,
    maxlength: [300, 'Highlight cannot exceed 300 characters']
  }]
}, {
  _id: true
});

// Schema for certifications
const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
    maxlength: [100, 'Certification name cannot exceed 100 characters']
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required'],
    trim: true,
    maxlength: [100, 'Issuer name cannot exceed 100 characters']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.issueDate;
      },
      message: 'Expiry date must be after issue date'
    }
  },
  credentialId: {
    type: String,
    trim: true,
    maxlength: [100, 'Credential ID cannot exceed 100 characters']
  },
  url: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  neverExpires: {
    type: Boolean,
    default: false
  }
}, {
  _id: true
});

// Schema for custom sections
const customSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
    maxlength: [50, 'Section title cannot exceed 50 characters']
  },
  content: [{
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Content title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Content description cannot exceed 1000 characters']
    },
    date: {
      type: Date
    },
    url: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    }
  }]
}, {
  _id: true
});

// Main resume schema
const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Resume title is required'],
    trim: true,
    maxlength: [100, 'Resume title cannot exceed 100 characters']
  },
  
  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    address: {
      street: { type: String, trim: true, maxlength: [100, 'Street cannot exceed 100 characters'] },
      city: { type: String, trim: true, maxlength: [50, 'City cannot exceed 50 characters'] },
      state: { type: String, trim: true, maxlength: [50, 'State cannot exceed 50 characters'] },
      zipCode: { type: String, trim: true, maxlength: [20, 'Zip code cannot exceed 20 characters'] },
      country: { type: String, trim: true, maxlength: [50, 'Country cannot exceed 50 characters'] }
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Please enter a valid LinkedIn URL']
    },
    github: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.+/, 'Please enter a valid GitHub URL']
    },
    profilePicture: {
      type: String,
      trim: true
    }
  },

  // Professional Summary
  summary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },

  // Resume Sections
  experience: [experienceSchema],
  education: [educationSchema],
  skills: [skillSchema],
  projects: [projectSchema],
  certifications: [certificationSchema],
  customSections: [customSectionSchema],

  // Template and Styling
  template: {
    name: {
      type: String,
      enum: ['professional', 'creative', 'academic', 'technical', 'executive'],
      default: 'professional'
    },
    theme: {
      primaryColor: {
        type: String,
        default: '#2563eb',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      },
      secondaryColor: {
        type: String,
        default: '#64748b',
        match: [/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color']
      },
      fontFamily: {
        type: String,
        enum: ['inter', 'roboto', 'open-sans', 'lato', 'source-sans'],
        default: 'inter'
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      }
    },
    layout: {
      sections: [{
        name: {
          type: String,
          required: true
        },
        order: {
          type: Number,
          required: true
        },
        visible: {
          type: Boolean,
          default: true
        }
      }],
      columns: {
        type: Number,
        min: 1,
        max: 2,
        default: 1
      }
    }
  },

  // Metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'archived'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  // Analytics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    lastViewed: {
      type: Date,
      default: null
    },
    lastDownloaded: {
      type: Date,
      default: null
    }
  },

  // File attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, status: 1 });
resumeSchema.index({ isPublic: 1, isTemplate: 1 });
resumeSchema.index({ 'personalInfo.email': 1 });
resumeSchema.index({ title: 'text', summary: 'text' }); // Text search

// Virtual for full name
resumeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for completion percentage
resumeSchema.virtual('completionPercentage').get(function() {
  let completed = 0;
  const total = 8; // Total sections to check

  if (this.personalInfo.firstName && this.personalInfo.lastName && this.personalInfo.email) completed++;
  if (this.summary && this.summary.trim().length > 0) completed++;
  if (this.experience && this.experience.length > 0) completed++;
  if (this.education && this.education.length > 0) completed++;
  if (this.skills && this.skills.length > 0) completed++;
  if (this.personalInfo.phone) completed++;
  if (this.personalInfo.address && this.personalInfo.address.city) completed++;
  if (this.projects && this.projects.length > 0) completed++;

  return Math.round((completed / total) * 100);
});

// Virtual for total years of experience
resumeSchema.virtual('totalExperience').get(function() {
  if (!this.experience || this.experience.length === 0) return 0;

  const totalMs = this.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate);
    return total + (end - start);
  }, 0);

  const years = totalMs / (1000 * 60 * 60 * 24 * 365.25);
  return Math.round(years * 10) / 10; // Round to 1 decimal place
});

// Pre-save middleware
resumeSchema.pre('save', function(next) {
  this.lastModified = new Date();
  
  // Auto-update status based on completion
  if (this.isNew || this.isModified()) {
    const completion = this.completionPercentage;
    if (completion >= 80 && this.status === 'draft') {
      this.status = 'completed';
    }
  }

  // Increment version on modifications (except for stats updates)
  if (this.isModified() && !this.isNew && !this.isModified('stats')) {
    this.version += 1;
  }

  next();
});

// Instance methods
resumeSchema.methods.incrementView = async function() {
  this.stats.views += 1;
  this.stats.lastViewed = new Date();
  return this.save();
};

resumeSchema.methods.incrementDownload = async function() {
  this.stats.downloads += 1;
  this.stats.lastDownloaded = new Date();
  return this.save();
};

resumeSchema.methods.clone = async function() {
  const cloned = this.toObject();
  delete cloned._id;
  delete cloned.createdAt;
  delete cloned.updatedAt;
  cloned.title = `${cloned.title} (Copy)`;
  cloned.status = 'draft';
  cloned.version = 1;
  cloned.stats = {
    views: 0,
    downloads: 0,
    lastViewed: null,
    lastDownloaded: null
  };
  
  return new this.constructor(cloned);
};

// Static methods
resumeSchema.statics.findByUser = function(userId, options = {}) {
  const query = { userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ lastModified: -1 })
    .limit(options.limit || 50);
};

resumeSchema.statics.findPublic = function(options = {}) {
  return this.find({ isPublic: true, status: 'completed' })
    .populate('userId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

resumeSchema.statics.findTemplates = function() {
  return this.find({ isTemplate: true, status: 'completed' })
    .sort({ createdAt: -1 });
};

resumeSchema.statics.getAnalytics = async function(userId = null) {
  const match = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: null,
        totalResumes: { $sum: 1 },
        totalViews: { $sum: '$stats.views' },
        totalDownloads: { $sum: '$stats.downloads' },
        avgCompletion: { $avg: '$completionPercentage' },
        statusCounts: {
          $push: '$status'
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalResumes: 0,
    totalViews: 0,
    totalDownloads: 0,
    avgCompletion: 0,
    statusCounts: []
  };
};

module.exports = mongoose.model('Resume', resumeSchema); 