import { defineStore } from 'pinia'
import OptionService from '../services/option.service';

const initialState = {
    option: null,
    options: null,
    statusMessage: null,
    optionData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useOptionStore = defineStore('optionstore', {
    state: () => (initialState),
    actions: {
        async createOption(option) {
            this.statusMessage = null;
            return OptionService.createOption(option).then(
                option => {
                    this.statusMessage = "Optie succesvol aangemakaakt!";
                    return Promise.resolve(option.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getOptions(params) {
            return OptionService.getOptions(params).then(
                options => {
                    return Promise.resolve(options.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateOption(id, body) {
            this.statusMessage = null;
            return OptionService.updateOption(id, body).then(
                option => {
                    this.statusMessage = "Optie succesvol aangepast!";
                    return Promise.resolve(option.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteOption(id) {
            this.statusMessage = null;
            return OptionService.deleteOption(id).then(
                option => {
                    this.statusMessage = "Optie succesvol verwijderd!";
                    return Promise.resolve(option.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});