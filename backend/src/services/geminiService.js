const { GoogleGenAI } = require('@google/genai');

let _ai = null;
const getAI = () => {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables');
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
};

const MODEL = 'gemini-2.5-flash';

const safeErrorMessage = (error) =>
  (error?.message || String(error)).replace(/key=[^&\s"']*/gi, 'key=REDACTED');

const generateJSON = async (prompt, label) => {
  try {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    return JSON.parse(response.text);
  } catch (error) {
    const safe = safeErrorMessage(error);
    console.error(`Gemini ${label} error:`, safe);
    throw new Error(`Gemini ${label} Error: ${safe}`);
  }
};

const generateNotesFromGemini = (class_level, subject, chapter) =>
  generateJSON(`
You are an expert CBSE/NCERT curriculum author and educator.
Generate detailed, highly structured study notes for:
Class: ${class_level}
Subject: ${subject}
Chapter: ${chapter}

Follow official NCERT textbook concepts, key formulas, chemical equations, historical dates, or core principles as applicable.

You MUST return the output ONLY as a valid JSON object matching the exact structure below, with no markdown formatting outside the JSON, no backticks, and no extra text.

{
  "chapterSummary": "Comprehensive summary of the chapter aligned with CBSE curriculum (2-3 structured paragraphs).",
  "importantPoints": [
    "Key point aligned with NCERT textbook syllabus",
    "High-yield point frequently tested in CBSE Board Exams"
  ],
  "keyConcepts": [
    { 
      "concept": "Name of concept / core theory", 
      "description": "Clear explanation including formulas, laws, or diagrams reference where applicable." 
    }
  ],
  "importantDefinitions": [
    { 
      "term": "NCERT Key Term", 
      "meaning": "Exact exam-ready definition with SI units or key terminology required by CBSE marking schemes." 
    }
  ],
  "quickRevisionNotes": "Bulletproof 5-minute revision summary for last-minute exam prep."
}
`, 'Notes');

const generateQuestionsFromGemini = (class_level, subject, chapter, difficulty) =>
  generateJSON(`
You are a senior CBSE Board Exam Paper setter.
Generate high-quality practice questions for:
Class: ${class_level}
Subject: ${subject}
Chapter: ${chapter}
Difficulty Level: ${difficulty}

Ensure questions strictly adhere to CBSE pattern (including Competency-Based Questions and Assertion-Reasoning where appropriate).

You MUST return the output ONLY as a valid JSON object matching the exact structure below, with no markdown formatting outside the JSON, no backticks, and no extra text.
Provide exactly 5 MCQs, 3 Short Answer Questions, 2 Long Answer Questions, and 1 Case Study Question with sub-questions.

{
  "mcqs": [
    { 
      "question": "Question text...", 
      "options": ["Option A", "Option B", "Option C", "Option D"], 
      "correctAnswer": "Option A", 
      "explanation": "Detailed explanation mentioning the NCERT concept/formula." 
    }
  ],
  "shortAnswers": [
    { 
      "question": "3-mark Short Answer Question...", 
      "answer": "CBSE Marking Scheme model answer (30-50 words, key terms highlighted)." 
    }
  ],
  "longAnswers": [
    { 
      "question": "5-mark Long Answer Question...", 
      "answer": "Step-by-step model answer (100-150 words) with point-wise breakdown." 
    }
  ],
  "caseStudies": [
    { 
      "passage": "Passage or real-world application scenario based on NCERT concept.",
      "questions": [
        { "question": "Sub-question 1 (1 Mark)", "answer": "Model answer 1" },
        { "question": "Sub-question 2 (2 Marks)", "answer": "Model answer 2" }
      ]
    }
  ]
}
`, 'Questions');

const generateExamFromGemini = (class_level, subject, chapter, difficulty, total_marks, exam_type, question_types) =>
  generateJSON(`
Generate an official-style CBSE Examination Paper for:
Class: ${class_level}
Subject: ${subject}
Chapter(s): ${chapter}
Difficulty Level: ${difficulty}
Total Marks: ${total_marks}
Exam Type: ${exam_type}
Question Types: ${question_types.join(', ')}

Follow standard CBSE question paper blueprint (Sections A, B, C, D, E as applicable based on total marks and included question types).

You MUST return the output ONLY as a valid JSON object matching the exact structure below, with no markdown formatting outside the JSON, no backticks, and no extra text.

{
  "examTitle": "CBSE ${subject} ${exam_type} Paper - Class ${class_level}",
  "totalMarks": ${total_marks},
  "duration": "Suggested duration (e.g. 2 Hours / 3 Hours)",
  "generalInstructions": [
    "Read the question paper carefully before answering.",
    "Section A contains 1 mark questions.",
    "Show complete step-by-step calculations for numerical questions."
  ],
  "sections": [
    {
      "sectionName": "Section A (Objective Questions)",
      "marksPerQuestion": 1,
      "totalSectionMarks": 10,
      "questions": [
        { 
          "questionNumber": 1, 
          "question": "Question text...", 
          "options": ["A", "B", "C", "D"], 
          "answer": "Option text / explanation" 
        }
      ]
    },
    {
      "sectionName": "Section B (Subjective / Short Answer)",
      "marksPerQuestion": 3,
      "totalSectionMarks": 15,
      "questions": [
        { 
          "questionNumber": 11, 
          "question": "Question text...", 
          "answer": "CBSE Step-wise marking model answer" 
        }
      ]
    }
  ]
}
`, 'Exam');

const generateQuizFromGemini = (class_level, subject, chapter, num_questions) =>
  generateJSON(`
You are an interactive CBSE quiz master.
Generate exactly ${num_questions} multiple choice quiz questions for:
Class: ${class_level}
Subject: ${subject}
Chapter: ${chapter}

Each question must have 4 options with exactly one correct answer.

You MUST return the output ONLY as a valid JSON array matching the exact structure below, with no markdown, no backticks, and no extra text.

[
  {
    "id": 1,
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why Option A is correct."
  }
]
`, 'Quiz');

const generateStudyPlanFromGemini = (examDate, syllabus, availableHours, prepLevel, weakSubjects, targetScore) =>
  generateJSON(`
You are an expert academic study planner and mentor.
Create a realistic, highly personalized study timetable from the provided syllabus and exam date.

STUDENT PROFILE:
- Exam Date: ${examDate}
- Syllabus to cover:\n${syllabus}
- Available Daily Study Hours: ${availableHours} hours
- Current Preparation Level: ${prepLevel}
- Weak Subjects/Topics: ${weakSubjects || 'None specified'}
- Target Score: ${targetScore || 'Best possible'}

INSTRUCTIONS:
1. Distribute the syllabus logically across the available time leading up to the exam date.
2. Prioritize weak subjects and difficult topics by allocating more time to them.
3. Schedule different activities: 'Concept Study', 'Practice Questions', 'Revision', 'Mock Test'.
4. Ensure total daily study duration roughly matches the ${availableHours} hours available.
5. Create a structured plan broken down into weeks, then days, then specific study sessions.
6. Leave appropriate buffer time. Do not pack the schedule unreasonably tight.
7. Generate unique IDs for each session.

You MUST return the output ONLY as a valid JSON object matching the exact structure below, with no markdown formatting outside the JSON, no backticks, and no extra text.

{
  "planTitle": "Personalized Study Plan",
  "examDate": "${examDate}",
  "weeklyPlans": [
    {
      "week": 1,
      "days": [
        {
          "day": "Monday",
          "date": "YYYY-MM-DD",
          "sessions": [
            {
              "id": "unique-uuid-string",
              "subject": "Name of Subject",
              "topic": "Name of Topic",
              "activity": "Concept Study | Practice | Revision | Mock Test",
              "startTime": "07:00",
              "endTime": "09:00",
              "durationMinutes": 120,
              "completed": false
            }
          ]
        }
      ]
    }
  ]
}
`, 'Study Plan');

const buildDoubtContents = (query, history, media) => {
  const historyContext = history.length
    ? 'Previous Conversation:\n' + history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n') + '\n\n'
    : '';

  const promptText = `You are an expert, empathetic CBSE & NCERT master tutor for Class 9-12 students.
Your mission is to clear the student's academic doubts clearly and effectively.

Guidelines:
- Explain complex concepts simply with real-world examples, NCERT terminology, and key formulas.
- If an image or PDF attachment is provided, analyze the problem, graph, diagram, chemical reaction, or handwritten text in detail and provide step-by-step solutions.
- Highlight important CBSE Board Exam tips, common mistakes to avoid, and step-wise marking points.
- Structure your response nicely with clean Markdown headings, bullet points, and LaTeX formatted math/equations where appropriate.
- If the student's question is non-academic, politely guide them back to their studies.

${historyContext}Student's Query: ${query || 'Please solve and explain the attached material/problem.'}`;

  const contents = [];
  if (media?.data && media?.mimeType) {
    contents.push({ inlineData: { mimeType: media.mimeType, data: media.data } });
  }
  contents.push(promptText);
  return contents;
};

const askDoubtFromGemini = async (query, history = [], media = null) => {
  try {
    const response = await getAI().models.generateContent({
      model: MODEL,
      contents: buildDoubtContents(query, history, media),
    });
    return response.text;
  } catch (error) {
    throw new Error(`Gemini Doubt Error: ${safeErrorMessage(error)}`);
  }
};

const askDoubtStreamFromGemini = async (query, history = [], media = null, onChunk) => {
  try {
    const responseStream = await getAI().models.generateContentStream({
      model: MODEL,
      contents: buildDoubtContents(query, history, media),
    });
    for await (const chunk of responseStream) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error('Gemini stream error:', safeErrorMessage(error));
    throw error;
  }
};

module.exports = {
  generateNotesFromGemini,
  generateQuestionsFromGemini,
  generateExamFromGemini,
  askDoubtFromGemini,
  askDoubtStreamFromGemini,
  generateStudyPlanFromGemini,
  generateQuizFromGemini,
};
