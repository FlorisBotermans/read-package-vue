import axios from "./axios-setup";

class OptionService {
    createOption(option) {
        return axios.post('/options', option);
    }
    getOptions(params) {
        return axios.get('/options', { params });
    }
    updateOption(id, body) {
        return axios.put(`/options/${id}`, body);
    }
    deleteOption(id) {
        return axios.delete(`/options/${id}`);
    }
}

export default new OptionService();