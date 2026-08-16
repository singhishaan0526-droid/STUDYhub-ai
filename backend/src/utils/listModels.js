require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { GoogleGenAI } = require('@google/genai');

const run = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.list();
    for await (const model of response) {
      console.log(model.name);
    }
  } catch(e) {
    console.error(e);
  }
};
run();
