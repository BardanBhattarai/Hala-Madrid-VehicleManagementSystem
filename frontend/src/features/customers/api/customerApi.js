import api from '../../../shared/api/axiosConfig';

export const registerCustomerWithVehicle = (data) => api.post('/customers/register-with-vehicle', data);
export const getAllCustomers = () => api.get('/customers');
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const addVehicleToCustomer = (customerId, data) => api.post(`/customers/${customerId}/vehicles`, data);
export const getCustomerProfile = (id) => api.get(`/customers/${id}/profile`);
export const getCustomerVehicles = (id) => api.get(`/customers/${id}/vehicles`);
export const getCustomerPurchaseHistory = (id) => api.get(`/customers/${id}/purchase-history`);

// Feature 12: Profile Update
export const updateCustomerProfile = (id, data) => api.put(`/customers/${id}/profile`, data);

// Feature 9: Customer Reports
export const getHighSpendingCustomers = (params) => api.get('/customers/reports/high-spending', { params });
export const getRegularCustomers = (params) => api.get('/customers/reports/regular', { params });
export const getCustomersWithPendingCredits = (params) => api.get('/customers/reports/pending-credits', { params });

// Feature 10: Customer Search
export const searchCustomers = (params) => api.get('/customers/search', { params });
