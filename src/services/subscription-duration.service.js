import axios from "./axios-setup";

class SubscriptionDurationService {
    getDurationsForSubscription(id) {
        return axios.get(`/subscriptions/${id}/durations`);
    }
}

export default new SubscriptionDurationService();