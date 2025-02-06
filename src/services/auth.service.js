import axios from './axios-setup';

class AuthService {
    async login(user) {
        const response = await axios
            .post('login', {
                email: user.email,
                password: user.password
            });
        if (response.data.access_token) {
            console.log(response.data);
            localStorage.setItem('auth', JSON.stringify(response.data));
        }
        return response.data;
    }

    logout() {
        localStorage.removeItem('auth');
    }
}

export default new AuthService();