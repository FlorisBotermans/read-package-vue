import axios from "./axios-setup";

class SubscriptionPackageService {
    getPackagesForSubscription(id) {
        return axios.get(`/subscriptions/${id}/packages`);
    }
}

export default new SubscriptionPackageService();