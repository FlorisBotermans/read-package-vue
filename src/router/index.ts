import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Gifts from '@/views/Gifts.vue'
import Packages from '@/views/Packages.vue'
import Editions from '@/views/Editions.vue'
import Maps from '@/views/Maps.vue'
import Durations from '@/views/Durations.vue'
import Options from '@/views/Options.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/packages', name: 'packages', component: Packages },
    { path: '/maps', name: 'maps', component: Maps },
    { path: '/options', name: 'options', component: Options },
    { path: '/editions', name: 'editions', component: Editions },
    { path: '/durations', name: 'durations', component: Durations },
    { path: '/gifts', name: 'gifts', component: Gifts },
  ],
})

export default router
