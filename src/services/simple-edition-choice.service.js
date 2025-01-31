import axios from "./axios-setup";

class SimpleEditionChoiceService {
    createSimpleEditionChoice(simpleEditionChoice) {
        return axios.post('/api/simple-edition-choices', simpleEditionChoice);
    }
    getSimpleEditionChoices(params) {
        return axios.get('/api/simple-edition-choices', { params });
    }
    updateSimpleEditionChoice(id, body) {
        return axios.put(`/api/simple-edition-choices/${id}`, body);
    }
    deleteSimpleEditionChoice(id) {
        return axios.delete(`/api/simple-edition-choices/${id}`);
    }
}

export default new SimpleEditionChoiceService();