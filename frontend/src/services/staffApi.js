import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051/api';

const staffApi = {
  getAllStaff: () => axios.get(`${API_BASE_URL}/staff`),
  getStaffById: (id) => axios.get(`${API_BASE_URL}/staff/${id}`),
  createStaff: (data) => axios.post(`${API_BASE_URL}/staff`, data),
  updateStaff: (id, data) => axios.put(`${API_BASE_URL}/staff/${id}`, data),
  deleteStaff: (id) => axios.delete(`${API_BASE_URL}/staff/${id}`),
};

export default staffApi;
