import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051/api';

const purchaseApi = {
  createPurchaseInvoice: (data) => axios.post(`${API_BASE_URL}/purchaseinvoices`, data),
  getAllInvoices: () => axios.get(`${API_BASE_URL}/purchaseinvoices`),
  getInvoiceById: (id) => axios.get(`${API_BASE_URL}/purchaseinvoices/${id}`)
};

export default purchaseApi;
