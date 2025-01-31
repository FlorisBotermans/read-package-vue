import axios from "./axios-setup";

class PackageService {
    createPackage(pkg) {
        return axios.post('/api/packages', pkg);
    }
    getPackages(params) {
        return axios.get('/api/packages', { params });
    }
    getPackage(id) {
        return axios.get(`/api/packages/${id}`);
    }
    updatePackage(id, body) {
        return axios.put(`/api/packages/${id}`, body);
    }
    deletePackage(id) {
        return axios.delete(`/api/packages/${id}`);
    }
}

export default new PackageService();