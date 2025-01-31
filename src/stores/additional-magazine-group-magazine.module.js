import { defineStore } from 'pinia'
import AdditionalMagazineGroupMagazineService from '../services/additional-magazine-group-magazine.service';

const initialState = {
    additionalMagazineGroupMagazines: null,
    statusMessage: null,
    additionalMagazineGroupMagazinesData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useAdditionalMagazineGroupMagazineStore = defineStore('additionalmagazinegroupmagazinestore', {
    state: () => (initialState),
    actions: {
        async getMagazinesForAdditionalMagazineGroup(id) {
            return AdditionalMagazineGroupMagazineService.getMagazinesForAdditionalMagazineGroup(id).then(
                additionalMagazineGroupMagazines => {
                    return Promise.resolve(additionalMagazineGroupMagazines.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});