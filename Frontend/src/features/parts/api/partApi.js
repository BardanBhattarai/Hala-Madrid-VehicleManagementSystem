import api from '../../../shared/api/axiosConfig';

export const getAllParts = () => api.get('/parts');
export const createPart = (data) => api.post('/parts', data);
export const deletePart = (id) => api.delete(`/parts/${id}`);
