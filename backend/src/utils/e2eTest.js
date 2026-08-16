/**
 * Full end-to-end HTTP test for StudyPlanner
 * Tests: register → get token → POST /api/study-planner/generate → check response
 * Does NOT expose API key or credentials in output.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const http = require('http');

const BASE = 'localhost';
const PORT = 5000;

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { hostname: BASE, port: PORT, path, method, headers };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
};

const run = async () => {
  console.log('\n========== END-TO-END STUDY PLANNER TEST ==========\n');
  
  // Step 1: Check env
  console.log('[Step 1] Checking environment...');
  console.log('  GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY, '| Key prefix:', process.env.GEMINI_API_KEY?.slice(0, 5) + '...');
  console.log('  JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('  MONGODB_URI set:', !!process.env.MONGODB_URI);
  
  // Step 2: Register a test user (or login if exists)
  console.log('\n[Step 2] Registering/logging in test user...');
  const testEmail = `test_${Date.now()}@studyhub.test`;
  const testPassword = 'TestPass123!';
  
  let token;
  const regRes = await request('POST', '/api/auth/register', { name: 'Test User', email: testEmail, password: testPassword });
  console.log('  Register status:', regRes.status);
  if (regRes.status === 200 || regRes.status === 201) {
    token = regRes.body.token;
    console.log('  Token received:', !!token);
  } else {
    console.error('  Register failed:', regRes.body);
    process.exit(1);
  }

  // Step 3: Hit the study planner generate endpoint
  console.log('\n[Step 3] POST /api/study-planner/generate...');
  const payload = {
    examDate: '2026-12-15',
    syllabus: 'Class 10: Mathematics (Algebra, Geometry, Trigonometry), Science (Physics - Light, Chemistry - Acids/Bases, Biology - Life Processes), Social Science (History - Nationalism in India, Geography - Resources), English (Literature)',
    availableHours: 4,
    prepLevel: 'Intermediate',
    weakSubjects: 'Mathematics and Science',
    targetScore: '90%'
  };
  console.log('  Payload keys:', Object.keys(payload).join(', '));
  
  const planRes = await request('POST', '/api/study-planner/generate', payload, token);
  console.log('  Response status:', planRes.status);
  
  if (planRes.status === 200 || planRes.status === 201) {
    const plan = planRes.body;
    console.log('  ✅ SUCCESS! Plan saved to MongoDB with _id:', plan._id);
    console.log('  Plan title:', plan.generated_content?.planTitle);
    console.log('  Weeks generated:', plan.generated_content?.weeklyPlans?.length);
    console.log('  First week days:', plan.generated_content?.weeklyPlans?.[0]?.days?.length);
  } else {
    console.error('  ❌ FAILED! Server returned:', planRes.status);
    console.error('  Error message:', typeof planRes.body === 'object' ? planRes.body.message : planRes.body);
  }

  console.log('\n========== TEST COMPLETE ==========');
};

run().catch(err => {
  console.error('Test script crashed:', err.message);
  process.exit(1);
});
