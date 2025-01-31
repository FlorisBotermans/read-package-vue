import { defineStore } from 'pinia'
import MagazineGroupMagazineService from '../services/magazine-group-magazine.service';

const initialState = {
    magazineGroupMagazines: null,
    statusMessage: null,
    magazineGroupMagazinesData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useMagazineGroupMagazineStore = defineStore('magazinegroupmagazinestore', {
    state: () => (initialState),
    actions: {
        async getMagazinesForMagazineGroup(id) {
            return MagazineGroupMagazineService.getMagazinesForMagazineGroup(id).then(
                magazineGroupMagazines => {
                    return Promise.resolve(magazineGroupMagazines.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});