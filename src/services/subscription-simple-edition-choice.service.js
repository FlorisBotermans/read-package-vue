import axios from "./axios-setup";

class SubscriptionSimpleEditionChoiceService {
    getSimpleEditionChoicesForSubscription(id) {
        return axios.get(`/subscriptions/${id}/simple-edition-choices`);
    }
}

export default new SubscriptionSimpleEditionChoiceService();