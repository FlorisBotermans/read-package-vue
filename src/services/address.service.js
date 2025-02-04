import axios from "./axios-setup";

class AddressService {
    getAddresses(params) {
        return axios.get('/addresses', { params });
    }
}

export default new AddressService();