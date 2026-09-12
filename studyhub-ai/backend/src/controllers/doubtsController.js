const ActivityHistory = require('../models/ActivityHistory');
const { askDoubtFromGemini, askDoubtStreamFromGemini } = require('../services/geminiService');

// @route   POST /api/doubts/ask
// @desc    Ask a doubt using Gemini API (Standard JSON)
// @access  Private
const askDoubt = async (req, res) => {
  try {
    const { query, history, media } = req.body;
    const userId = req.user.id;

    if (!query && !media) {
      return res.status(400).json({ message: 'Please provide a question or an attachment' });
    }

    // Call Gemini Service
    const aiResponse = await askDoubtFromGemini(query, history || [], media || null);

    // Store in activity history
    const inputData = { query, context_length: history?.length || 0, has_media: !!media };
    
    const newActivity = await ActivityHistory.create({
      user_id: userId,
      activity_type: 'CHAT',
      input_data: inputData,
      generated_content: { answer: aiResponse }
    });

    res.json({ answer: aiResponse, activity: newActivity });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// @route   POST /api/doubts/stream
// @desc    Ask a doubt using Gemini API with Real-time Server-Sent Events (SSE) Streaming
// @access  Private
const askDoubtStream = async (req, res) => {
  try {
    const { query, history, media } = req.body;
    const userId = req.user.id;

    if (!query && !media) {
      return res.status(400).json({ message: 'Please provide a question or an attachment' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullAnswer = '';

    await askDoubtStreamFromGemini(query, history || [], media || null, (chunkText) => {
      fullAnswer += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    });

    // Send completion event
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);

    // Asynchronously log interaction to activity history
    try {
      const inputData = { query, context_length: history?.length || 0, has_media: !!media };
      await ActivityHistory.create({
        user_id: userId,
        activity_type: 'CHAT',
        input_data: inputData,
        generated_content: { answer: fullAnswer }
      });
    } catch (dbErr) {
      console.error("Failed to save streaming doubt to DB:", dbErr.message);
    }

    res.end();
  } catch (err) {
    console.error("Error in askDoubtStream:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || 'Server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
};

module.exports = {
  askDoubt,
  askDoubtStream
};
