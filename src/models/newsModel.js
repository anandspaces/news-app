import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalContent: {
    type: String,
    required: true
  },
  sourceUrl: {
    type: String
  },
  aiSummary: {
    type: String
    // This will be populated by the AI service
  },
  factCheckStatus: {
    type: String,
    enum: ['Unverified', 'True', 'False', 'Mixed'],
    default: 'Unverified'
  },
  factCheckAnalysis: {
    type: String
    // Explanation from AI
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String // URLs
  }],
  publishedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('News', newsSchema);
