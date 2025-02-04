import axios from './axios-setup';

class UserService {
    getMe() {
        return axios.get('/user');
    }
}

export default new UserService();