import axios from "./axios-setup";

class SubscriptionOrderService {
    getSubscriptionOrders(params) {
        return axios.get('/subscription-orders', { params });
    }
    getSubscriptionOrder(id, params) {
        return axios.get(`/subscription-orders/${id}`, { params });
    }
}

export default new SubscriptionOrderService();