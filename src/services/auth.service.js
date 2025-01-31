import axios from './axios-setup';

class AuthService {
    // async register(user) {
    //     const response = await axios
    //         .post('api/register', {
    //             name: user.name,
    //             email: user.email,
    //             password: user.password,
    //             password_confirmation: user.password_confirmation,
    //         });
    //     if (response.data.access_token) {
    //         console.log(response.data);
    //         localStorage.setItem('auth', JSON.stringify(response.data));
    //     }
    //     return response.data
    // }

    async login(user) {
        const response = await axios
            .post('api/login', {
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

    // register(user) {
    //     return axios.post('signup', {
    //         username: user.username,
    //         email: user.email,
    //         password: user.password
    //     });
    // }
}

export default new AuthService();