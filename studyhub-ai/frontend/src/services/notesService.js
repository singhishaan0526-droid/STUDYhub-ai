import api from './api';

const notesService = {
  generateNotes: (class_level, subject, chapter) =>
    api.post('/notes/generate', { class_level, subject, chapter }).then(r => r.data),
};

export default notesService;
