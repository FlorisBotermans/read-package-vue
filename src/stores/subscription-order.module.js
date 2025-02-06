import { defineStore } from 'pinia'
import SubscriptionOrderService from '../services/subscription-order.service';

const initialState = {
    subscriptionOrders: null,
    statusMessage: null,
    subscriptionOrderData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSubscriptionOrderStore = defineStore('subscriptionorderstore', {
    state: () => (initialState),
    actions: {
        async getSubscriptionOrders(params) {
            return SubscriptionOrderService.getSubscriptionOrders(params).then(
                subscriptionOrders => {
                    return Promise.resolve(subscriptionOrders.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async getSubscriptionOrder(id, params) {
            return SubscriptionOrderService.getSubscriptionOrder(id, params).then(
                subscriptionOrder => {
                    return Promise.resolve(subscriptionOrder.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});