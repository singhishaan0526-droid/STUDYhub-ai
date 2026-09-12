const express = require('express');
const router = express.Router();
const questionsController = require('../controllers/questionsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all questions routes
router.use(authMiddleware);

// @route   POST /api/questions/generate
router.post('/generate', questionsController.generateQuestions);

module.exports = router;
