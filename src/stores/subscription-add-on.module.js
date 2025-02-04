import { defineStore } from 'pinia'
import SubscriptionAddOnService from '../services/subscription-add-on.service';

const initialState = {
    subscriptionAddOn: null,
    subscriptionAddOns: null,
    statusMessage: null,
    subscriptionAddOnData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionAddOnStore = defineStore('subscriptionaddonstore', {
    state: () => (initialState),
    actions: {
        async createSubscriptionAddOn(subscriptionAddOn) {
            this.statusMessage = null;
            return SubscriptionAddOnService.createSubscriptionAddOn(subscriptionAddOn).then(
                subscriptionAddOn => {
                    this.statusMessage = "Abonnement add-on succesvol aangemakaakt!";
                    return Promise.resolve(subscriptionAddOn.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getSubscriptionAddOns(params) {
            return SubscriptionAddOnService.getSubscriptionAddOns(params).then(
                subscriptionAddOns => {
                    return Promise.resolve(subscriptionAddOns.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateSubscriptionAddOn(id, body) {
            this.statusMessage = null;
            return SubscriptionAddOnService.updateSubscriptionAddOn(id, body).then(
                subscriptionAddOn => {
                    this.statusMessage = "Abonnement add-on succesvol aangepast!";
                    return Promise.resolve(subscriptionAddOn.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteSubscriptionAddOn(id) {
            this.statusMessage = null;
            return SubscriptionAddOnService.deleteSubscriptionAddOn(id).then(
                subscriptionAddOn => {
                    this.statusMessage = "Abonnement add-on succesvol verwijderd!";
                    return Promise.resolve(subscriptionAddOn.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});