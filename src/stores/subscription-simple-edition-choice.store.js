import { defineStore } from 'pinia'
import SubscriptionSimpleEditionChoiceService from '../services/subscription-simple-edition-choice.service';

const initialState = {
    subscriptionSimpleEditionChoices: null,
    statusMessage: null,
    subscriptionSimpleEditionChoiceData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionSimpleEditionChoiceStore = defineStore('subscriptionsimpleeditionchoice', {
    state: () => (initialState),
    actions: {
        async getSimpleEditionChoicesForSubscription(id) {
            return SubscriptionSimpleEditionChoiceService.getSimpleEditionChoicesForSubscription(id).then(
                subscriptionSimpleEditionChoices => {
                    return Promise.resolve(subscriptionSimpleEditionChoices.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});