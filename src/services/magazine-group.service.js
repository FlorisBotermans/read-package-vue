import axios from "./axios-setup";

class MagazineGroupService {
    createMagazineGroup(magazineGroup) {
        return axios.post('/magazine-groups', magazineGroup);
    }
    getMagazineGroups(params) {
        return axios.get('/magazine-groups', { params });
    }
    getMagazineGroup(id) {
        return axios.get(`/magazine-groups/${id}`);
    }
    updateMagazineGroup(id, body) {
        return axios.put(`/magazine-groups/${id}`, body);
    }
    deleteMagazineGroup(id) {
        return axios.delete(`/magazine-groups/${id}`);
    }
}

export default new MagazineGroupService();