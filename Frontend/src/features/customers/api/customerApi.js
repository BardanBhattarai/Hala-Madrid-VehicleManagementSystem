import api from '../../../shared/api/axiosConfig';

export const registerCustomerWithVehicle = (data) => api.post('/customers/register-with-vehicle', data);
export const getAllCustomers = () => api.get('/customers');
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const addVehicleToCustomer = (customerId, data) => api.post(`/customers/${customerId}/vehicles`, data);
export const getCustomerProfile = (id) => api.get(`/customers/${id}/profile`);
export const getCustomerVehicles = (id) => api.get(`/customers/${id}/vehicles`);
export const getCustomerPurchaseHistory = (id) => api.get(`/customers/${id}/purchase-history`);
