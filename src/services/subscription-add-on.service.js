import axios from "./axios-setup";

class SubscriptionAddOnService {
    createSubscriptionAddOn(subscriptionAddOn) {
        return axios.post('/api/subscription-add-ons', subscriptionAddOn);
    }
    getSubscriptionAddOns(params) {
        return axios.get('/api/subscription-add-ons', { params });
    }
    updateSubscriptionAddOn(id, body) {
        return axios.put(`/api/subscription-add-ons/${id}`, body);
    }
    deleteSubscriptionAddOn(id) {
        return axios.delete(`/api/subscription-add-ons/${id}`);
    }
}

export default new SubscriptionAddOnService();