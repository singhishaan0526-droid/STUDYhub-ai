require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { generateStudyPlanFromGemini } = require('../services/geminiService');

const runTests = async () => {
  console.log('--- SYSTEM CHECK ---');
  let dbWorking = false;
  let geminiWorking = false;

  // 1. Test Database (MongoDB)
  try {
    console.log('\n[1/2] Testing MongoDB Connection...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully!');
    dbWorking = true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }

  // 2. Test Gemini API
  try {
    console.log('\n[2/2] Testing Gemini API Key...');
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing from .env");
    }
    const result = await generateStudyPlanFromGemini("2026-10-10", "Science Chapter 1 to 5", "3", "Average", "Physics", "90%");
    
    // Check if the result contains actual content
    if (result && result.planTitle) {
      console.log('✅ Gemini API connected and returned valid JSON data!');
      console.log('   Plan Title:', result.planTitle);
      geminiWorking = true;
    } else {
      console.error('❌ Gemini API responded, but data format was unexpected:', JSON.stringify(result).slice(0, 200));
    }
  } catch (err) {
    console.error('❌ Gemini API request failed:', err.message);
  }

  // 3. Final Report
  console.log('\n--- DIAGNOSTIC RESULTS ---');
  console.log(`Database (MongoDB): ${dbWorking ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`Gemini API:         ${geminiWorking ? 'PASS ✅' : 'FAIL ❌'}`);
  
  process.exit(dbWorking && geminiWorking ? 0 : 1);
};

runTests();
