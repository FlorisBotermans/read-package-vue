
import AuthService from '../services/auth.service';

import { defineStore } from 'pinia'

const auth = JSON.parse(localStorage.getItem('auth'));
const initialState = auth
    ? { status: { loggedIn: true }, auth }
    : { status: { loggedIn: false }, auth: null };


export const useAuthStore = defineStore('authstore', {
    state: () => (initialState),
    actions: {
        async login(auth) {
            return AuthService.login(auth).then(
                auth => {
                    this.loginSuccess(auth);
                    return Promise.resolve(auth);
                },
                error => {
                    this.loginFailure();
                    return Promise.reject(error);
                }
            );
        },
        // async register(user) {
        //     return AuthService.register(user).then(
        //         response => {
        //             this.registerSuccess(user);
        //             return Promise.resolve(response);
        //         },
        //         error => {
        //             this.loginFailure();
        //             return Promise.reject(error);
        //         }
        //     );
        // },
        logout() {
            AuthService.logout();
            this.loggedIn = false;
            this.auth = null;
        },
        loginSuccess(auth) {
            this.status.loggedIn = true;
            this.auth = auth;
        },
        loginFailure() {
            console.log("fail");
            this.status.loggedIn = false;
            this.auth = null;
        },
        // registerSuccess(user) {
        //     this.status.loggedIn = true;
        //     this.auth = user;
        // },
        // registerFailure() {
        //     this.status.loggedIn = false;
        //     this.auth = null;
        // }
    },
});