<template>
    <v-app>
        <v-row justify="center">
            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title>
                        <span class="headline">Registreer</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form v-model="valid" ref="form" @submit.prevent="handleRegister">
                            <v-text-field v-model="name" :rules="nameRules" label="Naam" required></v-text-field>

                            <v-text-field v-model="email" :rules="emailRules" label="Email" required></v-text-field>

                            <v-text-field v-model="password" :rules="passwordRules" label="Wachtwoord" type="password"
                                required></v-text-field>

                            <v-text-field v-model="passwordConfirmation" :rules="passwordConfirmationRules"
                                label="Bevestig wachtwoord" type="password" required></v-text-field>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="handleRegister">Registreer</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-app>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth.module';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();

const loggedIn = computed(() => authStore.status.loggedIn);
const loading = ref(false);

// Form state
const valid = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');

const router = useRouter();

// Validation rules
const nameRules = [
    v => !!v || 'Name is required',
    v => (v && v.length <= 255) || 'Name must be less than 255 characters',
];

const emailRules = [
    v => !!v || 'Email is required',
    v => /.+@.+\..+/.test(v) || 'Email must be valid',
];

const passwordRules = [
    v => !!v || 'Password is required',
    v => (v && v.length >= 8) || 'Password must be at least 8 characters',
];

const passwordConfirmationRules = [
    v => !!v || 'Password confirmation is required',
    v => v === password.value || 'Passwords must match',
];

// Form submission handler
const handleRegister = async () => {
    // try {
    //     const response = await axios.post('/api/register', {
    //         name: name.value,
    //         email: email.value,
    //         password: password.value,
    //         password_confirmation: passwordConfirmation.value,
    //     });
    //     console.log('User registered:', response.data);
    // } catch (error) {
    //     console.error('Error registering user:', error.response.data);
    // }
    try {
        loading.value = true;
        await authStore.register({
            name: name.value,
            email: email.value,
            password: password.value,
            password_confirmation: passwordConfirmation.value,
        });
        await router.push("/");
    } catch (error) {
        loading.value = false;
    }
};

onMounted(() => {
    if (loggedIn.value) {
        router.push("/");
    }
});

</script>

<style scoped></style>