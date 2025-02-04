import axios from "./axios-setup";

class GiftService {
    createGift(gift) {
        return axios.post('/gifts', gift);
    }
    getGifts(params) {
        return axios.get('/gifts', { params });
    }
    updateGift(id, body) {
        return axios.put(`/gifts/${id}`, body);
    }
    deleteGift(id) {
        return axios.delete(`/gifts/${id}`);
    }
}

export default new GiftService();