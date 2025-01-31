import { defineStore } from 'pinia'
import DurationService from '../services/duration.service';

const initialState = {
    duration: null,
    durations: null,
    statusMessage: null,
    durationData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useDurationStore = defineStore('durationstore', {
    state: () => (initialState),
    actions: {
        async createDuration(duration) {
            this.statusMessage = null;
            return DurationService.createDuration(duration).then(
                duration => {
                    this.statusMessage = "Welkomscadeau succesvol aangemakaakt!";
                    return Promise.resolve(duration.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getDurations(params) {
            return DurationService.getDurations(params).then(
                durations => {
                    return Promise.resolve(durations.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateDuration(id, body) {
            this.statusMessage = null;
            return DurationService.updateDuration(id, body).then(
                duration => {
                    this.statusMessage = "Welkomscadeau succesvol aangepast!";
                    return Promise.resolve(duration.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteDuration(id) {
            this.statusMessage = null;
            return DurationService.deleteDuration(id).then(
                duration => {
                    this.statusMessage = "Welkomscadeau succesvol verwijderd!";
                    return Promise.resolve(duration.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});