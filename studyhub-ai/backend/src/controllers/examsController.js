const ActivityHistory = require('../models/ActivityHistory');
const { generateExamFromGemini } = require('../services/geminiService');

// @route   POST /api/exams/generate
// @desc    Generate exam using Gemini API
// @access  Private
const generateExam = async (req, res) => {
  try {
    const { class_level, subject, chapter, difficulty, total_marks, exam_type, question_types } = req.body;
    const userId = req.user.id;

    if (!class_level || !subject || !chapter || !difficulty || !total_marks || !exam_type || !question_types) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Call Gemini Service
    const generatedExam = await generateExamFromGemini(class_level, subject, chapter, difficulty, total_marks, exam_type, question_types);

    // Store in activity history
    const inputData = { class_level, subject, chapter, difficulty, total_marks, exam_type, question_types };
    
    const newActivity = await ActivityHistory.create({
      user_id: userId,
      activity_type: 'EXAM',
      input_data: inputData,
      generated_content: generatedExam
    });

    res.json(newActivity);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

module.exports = {
  generateExam
};
