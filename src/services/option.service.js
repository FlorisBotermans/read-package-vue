import axios from "./axios-setup";

class OptionService {
    createOption(option) {
        return axios.post('/api/options', option);
    }
    getOptions(params) {
        return axios.get('/api/options', { params });
    }
    updateOption(id, body) {
        return axios.put(`/api/options/${id}`, body);
    }
    deleteOption(id) {
        return axios.delete(`/api/options/${id}`);
    }
}

export default new OptionService();