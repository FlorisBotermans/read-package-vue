import axios from "./axios-setup";

class PackageOptionService {
    getOptionsForPackage(id) {
        return axios.get(`/api/packages/${id}/options`);
    }
}

export default new PackageOptionService();