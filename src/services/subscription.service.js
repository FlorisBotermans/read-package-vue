import axios from "./axios-setup";

class SubscriptionService {
    createSubscription(subscription) {
        return axios.post('/api/subscriptions', subscription);
    }
    getSubscriptions(params) {
        return axios.get('/api/subscriptions', { params });
    }
    getSubscription(id) {
        return axios.get(`/api/subscriptions/${id}`);
    }
    updateSubscription(id, body) {
        return axios.put(`/api/subscriptions/${id}`, body);
    }
    deleteSubscription(id) {
        return axios.delete(`/api/subscriptions/${id}`);
    }
}

export default new SubscriptionService();