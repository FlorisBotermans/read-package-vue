import axios from "./axios-setup";

class SimpleEditionChoiceService {
    createSimpleEditionChoice(simpleEditionChoice) {
        return axios.post('/simple-edition-choices', simpleEditionChoice);
    }
    getSimpleEditionChoices(params) {
        return axios.get('/simple-edition-choices', { params });
    }
    updateSimpleEditionChoice(id, body) {
        return axios.put(`/simple-edition-choices/${id}`, body);
    }
    deleteSimpleEditionChoice(id) {
        return axios.delete(`/simple-edition-choices/${id}`);
    }
}

export default new SimpleEditionChoiceService();