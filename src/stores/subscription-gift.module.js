import { defineStore } from 'pinia'
import SubscriptionGiftService from '../services/subscription-gift.service';

const initialState = {
    subscriptionGifts: null,
    statusMessage: null,
    subscriptionGiftData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionGiftStore = defineStore('subscriptiongiftstore', {
    state: () => (initialState),
    actions: {
        async getGiftsForSubscription(id) {
            return SubscriptionGiftService.getGiftsForSubscription(id).then(
                subscriptionGifts => {
                    return Promise.resolve(subscriptionGifts.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});