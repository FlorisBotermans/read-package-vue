import axios from "./axios-setup";

class MagazineService {
    createMagazine(magazine) {
        return axios.post('/magazines', magazine);
    }
    getMagazines(params) {
        return axios.get('/magazines', { params });
    }
    updateMagazine(id, body) {
        return axios.put(`/magazines/${id}`, body);
    }
    deleteMagazine(id) {
        return axios.delete(`/magazines/${id}`);
    }
}

export default new MagazineService();