<template>
    <v-app>
        <v-row justify="center">
            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title>
                        <span class="headline">Login</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="handleLogin">
                            <v-text-field v-model="user.email" :rules="emailRules" label="Email" required
                                :error-messages="emailError"></v-text-field>
                            <v-text-field v-model="user.password" label="Password" type="password" required
                                :error-messages="passwordError"></v-text-field>
                            <v-alert v-if="loginError" type="error" dense>{{ loginError }}</v-alert>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn :disabled="loading" color="primary" @click="handleLogin">Login</v-btn>
                    </v-card-actions>
                    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
                </v-card>
            </v-col>
        </v-row>
    </v-app>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.module';
import User from '../models/User';

const authStore = useAuthStore();
const loggedIn = computed(() => authStore.status.loggedIn);
const loading = ref(false);
const user = ref(new User("", ""));
const valid = ref(false);

const emailError = ref("");
const passwordError = ref("");
const loginError = ref("");

const emailRules = [
    (v) => !!v || 'Email is verplicht.',
    (v) => /.+@.+\..+/.test(v) || 'Voer een geldig e-mailadres in.',
];

const router = useRouter();

const handleLogin = async () => {
    emailError.value = "";
    passwordError.value = "";
    loginError.value = "";

    if (!user.value.email) {
        emailError.value = "Email is verplicht.";
    } else if (!/.+@.+\..+/.test(user.value.email)) {
        emailError.value = "Voer een geldig e-mailadres in.";
    }

    if (!user.value.password) {
        passwordError.value = "Wachtwoord is verplicht.";
    }

    if (emailError.value || passwordError.value) {
        return;
    }

    loading.value = true;
    try {
        await authStore.login(user.value);
        await router.push("/");
    } catch (err) {
        loginError.value = "Deze combinatie van e-mailadres en wachtwoord is niet geldig.";
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    if (loggedIn.value) {
        router.push("/");
    }
});
</script>

<style scoped>
.headline {
    font-weight: bold;
}
</style>