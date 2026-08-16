import api from './api';

const studyPlannerService = {
  generatePlan: (examDate, syllabus, availableHours, prepLevel, weakSubjects, targetScore) =>
    api.post('/study-planner/generate', { examDate, syllabus, availableHours, prepLevel, weakSubjects, targetScore }).then(r => r.data),
  getCurrentPlan: ()             => api.get('/study-planner/current').then(r => r.data),
  updatePlan:     (id, content)  => api.put(`/study-planner/${id}`, { generated_content: content }).then(r => r.data),
};

export default studyPlannerService;
