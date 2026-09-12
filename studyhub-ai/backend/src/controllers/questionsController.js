const ActivityHistory = require('../models/ActivityHistory');
const { generateQuestionsFromGemini } = require('../services/geminiService');

// @route   POST /api/questions/generate
// @desc    Generate questions using Gemini API
// @access  Private
const generateQuestions = async (req, res) => {
  try {
    const { class_level, subject, chapter, difficulty } = req.body;
    const userId = req.user.id;

    if (!class_level || !subject || !chapter || !difficulty) {
      return res.status(400).json({ message: 'Please provide class, subject, chapter, and difficulty level' });
    }

    // Call Gemini Service
    const generatedQuestions = await generateQuestionsFromGemini(class_level, subject, chapter, difficulty);

    // Store in activity history
    const inputData = { class_level, subject, chapter, difficulty };
    
    const newActivity = await ActivityHistory.create({
      user_id: userId,
      activity_type: 'QUESTION',
      input_data: inputData,
      generated_content: generatedQuestions
    });

    res.json(newActivity);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = {
  generateQuestions
};
