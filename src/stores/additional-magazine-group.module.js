import { defineStore } from 'pinia'
import AdditionalMagazineGroupService from '../services/additional-magazine-group.service';

const initialState = {
    additionalMagazineGroup: null,
    additionalMagazineGroups: null,
    statusMessage: null,
    additionalMagazineGroupData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useAdditionalMagazineGroupStore = defineStore('additionalmagazinegroupstore', {
    state: () => (initialState),
    actions: {
        async createAdditionalMagazineGroup(additionalMagazineGroup) {
            this.statusMessage = null;
            return AdditionalMagazineGroupService.createAdditionalMagazineGroup(additionalMagazineGroup).then(
                additionalMagazineGroup => {
                    this.statusMessage = "Aanvullende tijdschrift groep succesvol aangemakaakt!";
                    return Promise.resolve(additionalMagazineGroup.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getAdditionalMagazineGroups(params) {
            return AdditionalMagazineGroupService.getAdditionalMagazineGroups(params).then(
                additionalMagazineGroups => {
                    return Promise.resolve(additionalMagazineGroups.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async getAdditionalMagazineGroup(id) {
            return AdditionalMagazineGroupService.getAdditionalMagazineGroup(id).then(
                additionalMagazineGroup => {
                    return Promise.resolve(additionalMagazineGroup.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateAdditionalMagazineGroup(id, body) {
            this.statusMessage = null;
            return AdditionalMagazineGroupService.updateAdditionalMagazineGroup(id, body).then(
                additionalMagazineGroup => {
                    this.statusMessage = "Aanvullende tijdschrift groep succesvol aangepast!";
                    return Promise.resolve(additionalMagazineGroup.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteAdditionalMagazineGroup(id) {
            this.statusMessage = null;
            return AdditionalMagazineGroupService.deleteAdditionalMagazineGroup(id).then(
                additionalMagazineGroup => {
                    this.statusMessage = "Aanvullende tijdschrift groep succesvol verwijderd!";
                    return Promise.resolve(additionalMagazineGroup.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});