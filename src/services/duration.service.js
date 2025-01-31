import axios from "./axios-setup";

class DurationService {
    createDuration(duration) {
        return axios.post('/api/durations', duration);
    }
    getDurations(params) {
        return axios.get('/api/durations', { params });
    }
    updateDuration(id, body) {
        return axios.put(`/api/durations/${id}`, body);
    }
    deleteDuration(id) {
        return axios.delete(`/api/durations/${id}`);
    }
}

export default new DurationService();