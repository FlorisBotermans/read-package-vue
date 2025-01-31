import { defineStore } from 'pinia'
import UserService from '../services/user.service';
import { useAuthStore } from "@/stores/auth.module";

const user = JSON.parse(localStorage.getItem('user'));
const initialState = user
    ? { user }
    : { user: null };

//const initialState = { user: {name: '', email:'', id: ''} };

export const useAccountStore = defineStore('accountstore', {
    state: () => (initialState),
    actions: {
        // Add a method to initialize the watch
        initAuthWatch() {
            const authStore = useAuthStore();
            authStore.$subscribe((mutation, state) => {
                if (authStore.auth != null) {
                    //Dit moet naar een aparte functie want dit moet volgens mij bij ieder bezoek van de Profile.vue aangeroepen worden.
                    return UserService.getMe().then(
                        user => {
                            console.log(user);
                            this.accountSuccess(user);
                            return Promise.resolve(user);
                        },
                        error => {
                            this.accountFailure();
                            return Promise.reject(error);
                        }
                    );
                }
            })
        },
        async updateMe(user) {
            return UserService.updateUser(user).then(
                user => {
                    console.info("store", user);
                    return Promise.resolve(user.data.data);
                },
                error => {
                    this.userFailure();
                    return Promise.reject(error);
                }
            );
        },
        accountSuccess(user) {
            localStorage.setItem('user', JSON.stringify(user.data));
            this.user = user.data;
        },
        accountFailure() {
            this.user = null;
        },
    },
});