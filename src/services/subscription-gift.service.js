import axios from "./axios-setup";

class SubscriptionGiftService {
    getGiftsForSubscription(id) {
        return axios.get(`/api/subscriptions/${id}/gifts`);
    }
}

export default new SubscriptionGiftService();