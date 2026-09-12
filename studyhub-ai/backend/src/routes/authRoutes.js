const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 10, // 10 attempts per IP
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
});

// @route   POST /api/auth/register
router.post('/register', authLimiter, authController.register);

// @route   POST /api/auth/login
router.post('/login', authLimiter, authController.login);

// @route   GET /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
