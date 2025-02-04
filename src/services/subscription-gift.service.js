import axios from "./axios-setup";

class SubscriptionGiftService {
    getGiftsForSubscription(id) {
        return axios.get(`/subscriptions/${id}/gifts`);
    }
}

export default new SubscriptionGiftService();