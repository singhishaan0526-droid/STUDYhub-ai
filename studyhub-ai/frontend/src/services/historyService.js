import api from './api';

const historyService = {
  getHistory:    ()   => api.get('/history').then(r => r.data),
  deleteHistory: (id) => api.delete(`/history/${id}`).then(r => r.data),
};

export default historyService;
