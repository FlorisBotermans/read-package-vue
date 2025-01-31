import axios from "./axios-setup";

class MagazineService {
    createMagazine(magazine) {
        return axios.post('/api/magazines', magazine);
    }
    getMagazines(params) {
        return axios.get('/api/magazines', { params });
    }
    updateMagazine(id, body) {
        return axios.put(`/api/magazines/${id}`, body);
    }
    deleteMagazine(id) {
        return axios.delete(`/api/magazines/${id}`);
    }
}

export default new MagazineService();