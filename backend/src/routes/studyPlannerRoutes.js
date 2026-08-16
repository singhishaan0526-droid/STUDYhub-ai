const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { generatePlan, getCurrentPlan, updatePlan } = require('../controllers/studyPlannerController');

router.use(authMiddleware);

router.post('/generate', generatePlan);
router.get('/current', getCurrentPlan);
router.put('/:id', updatePlan);

module.exports = router;
