const express = require('express');
const router = express.Router();
const examsController = require('../controllers/examsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all exams routes
router.use(authMiddleware);

// @route   POST /api/exams/generate
router.post('/generate', examsController.generateExam);

module.exports = router;
