import axios from "./axios-setup";

class WeeklyEditionChoiceService {
    createWeeklyEditionChoice(weeklyEditionChoice) {
        return axios.post('/weekly-edition-choices', weeklyEditionChoice);
    }
    getWeeklyEditionChoices(params) {
        return axios.get('/weekly-edition-choices', { params });
    }
    updateWeeklyEditionChoice(id, body) {
        return axios.put(`/weekly-edition-choices/${id}`, body);
    }
    deleteWeeklyEditionChoice(id) {
        return axios.delete(`/weekly-edition-choices/${id}`);
    }
}

export default new WeeklyEditionChoiceService();