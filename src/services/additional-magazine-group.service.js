import axios from "./axios-setup";

class AdditionalMagazineGroupService {
    createAdditionalMagazineGroup(additionalMagazineGroup) {
        return axios.post('/additional-magazine-groups', additionalMagazineGroup);
    }
    getAdditionalMagazineGroups(params) {
        return axios.get('/additional-magazine-groups', { params });
    }
    getAdditionalMagazineGroup(id) {
        return axios.get(`/additional-magazine-groups/${id}`);
    }
    updateAdditionalMagazineGroup(id, body) {
        return axios.put(`/additional-magazine-groups/${id}`, body);
    }
    deleteAdditionalMagazineGroup(id) {
        return axios.delete(`/additional-magazine-groups/${id}`);
    }
}

export default new AdditionalMagazineGroupService();