import api from '../shared/api/axiosConfig';

const reviewApi = {
  createReview: (data) => api.post('/reviews', data),
  getReviews: (params) => api.get('/reviews', { params }),
  getReviewsByCustomer: (customerId) => api.get(`/reviews/customer/${customerId}`),
  getAverageRating: () => api.get('/reviews/average'),
};

export default reviewApi;
