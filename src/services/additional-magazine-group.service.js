import axios from "./axios-setup";

class AdditionalMagazineGroupService {
    createAdditionalMagazineGroup(additionalMagazineGroup) {
        return axios.post('/api/additional-magazine-groups', additionalMagazineGroup);
    }
    getAdditionalMagazineGroups(params) {
        return axios.get('/api/additional-magazine-groups', { params });
    }
    getAdditionalMagazineGroup(id) {
        return axios.get(`/api/additional-magazine-groups/${id}`);
    }
    updateAdditionalMagazineGroup(id, body) {
        return axios.put(`/api/additional-magazine-groups/${id}`, body);
    }
    deleteAdditionalMagazineGroup(id) {
        return axios.delete(`/api/additional-magazine-groups/${id}`);
    }
}

export default new AdditionalMagazineGroupService();