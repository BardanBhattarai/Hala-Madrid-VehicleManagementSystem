import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7251/api';

const partsApi = {
  getAllParts: () => axios.get(`${API_BASE_URL}/parts`),
  getPartById: (id) => axios.get(`${API_BASE_URL}/parts/${id}`),
  createPart: (data) => axios.post(`${API_BASE_URL}/parts`, data),
  updatePart: (id, data) => axios.put(`${API_BASE_URL}/parts/${id}`, data),
  deletePart: (id) => axios.delete(`${API_BASE_URL}/parts/${id}`),
};

export default partsApi;
