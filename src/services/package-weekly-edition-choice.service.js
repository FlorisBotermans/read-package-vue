import axios from "./axios-setup";

class PackageWeeklyEditionChoiceService {
    getWeeklyEditionChoicesForPackage(id) {
        return axios.get(`/packages/${id}/weekly-edition-choices`);
    }
}

export default new PackageWeeklyEditionChoiceService();