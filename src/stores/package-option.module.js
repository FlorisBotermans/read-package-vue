import { defineStore } from 'pinia'
import PackageOptionService from '../services/package-option.service';

const initialState = {
    packageOptions: null,
    statusMessage: null,
    packageOptionData: {
        data: [],
        meta: {
            pagination: {
                total: 0,
            }
        }
    },
};

export const usePackageOptionStore = defineStore('packageoptionstore', {
    state: () => (initialState),
    actions: {
        async getOptionsForPackage(id) {
            return PackageOptionService.getOptionsForPackage(id).then(
                packageOptions => {
                    return Promise.resolve(packageOptions.data);
                },
                error => {
                    return Promise.reject(error);
                }
            );
        },
    }
});