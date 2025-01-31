import { defineStore } from 'pinia'
import SimpleEditionChoiceService from '../services/simple-edition-choice.service';

const initialState = {
    simpleEditionChoice: null,
    simpleEditionChoices: null,
    statusMessage: null,
    simpleEditionChoiceData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useSimpleEditionChoiceStore = defineStore('simpleeditionchoicestore', {
    state: () => (initialState),
    actions: {
        async createSimpleEditionChoice(simpleEditionChoice) {
            this.statusMessage = null;
            return SimpleEditionChoiceService.createSimpleEditionChoice(simpleEditionChoice).then(
                simpleEditionChoice => {
                    this.statusMessage = "Simpele editie keuze succesvol aangemakaakt!";
                    return Promise.resolve(simpleEditionChoice.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getSimpleEditionChoices(params) {
            return SimpleEditionChoiceService.getSimpleEditionChoices(params).then(
                simpleEditionChoices => {
                    return Promise.resolve(simpleEditionChoices.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateSimpleEditionChoice(id, body) {
            this.statusMessage = null;
            return SimpleEditionChoiceService.updateSimpleEditionChoice(id, body).then(
                simpleEditionChoice => {
                    this.statusMessage = "Simpele editie keuze succesvol aangepast!";
                    return Promise.resolve(simpleEditionChoice.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteSimpleEditionChoice(id) {
            this.statusMessage = null;
            return SimpleEditionChoiceService.deleteSimpleEditionChoice(id).then(
                simpleEditionChoice => {
                    this.statusMessage = "Simpele editie keuze succesvol verwijderd!";
                    return Promise.resolve(simpleEditionChoice.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});