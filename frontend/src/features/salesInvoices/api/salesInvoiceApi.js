import api from '../../../shared/api/axiosConfig';

export const createSalesInvoice = (data) => api.post('/sales-invoices', data);
export const getAllSalesInvoices = (params) => api.get('/sales-invoices', { params });
export const getSalesInvoiceById = (id) => api.get(`/sales-invoices/${id}`);
export const getInvoicesByCustomer = (customerId) => api.get(`/sales-invoices/customer/${customerId}`);
