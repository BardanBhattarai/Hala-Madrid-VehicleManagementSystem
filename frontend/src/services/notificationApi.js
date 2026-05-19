import api from '../shared/api/axiosConfig';

export const getAllNotifications = (params) => api.get('/notifications', { params });
export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`);
