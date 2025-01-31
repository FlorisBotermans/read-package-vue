import { defineStore } from 'pinia'
import PackageService from '../services/package.service';

const initialState = {
    pkg: null,
    pkgs: null,
    statusMessage: null,
    packageData: {
        data: [],
        meta: {
            total: 0,
            last_page: 1,
        }
    },
};

export const usePackageStore = defineStore('packagestore', {
    state: () => (initialState),
    actions: {
        async createPackage(pkg) {
            this.statusMessage = null;
            return PackageService.createPackage(pkg).then(
                pkg => {
                    this.statusMessage = "Pakket succesvol aangemakaakt!";
                    return Promise.resolve(pkg.data.data);
                },
                error => {
                    console.log(error);
                    return Promise.reject(error);
                }
            );
        },
        async getPackages(params) {
            return PackageService.getPackages(params).then(
                pkgs => {
                    return Promise.resolve(pkgs.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async getPackage(id) {
            return PackageService.getPackage(id).then(
                pkg => {
                    return Promise.resolve(pkg.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async updatePackage(id, body) {
            this.statusMessage = null;
            return PackageService.updatePackage(id, body).then(
                pkg => {
                    this.statusMessage = "Pakket succesvol aangepast!";
                    return Promise.resolve(pkg.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
        async deletePackage(id) {
            this.statusMessage = null;
            return PackageService.deletePackage(id).then(
                pkg => {
                    this.statusMessage = "Pakket succesvol verwijderd!";
                    return Promise.resolve(pkg.data.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});