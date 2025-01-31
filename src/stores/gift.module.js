import { defineStore } from 'pinia'
import GiftService from '../services/gift.service';

const initialState = {
    gift: null,
    gifts: null,
    statusMessage: null,
    giftData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useGiftStore = defineStore('giftstore', {
    state: () => (initialState),
    actions: {
        async createGift(gift) {
            this.statusMessage = null;
            return GiftService.createGift(gift).then(
                gift => {
                    this.statusMessage = "Welkomscadeau succesvol aangemakaakt!";
                    return Promise.resolve(gift.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getGifts(params) {
            return GiftService.getGifts(params).then(
                gifts => {
                    return Promise.resolve(gifts.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateGift(id, body) {
            this.statusMessage = null;
            return GiftService.updateGift(id, body).then(
                gift => {
                    this.statusMessage = "Welkomscadeau succesvol aangepast!";
                    return Promise.resolve(gift.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteGift(id) {
            this.statusMessage = null;
            return GiftService.deleteGift(id).then(
                gift => {
                    this.statusMessage = "Welkomscadeau succesvol verwijderd!";
                    return Promise.resolve(gift.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});