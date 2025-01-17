<template>
    <v-container>
        <h1>Home</h1>
        <p>Welcome to your CMS home!</p>
    </v-container>
</template>

<script setup>
import { onMounted } from 'vue';
import axios from 'axios';

onMounted(() => {
    axios.get('/sanctum/csrf-cookie').then(response => {
        console.log('CSRF cookie initialized:', response);
    }).catch(error => {
        console.error('Failed to initialize CSRF cookie:', error);
    });
})
</script>