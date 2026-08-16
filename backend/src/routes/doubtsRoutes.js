const express = require('express');
const router = express.Router();
const doubtsController = require('../controllers/doubtsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all doubts routes
router.use(authMiddleware);

// @route   POST /api/doubts/ask
router.post('/ask', doubtsController.askDoubt);

// @route   POST /api/doubts/stream
router.post('/stream', doubtsController.askDoubtStream);

module.exports = router;
