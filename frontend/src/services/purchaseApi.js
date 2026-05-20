import api from '../shared/api/axiosConfig';

const purchaseApi = {
  createPurchaseInvoice: (data) => api.post('/purchaseinvoices', data),
  getAllInvoices: () => api.get('/purchaseinvoices'),
  getInvoiceById: (id) => api.get(`/purchaseinvoices/${id}`)
};

export default purchaseApi;
