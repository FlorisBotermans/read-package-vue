import axios from "./axios-setup";

class SubscriptionDurationService {
    getDurationsForSubscription(id) {
        return axios.get(`/api/subscriptions/${id}/durations`);
    }
}

export default new SubscriptionDurationService();