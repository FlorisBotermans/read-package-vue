import { defineStore } from 'pinia'
import SubscriptionService from '../services/subscription.service';

const initialState = {
    subscription: null,
    subscriptions: null,
    statusMessage: null,
    subscriptionData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionStore = defineStore('subscriptionstore', {
    state: () => (initialState),
    actions: {
        async createSubscription(subscription) {
            this.statusMessage = null;
            return SubscriptionService.createSubscription(subscription).then(
                subscription => {
                    this.statusMessage = "Abonnement succesvol aangemakaakt!";
                    return Promise.resolve(subscription.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getSubscriptions(params) {
            return SubscriptionService.getSubscriptions(params).then(
                subscriptions => {
                    return Promise.resolve(subscriptions.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async getSubscription(id) {
            return SubscriptionService.getSubscription(id).then(
                subscription => {
                    return Promise.resolve(subscription.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateSubscription(id, body) {
            this.statusMessage = null;
            return SubscriptionService.updateSubscription(id, body).then(
                subscription => {
                    this.statusMessage = "Abonnement succesvol aangepast!";
                    return Promise.resolve(subscription.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteSubscription(id) {
            this.statusMessage = null;
            return SubscriptionService.deleteSubscription(id).then(
                subscription => {
                    this.statusMessage = "Abonnement succesvol verwijderd!";
                    return Promise.resolve(subscription.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});