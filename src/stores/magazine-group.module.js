import { defineStore } from 'pinia'
import MagazineGroupService from '../services/magazine-group.service';

const initialState = {
    magazineGroup: null,
    magazineGroups: null,
    statusMessage: null,
    magazineGroupData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useMagazineGroupStore = defineStore('magazinegroupstore', {
    state: () => (initialState),
    actions: {
        async createMagazineGroup(magazineGroup) {
            this.statusMessage = null;
            return MagazineGroupService.createMagazineGroup(magazineGroup).then(
                magazineGroup => {
                    this.statusMessage = "Tijdschrift groep succesvol aangemakaakt!";
                    return Promise.resolve(magazineGroup.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getMagazineGroups(params) {
            return MagazineGroupService.getMagazineGroups(params).then(
                magazineGroups => {
                    return Promise.resolve(magazineGroups.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async getMagazineGroup(id) {
            return MagazineGroupService.getMagazineGroup(id).then(
                magazineGroup => {
                    return Promise.resolve(magazineGroup.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateMagazineGroup(id, body) {
            this.statusMessage = null;
            return MagazineGroupService.updateMagazineGroup(id, body).then(
                magazineGroup => {
                    this.statusMessage = "Tijdschrift groep succesvol aangepast!";
                    return Promise.resolve(magazineGroup.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteMagazineGroup(id) {
            this.statusMessage = null;
            return MagazineGroupService.deleteMagazineGroup(id).then(
                magazineGroup => {
                    this.statusMessage = "Tijdschrift groep succesvol verwijderd!";
                    return Promise.resolve(magazineGroup.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});