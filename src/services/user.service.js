import axios from './axios-setup';

class UserService {
    getAllUsers(page, search) {
        return axios.get('/api/users?page='+page+'&search='+search);
    }
    getMe() {
        return axios.get('api/user');
    }
    // getMeWithPermissions() {
    //     return axios.get('/me?permissions');
    // }
    getUser(id) {
        return axios.get(`/users/${id}`);
    }
    deleteUser(id) {
        return axios.delete(`/users/${id}`);
    }
    createUser(user) {
        return axios.post('/users', user);
    }
    updateUser(user) {
        return axios.put(`/users/${user.id}`, user);
    }
    // verifyUser(user) {
    //     return axios.post('/users/verify/', user);
    // }
    // getRoles() {
    //     return axios.get('/roles');
    // }
    // getCompanies() {
    //     return axios.get('/companies');
    // }
    // getUserTitles(id, page, search) {
    //     return axios.get('/users/' + id + '/titles?page=' + page + '&per_page=12&search=' + search);
    // }
    // getUserApps(id, page, search) {
    //     return axios.get('/users/' + id + '/apps?page=' + page + '&per_page=12&search=' + search);
    // }

    // getCompanyTitles(id) {
    //     return axios.get('/companies/'+id+'/titles');
    // }
    // setUserTitles(id, userTitles) {
    //     return axios.post('/users/'+id+'/titles', userTitles);
    // }
    // setUserApps(id, userApps) {
    //     return axios.post('/users/'+id+'/apps', userApps);
    // }
    // getMyApps(page, search) {
    //     if(page == null){
    //         return axios.get('/myapps');
    //     } else {
    //         return axios.get('/myapps?page=' + page + '&search=' + search);
    //     }
    // }
}

export default new UserService();