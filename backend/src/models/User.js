const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
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
  profilePicture: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    select: false
  },
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d' // TTL index
    },
    device: {
      type: String,
      default: 'Unknown'
    },
    ip: {
      type: String,
      default: null
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    resumesCreated: {
      type: Number,
      default: 0
    },
    pdfsGenerated: {
      type: Number,
      default: 0
    },
    lastResumeUpdated: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.refreshTokens;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'refreshTokens.token': 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update stats
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.stats.resumesCreated = 0;
    this.stats.pdfsGenerated = 0;
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    throw new Error('Password not found for user');
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT access token
userSchema.methods.generateAccessToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m',
      issuer: 'devresume-forge',
      audience: 'devresume-forge-users'
    }
  );
};

// Instance method to generate JWT refresh token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    type: 'refresh'
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
      issuer: 'devresume-forge',
      audience: 'devresume-forge-users'
    }
  );
};

// Instance method to add refresh token
userSchema.methods.addRefreshToken = async function(token, device = 'Unknown', ip = null) {
  // Remove old tokens (keep only last 5)
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.sort((a, b) => b.createdAt - a.createdAt);
    this.refreshTokens = this.refreshTokens.slice(0, 4);
  }

  this.refreshTokens.push({
    token,
    device,
    ip,
    createdAt: new Date()
  });

  await this.save();
};

// Instance method to remove refresh token
userSchema.methods.removeRefreshToken = async function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  await this.save();
};

// Instance method to handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
  // If we have a lock and it's not expired, restart count
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and it's not locked, lock account
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + lockTime
    };
  }

  return this.updateOne(updates);
};

// Instance method to handle successful login
userSchema.methods.handleSuccessfulLogin = async function() {
  const updates = {
    lastLogin: new Date()
  };

  // If there were failed attempts, reset them
  if (this.loginAttempts || this.lockUntil) {
    updates.$unset = {
      loginAttempts: 1,
      lockUntil: 1
    };
  }

  return this.updateOne(updates);
};

// Instance method to increment resume stats
userSchema.methods.incrementResumeStats = async function(type = 'created') {
  const updates = {
    'stats.lastResumeUpdated': new Date()
  };

  if (type === 'created') {
    updates.$inc = { 'stats.resumesCreated': 1 };
  } else if (type === 'pdf') {
    updates.$inc = { 'stats.pdfsGenerated': 1 };
  }

  return this.updateOne(updates);
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find users created in date range
userSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

module.exports = mongoose.model('User', userSchema); 