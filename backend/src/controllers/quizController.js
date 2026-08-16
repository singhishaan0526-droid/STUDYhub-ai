const ActivityHistory = require('../models/ActivityHistory');

// @route   POST /api/quiz/save
// @desc    Save a quiz attempt
// @access  Private
const saveQuizAttempt = async (req, res) => {
  try {
    const { topic, difficulty, total_questions, score, percentage, correct_answers, incorrect_answers, unanswered, answers_data } = req.body;
    const userId = req.user.id;

    if (!topic || total_questions === undefined || score === undefined) {
      return res.status(400).json({ message: 'Missing required quiz data' });
    }

    const inputData = { 
      topic, 
      difficulty, 
      total_questions, 
      score, 
      percentage, 
      correct_answers, 
      incorrect_answers, 
      unanswered 
    };

    const newActivity = await ActivityHistory.create({
      user_id: userId,
      activity_type: 'QUIZ_ATTEMPT',
      input_data: inputData,
      generated_content: { answers_data }
    });

    res.status(201).json(newActivity);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveQuizAttempt
};
