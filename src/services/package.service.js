import axios from "./axios-setup";

class PackageService {
    createPackage(pkg) {
        return axios.post('/packages', pkg);
    }
    getPackages(params) {
        return axios.get('/packages', { params });
    }
    getPackage(id) {
        return axios.get(`/packages/${id}`);
    }
    updatePackage(id, body) {
        return axios.put(`/packages/${id}`, body);
    }
    deletePackage(id) {
        return axios.delete(`/packages/${id}`);
    }
}

export default new PackageService();