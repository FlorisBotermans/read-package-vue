import { defineStore } from 'pinia'
import MagazineService from '../services/magazine.service';

const initialState = {
    magazine: null,
    magazines: null,
    statusMessage: null,
    magazineData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const useMagazineStore = defineStore('magazinestore', {
    state: () => (initialState),
    actions: {
        async createMagazine(magazine) {
            this.statusMessage = null;
            return MagazineService.createMagazine(magazine).then(
                magazine => {
                    this.statusMessage = "Tijdschrift succesvol aangemakaakt!";
                    return Promise.resolve(magazine.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getMagazines(params) {
            return MagazineService.getMagazines(params).then(
                magazines => {
                    return Promise.resolve(magazines.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updateMagazine(id, body) {
            this.statusMessage = null;
            return MagazineService.updateMagazine(id, body).then(
                magazine => {
                    this.statusMessage = "Tijdschrift succesvol aangepast!";
                    return Promise.resolve(magazine.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deleteMagazine(id) {
            this.statusMessage = null;
            return MagazineService.deleteMagazine(id).then(
                magazine => {
                    this.statusMessage = "Tijdschrift succesvol verwijderd!";
                    return Promise.resolve(magazine.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});