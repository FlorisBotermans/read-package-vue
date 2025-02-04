import axios from "./axios-setup";

class MagazineGroupMagazineService {
    getMagazinesForMagazineGroup(id) {
        return axios.get(`/magazine-groups/${id}/magazines`);
    }
}

export default new MagazineGroupMagazineService();