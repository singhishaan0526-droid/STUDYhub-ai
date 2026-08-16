const ActivityHistory = require('../models/ActivityHistory');

// @route   GET /api/history
// @desc    Get all user history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await ActivityHistory.find({ user_id: userId }).sort({ created_at: -1 });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   DELETE /api/history/:id
// @desc    Delete a specific history item
// @access  Private
const deleteHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await ActivityHistory.findOneAndDelete({ _id: id, user_id: userId });

    if (!result) {
      return res.status(404).json({ message: 'History item not found or unauthorized' });
    }

    res.json({ message: 'History item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getHistory,
  deleteHistory
};
