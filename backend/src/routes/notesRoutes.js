const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 30, // 30 AI requests per IP per hour
  message: { message: 'AI generation limit reached for this hour' }
});

// Protect all notes routes
router.use(authMiddleware);

// @route   POST /api/notes/generate
router.post('/generate', aiLimiter, notesController.generateNotes);

module.exports = router;
