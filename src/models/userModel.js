import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    index: true
  },
  lastName: {
    type: String,
    trim: true,
    index: true
  },
  mobileNumber: {
    type: String,
    trim: true
  },
  countryCode: {
    type: String,
    default: '+91'
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  youtubeTokens: {
    type: Object, // Stores access_token, refresh_token, scope, token_type, expiry_date
    default: {}
  },
  refreshToken: {
    type: String
  },
  interests: [{
    type: String // e.g., 'Politics', 'Sports', 'Tech'
  }],
  ageGroup: {
    type: String,// e.g., '18-24', '25-34'
    default: '18-24'
  },
  language: {
    type: String,
    default: 'en'
  },
  city: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  savedNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods = {
  comparePassword: async function (plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, this.password)
  },
  generateAccessToken: function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    )
  },
  generateRefreshToken: function () {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
    )
  },
}
export default mongoose.model('User', userSchema);
