const ActivityHistory = require('../models/ActivityHistory');
const { generateStudyPlanFromGemini } = require('../services/geminiService');

// @route   POST /api/study-planner/generate
// @desc    Generate a personalized AI study plan
// @access  Private
const generatePlan = async (req, res) => {
  try {
    const { examDate, syllabus, availableHours, prepLevel, weakSubjects, targetScore } = req.body;
    const userId = req.user?.id;

    console.log('[StudyPlanner] POST /generate hit. userId:', userId, '| examDate:', examDate, '| syllabus length:', syllabus?.length);

    if (!examDate || !syllabus || !availableHours) {
      console.log('[StudyPlanner] Validation failed - missing fields');
      return res.status(400).json({ message: 'Please provide exam date, syllabus, and available hours' });
    }

    if (!userId) {
      console.log('[StudyPlanner] No userId - auth failed');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('[StudyPlanner] Calling Gemini API...');
    // Call Gemini Service
    const generatedPlan = await generateStudyPlanFromGemini(
      examDate, syllabus, availableHours, prepLevel, weakSubjects, targetScore
    );
    console.log('[StudyPlanner] Gemini returned plan with title:', generatedPlan?.planTitle);

    // Store in activity history
    const inputData = { examDate, syllabus, availableHours, prepLevel, weakSubjects, targetScore };

    const newActivity = await ActivityHistory.create({
      user_id: userId,
      activity_type: 'STUDY_PLAN',
      input_data: inputData,
      generated_content: generatedPlan
    });
    console.log('[StudyPlanner] Saved to MongoDB with id:', newActivity._id);

    res.json(newActivity);
  } catch (err) {
    console.error("Error in generatePlan:", err.message);
    res.status(500).json({ message: err.message || 'Server error generating study plan' });
  }
};

// @route   GET /api/study-planner/current
// @desc    Get the user's most recent active study plan
// @access  Private
const getCurrentPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const plan = await ActivityHistory.findOne({ user_id: userId, activity_type: 'STUDY_PLAN' }).sort({ created_at: -1 });

    if (!plan) {
      return res.json(null);
    }

    res.json(plan);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/study-planner/:id
// @desc    Update an existing study plan (e.g. marking sessions complete)
// @access  Private
const updatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { generated_content } = req.body;

    const result = await ActivityHistory.findOneAndUpdate(
      { _id: id, user_id: userId, activity_type: 'STUDY_PLAN' },
      { generated_content },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Study plan not found or unauthorized' });
    }

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generatePlan,
  getCurrentPlan,
  updatePlan
};
