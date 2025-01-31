import { defineStore } from 'pinia'
import PackageWeeklyEditionChoiceService from '../services/package-weekly-edition-choice.service';

const initialState = {
    packageWeeklyEditionChoices: null,
    statusMessage: null,
    packageWeeklyEditionChoiceData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const usePackageWeeklyEditionChoiceStore = defineStore('packageweeklyeditionchoice', {
    state: () => (initialState),
    actions: {
        async getWeeklyEditionChoicesForPackage(id) {
            return PackageWeeklyEditionChoiceService.getWeeklyEditionChoicesForPackage(id).then(
                packageWeeklyEditionChoices => {
                    return Promise.resolve(packageWeeklyEditionChoices.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});