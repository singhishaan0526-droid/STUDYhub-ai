const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all history routes
router.use(authMiddleware);

// @route   GET /api/history
router.get('/', historyController.getHistory);

// @route   DELETE /api/history/:id
router.delete('/:id', historyController.deleteHistory);

module.exports = router;
