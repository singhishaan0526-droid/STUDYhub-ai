require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const {
  generateNotesFromGemini,
  generateQuestionsFromGemini,
  generateExamFromGemini,
  askDoubtFromGemini,
  askDoubtStreamFromGemini
} = require('../services/geminiService');

async function runTests() {
  console.log("==========================================");
  console.log("🧪 STARTING GEMINI API INTEGRATION TESTS");
  console.log("==========================================");

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
    console.warn("⚠️ GEMINI_API_KEY is not configured or uses placeholder in .env file.");
    console.warn("Please add a valid GEMINI_API_KEY to backend/.env to run live API calls.");
    console.log("==========================================");
    process.exit(0);
  }

  try {
    // Test 1: Notes Generation
    console.log("\n1️⃣ Testing Notes Generation (gemini-2.5-flash)...");
    const notes = await generateNotesFromGemini("10", "Science", "Chemical Reactions and Equations");
    console.log("✅ Notes Generated Successfully!");
    console.log("   - Summary length:", notes.chapterSummary?.length || 0, "chars");
    console.log("   - Important Points count:", notes.importantPoints?.length || 0);
    console.log("   - Key Concepts count:", notes.keyConcepts?.length || 0);

    // Test 2: Questions Generation
    console.log("\n2️⃣ Testing Questions Generation...");
    const questions = await generateQuestionsFromGemini("10", "Physics", "Light Reflection and Refraction", "Medium");
    console.log("✅ Questions Generated Successfully!");
    console.log("   - MCQs count:", questions.mcqs?.length || 0);
    console.log("   - Short Answers count:", questions.shortAnswers?.length || 0);
    console.log("   - Long Answers count:", questions.longAnswers?.length || 0);

    // Test 3: Exam Generation
    console.log("\n3️⃣ Testing Exam Paper Generation...");
    const exam = await generateExamFromGemini("12", "Mathematics", "Calculus", "Hard", 80, "Board Mock Exam", ["MCQ", "Short Answer"]);
    console.log("✅ Exam Generated Successfully!");
    console.log("   - Exam Title:", exam.examTitle);
    console.log("   - Sections count:", exam.sections?.length || 0);

    // Test 4: Single Doubt Query
    console.log("\n4️⃣ Testing Single Doubt Query...");
    const answer = await askDoubtFromGemini("What is the statement of Ohm's Law and its SI unit?");
    console.log("✅ Doubt Response Received!");
    console.log("   - Sample output snippet:", answer.substring(0, 100).replace(/\n/g, ' ') + "...");

    // Test 5: Real-time Streaming Doubt Query
    console.log("\n5️⃣ Testing Real-Time Doubt Streaming...");
    process.stdout.write("   - Stream output: ");
    let totalChunks = 0;
    await askDoubtStreamFromGemini(
      "Explain Inertia in 2 brief bullet points.",
      [],
      null,
      (chunk) => {
        totalChunks++;
        process.stdout.write(chunk);
      }
    );
    console.log(`\n✅ Streaming Complete! Received ${totalChunks} chunks.`);

    console.log("\n==========================================");
    console.log("🎉 ALL GEMINI API INTEGRATION TESTS PASSED!");
    console.log("==========================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
