import axios from "./axios-setup";

class PackageWeeklyEditionChoiceService {
    getWeeklyEditionChoicesForPackage(id) {
        return axios.get(`/api/packages/${id}/weekly-edition-choices`);
    }
}

export default new PackageWeeklyEditionChoiceService();