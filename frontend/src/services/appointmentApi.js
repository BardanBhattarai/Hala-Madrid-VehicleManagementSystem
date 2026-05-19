import api from '../shared/api/axiosConfig';

const appointmentApi = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  getAppointmentsByCustomer: (customerId) => api.get(`/appointments/customer/${customerId}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  updateAppointmentStatus: (id, status) => api.patch(`/appointments/${id}/status`, status, {
    headers: { 'Content-Type': 'application/json' }
  }),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

export default appointmentApi;
