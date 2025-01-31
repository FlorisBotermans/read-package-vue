import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify'
// import axios from 'axios';
import pinia from './stores';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
    },
    components,
    directives,
});

const app = createApp(App).use(vuetify)

// axios.defaults.baseURL = 'https://8ee819f83c537e.lhr.life';

app.use(router).use(pinia)

app.mount('#app')
