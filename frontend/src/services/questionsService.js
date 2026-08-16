import api from './api';

const questionsService = {
  generateQuestions: (class_level, subject, chapter, difficulty) =>
    api.post('/questions/generate', { class_level, subject, chapter, difficulty }).then(r => r.data),
};

export default questionsService;
