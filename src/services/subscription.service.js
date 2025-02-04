import axios from "./axios-setup";

class SubscriptionService {
    createSubscription(subscription) {
        return axios.post('/subscriptions', subscription);
    }
    getSubscriptions(params) {
        return axios.get('/subscriptions', { params });
    }
    getSubscription(id) {
        return axios.get(`/subscriptions/${id}`);
    }
    updateSubscription(id, body) {
        return axios.put(`/subscriptions/${id}`, body);
    }
    deleteSubscription(id) {
        return axios.delete(`/subscriptions/${id}`);
    }
}

export default new SubscriptionService();