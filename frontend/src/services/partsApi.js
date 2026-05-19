import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051/api';

const partsApi = {
  getAllParts: (params) => axios.get(`${API_BASE_URL}/parts`, { params }),
  getPartById: (id) => axios.get(`${API_BASE_URL}/parts/${id}`),
  createPart: (data) => axios.post(`${API_BASE_URL}/parts`, data),
  updatePart: (id, data) => axios.put(`${API_BASE_URL}/parts/${id}`, data),
  deletePart: (id) => axios.delete(`${API_BASE_URL}/parts/${id}`),
};

export default partsApi;
