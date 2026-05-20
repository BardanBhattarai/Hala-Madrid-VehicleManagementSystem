import api from '../shared/api/axiosConfig';

const partsApi = {
  getAllParts: (params) => api.get('/parts', { params }),
  getPartById: (id) => api.get(`/parts/${id}`),
  createPart: (data) => api.post('/parts', data),
  updatePart: (id, data) => api.put(`/parts/${id}`, data),
  deletePart: (id) => api.delete(`/parts/${id}`),
};

export default partsApi;
