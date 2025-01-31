import axios from "./axios-setup";

class WeeklyEditionChoiceService {
    createWeeklyEditionChoice(weeklyEditionChoice) {
        return axios.post('/api/weekly-edition-choices', weeklyEditionChoice);
    }
    getWeeklyEditionChoices(params) {
        return axios.get('/api/weekly-edition-choices', { params });
    }
    updateWeeklyEditionChoice(id, body) {
        return axios.put(`/api/weekly-edition-choices/${id}`, body);
    }
    deleteWeeklyEditionChoice(id) {
        return axios.delete(`/api/weekly-edition-choices/${id}`);
    }
}

export default new WeeklyEditionChoiceService();