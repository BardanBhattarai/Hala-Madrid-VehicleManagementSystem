import api from '../shared/api/axiosConfig';

const staffApi = {
  getAllStaff: () => api.get('/staff'),
  getStaffById: (id) => api.get(`/staff/${id}`),
  createStaff: (data) => api.post('/staff', data),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
};

export default staffApi;
