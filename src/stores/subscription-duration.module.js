import { defineStore } from 'pinia'
import SubscriptionDurationService from '../services/subscription-duration.service';

const initialState = {
    subscriptionDurations: null,
    statusMessage: null,
    subscriptionDurationData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionDurationStore = defineStore('subscriptiondurationstore', {
    state: () => (initialState),
    actions: {
        async getDurationsForSubscription(id) {
            return SubscriptionDurationService.getDurationsForSubscription(id).then(
                subscriptionDurations => {
                    return Promise.resolve(subscriptionDurations.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});