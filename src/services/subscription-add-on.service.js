import axios from "./axios-setup";

class SubscriptionAddOnService {
    createSubscriptionAddOn(subscriptionAddOn) {
        return axios.post('/subscription-add-ons', subscriptionAddOn);
    }
    getSubscriptionAddOns(params) {
        return axios.get('/subscription-add-ons', { params });
    }
    updateSubscriptionAddOn(id, body) {
        return axios.put(`/subscription-add-ons/${id}`, body);
    }
    deleteSubscriptionAddOn(id) {
        return axios.delete(`/subscription-add-ons/${id}`);
    }
}

export default new SubscriptionAddOnService();