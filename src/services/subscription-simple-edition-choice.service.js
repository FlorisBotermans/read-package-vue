import axios from "./axios-setup";

class SubscriptionSimpleEditionChoiceService {
    getSimpleEditionChoicesForSubscription(id) {
        return axios.get(`/api/subscriptions/${id}/simple-edition-choices`);
    }
}

export default new SubscriptionSimpleEditionChoiceService();