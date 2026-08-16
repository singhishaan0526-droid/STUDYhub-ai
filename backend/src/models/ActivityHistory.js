const mongoose = require('mongoose');

const activityHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activity_type: {
    type: String,
    required: true,
    enum: ['NOTE', 'QUESTION', 'EXAM', 'CHAT', 'QUIZ_ATTEMPT', 'STUDY_PLAN']
  },
  input_data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  generated_content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for fast user queries
activityHistorySchema.index({ user_id: 1, created_at: -1 });
activityHistorySchema.index({ user_id: 1, activity_type: 1 });

module.exports = mongoose.model('ActivityHistory', activityHistorySchema);
