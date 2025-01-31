import { defineStore } from 'pinia'
import SubscriptionPackageService from '../services/subscription-package.service';

const initialState = {
    subscriptionPackages: null,
    statusMessage: null,
    subscriptionPackageData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionPackageStore = defineStore('subscriptionpackagestore', {
    state: () => (initialState),
    actions: {
        async getPackagesForSubscription(id) {
            return SubscriptionPackageService.getPackagesForSubscription(id).then(
                subscriptionPackages => {
                    return Promise.resolve(subscriptionPackages.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});