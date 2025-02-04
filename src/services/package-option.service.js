import axios from "./axios-setup";

class PackageOptionService {
    getOptionsForPackage(id) {
        return axios.get(`/packages/${id}/options`);
    }
}

export default new PackageOptionService();