import { defineStore } from 'pinia'
import AddressService from '../services/address.service';

const initialState = {
    addresses: null,
    statusMessage: null,
    addressData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useAddressStore = defineStore('addressstore', {
    state: () => (initialState),
    actions: {
        async getAddresses(params) {
            return AddressService.getAddresses(params).then(
                addresses => {
                    return Promise.resolve(addresses.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});