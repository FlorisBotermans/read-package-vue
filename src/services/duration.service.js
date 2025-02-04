import axios from "./axios-setup";

class DurationService {
    createDuration(duration) {
        return axios.post('/durations', duration);
    }
    getDurations(params) {
        return axios.get('/durations', { params });
    }
    updateDuration(id, body) {
        return axios.put(`/durations/${id}`, body);
    }
    deleteDuration(id) {
        return axios.delete(`/durations/${id}`);
    }
}

export default new DurationService();