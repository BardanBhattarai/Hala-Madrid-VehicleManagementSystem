import api from '../shared/api/axiosConfig';

const partRequestApi = {
  createRequest: (data) => api.post('/partrequests', data),
  getRequests: (params) => api.get('/partrequests', { params }),
  getRequestById: (id) => api.get(`/partrequests/${id}`),
  getRequestsByCustomer: (customerId) => api.get(`/partrequests/customer/${customerId}`),
  updateRequestStatus: (id, status) => api.patch(`/partrequests/${id}/status`, `"${status}"`, {
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteRequest: (id) => api.delete(`/partrequests/${id}`),
};

export default partRequestApi;
