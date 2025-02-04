import axios from "./axios-setup";

class AdditionalMagazineGroupMagazineService {
    getMagazinesForAdditionalMagazineGroup(id) {
        return axios.get(`/additional-magazine-groups/${id}/magazines`);
    }
}

export default new AdditionalMagazineGroupMagazineService();