import api from './api';

const examsService = {
  generateExam: (class_level, subject, chapter, difficulty, total_marks, exam_type, question_types) =>
    api.post('/exams/generate', { class_level, subject, chapter, difficulty, total_marks, exam_type, question_types }).then(r => r.data),
};

export default examsService;
