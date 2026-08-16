/**
 * Self-contained debug test: starts server inline (no separate process),
 * then calls generateStudyPlanFromGemini directly and logs every detail.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const run = async () => {
  console.log('\n========== GEMINI DIRECT DEBUG TEST ==========\n');

  // Step 1: Check env vars
  const key = process.env.GEMINI_API_KEY;
  console.log('[ENV] GEMINI_API_KEY loaded:', !!key);
  console.log('[ENV] Key prefix (safe):', key ? key.slice(0, 6) + '...' : 'MISSING');
  console.log('[ENV] JWT_SECRET loaded:', !!process.env.JWT_SECRET);
  console.log('[ENV] MONGODB_URI loaded:', !!process.env.MONGODB_URI);

  // Step 2: Import Gemini service (now that env is loaded)
  const { generateStudyPlanFromGemini } = require('../services/geminiService');

  // Step 3: Call Gemini directly with real sample data
  const payload = {
    examDate: '2026-12-15',
    syllabus: 'Class 10: Mathematics (Algebra, Geometry, Trigonometry), Science (Physics-Light, Chemistry-Acids/Bases, Biology-Life Processes), Social Science (History-Nationalism in India, Geography-Resources), English (Literature)',
    availableHours: '4',
    prepLevel: 'Intermediate',
    weakSubjects: 'Mathematics and Science',
    targetScore: '90%',
  };

  console.log('\n[Gemini] Calling generateStudyPlanFromGemini...');
  console.log('[Gemini] examDate:', payload.examDate);
  console.log('[Gemini] availableHours:', payload.availableHours);

  try {
    const result = await generateStudyPlanFromGemini(
      payload.examDate,
      payload.syllabus,
      payload.availableHours,
      payload.prepLevel,
      payload.weakSubjects,
      payload.targetScore
    );

    console.log('\n[Gemini] ✅ SUCCESS!');
    console.log('[Gemini] planTitle:', result?.planTitle);
    console.log('[Gemini] weeklyPlans count:', result?.weeklyPlans?.length);

    // Step 4: Save to MongoDB
    console.log('\n[MongoDB] Connecting...');
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MongoDB] ✅ Connected!');

    const ActivityHistory = require('../models/ActivityHistory');
    const doc = await ActivityHistory.create({
      user_id: new mongoose.Types.ObjectId(),
      activity_type: 'STUDY_PLAN',
      input_data: payload,
      generated_content: result
    });
    console.log('[MongoDB] ✅ Saved! _id:', doc._id);
    console.log('\n========== ALL SYSTEMS PASS ✅ ==========');

  } catch (err) {
    console.error('\n[ERROR] ❌ Failure detected!');
    console.error('[ERROR] Message:', err.message);
    // Print the full error structure safely
    if (err.status) console.error('[ERROR] HTTP Status:', err.status);
    if (err.errorDetails) console.error('[ERROR] Details:', JSON.stringify(err.errorDetails));
    // Check if it's a Gemini API error and print the safe body
    const raw = err?.message || '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.error('[ERROR] Gemini API error code:', parsed?.error?.code);
        console.error('[ERROR] Gemini API error message:', parsed?.error?.message);
        console.error('[ERROR] Gemini API error status:', parsed?.error?.status);
      } catch {}
    }
    console.log('\n========== TEST FAILED ❌ ==========');
  }

  process.exit(0);
};

run();
