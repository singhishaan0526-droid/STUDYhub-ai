import api from './api';

const quizService = {
  saveAttempt: (resultData) => api.post('/quiz/save', resultData).then(r => r.data),
};

export default quizService;
