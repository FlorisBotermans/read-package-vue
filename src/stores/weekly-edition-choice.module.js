import { defineStore } from 'pinia'
import WeeklyEditionChoiceService from '../services/weekly-edition-choice.service';

const initialState = {
    weeklyEditionChoice: null,
    weeklyEditionChoices: null,
    statusMessage: null,
    weeklyEditionChoiceData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useWeeklyEditionChoiceStore = defineStore('weeklyeditionchoice', {
    state: () => (initialState),
    actions: {
        async createWeeklyEditionChoice(weeklyEditionChoice) {
            this.statusMessage = null;
            return WeeklyEditionChoiceService.createWeeklyEditionChoice(weeklyEditionChoice).then(
                weeklyEditionChoice => {
                    this.statusMessage = "Wekelijkse editie keuze succesvol aangemakaakt!";
                    return Promise.resolve(weeklyEditionChoice.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getWeeklyEditionChoices(params) {
            return WeeklyEditionChoiceService.getWeeklyEditionChoices(params).then(
                weeklyEditionChoices => {
                    return Promise.resolve(weeklyEditionChoices.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateWeeklyEditionChoice(id, body) {
            this.statusMessage = null;
            return WeeklyEditionChoiceService.updateWeeklyEditionChoice(id, body).then(
                weeklyEditionChoice => {
                    this.statusMessage = "Wekelijkse editie keuze succesvol aangepast!";
                    return Promise.resolve(weeklyEditionChoice.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteWeeklyEditionChoice(id) {
            this.statusMessage = null;
            return WeeklyEditionChoiceService.deleteWeeklyEditionChoice(id).then(
                weeklyEditionChoice => {
                    this.statusMessage = "Wekelijkse editie keuze succesvol verwijderd!";
                    return Promise.resolve(weeklyEditionChoice.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});