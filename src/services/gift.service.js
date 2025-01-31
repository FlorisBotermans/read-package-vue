import axios from "./axios-setup";

class GiftService {
    createGift(gift) {
        return axios.post('/api/gifts', gift);
    }
    getGifts(params) {
        return axios.get('/api/gifts', { params });
    }
    updateGift(id, body) {
        return axios.put(`/api/gifts/${id}`, body);
    }
    deleteGift(id) {
        return axios.delete(`/api/gifts/${id}`);
    }
}

export default new GiftService();