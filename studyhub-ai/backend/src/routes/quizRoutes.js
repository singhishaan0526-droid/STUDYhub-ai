const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all quiz routes
router.use(authMiddleware);

// @route   POST /api/quiz/save
router.post('/save', quizController.saveQuizAttempt);

module.exports = router;
