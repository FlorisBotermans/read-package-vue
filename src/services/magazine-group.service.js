import axios from "./axios-setup";

class MagazineGroupService {
    createMagazineGroup(magazineGroup) {
        return axios.post('/api/magazine-groups', magazineGroup);
    }
    getMagazineGroups(params) {
        return axios.get('/api/magazine-groups', { params });
    }
    getMagazineGroup(id) {
        return axios.get(`/api/magazine-groups/${id}`);
    }
    updateMagazineGroup(id, body) {
        return axios.put(`/api/magazine-groups/${id}`, body);
    }
    deleteMagazineGroup(id) {
        return axios.delete(`/api/magazine-groups/${id}`);
    }
}

export default new MagazineGroupService();