const ActivityHistory = require('../models/ActivityHistory');
const { generateNotesFromGemini } = require('../services/geminiService');

// @route   POST /api/notes/generate
// @desc    Generate notes using Gemini API
// @access  Private
const generateNotes = async (req, res) => {
  try {
    const { class_level, subject, chapter } = req.body;
    const userId = req.user.id;

    if (!class_level || !subject || !chapter) {
      return res.status(400).json({ message: 'Please provide class, subject, and chapter' });
    }

    // Call Gemini Service
    const generatedNotes = await generateNotesFromGemini(class_level, subject, chapter);

    // Store in activity history
    const inputData = { class_level, subject, chapter };
    
    const newActivity = await ActivityHistory.create({
      user_id: userId,
      activity_type: 'NOTE',
      input_data: inputData,
      generated_content: generatedNotes
    });

    res.json(newActivity);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = {
  generateNotes
};
