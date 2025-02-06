import { createRouter, createWebHistory } from 'vue-router'
import Gifts from '@/views/Gifts.vue'
import Subscriptions from '@/views/Subscriptions.vue'
import Packages from '@/views/Packages.vue'
import Durations from '@/views/Durations.vue'
import Options from '@/views/Options.vue'
import MagazineGroups from '@/views/MagazineGroups.vue'
import Magazines from '@/views/Magazines.vue'
import AdditionalMagazineGroups from '@/views/AdditionalMagazineGroups.vue'
import SimpleEditionChoices from '@/views/SimpleEditionChoices.vue'
import WeeklyEditionChoices from '@/views/WeeklyEditionChoices.vue'
import SubscriptionAddOns from '@/views/SubscriptionAddOns.vue'
import Login from '@/views/Login.vue'
import Addresses from '@/views/Addresses.vue'
import SubscriptionOrders from '@/views/SubscriptionOrders.vue'
import SubscriptionOrderDetails from '@/views/SubscriptionOrderDetails.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/subscriptions',
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: Subscriptions,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/packages',
      name: 'packages',
      component: Packages,
      meta: { requiresAuth: true },
    },
    {
      path: '/options',
      name: 'options',
      component: Options,
      meta: { requiresAuth: true },
    },
    {
      path: '/magazines',
      name: 'magazines',
      component: Magazines,
      meta: { requiresAuth: true },
    },
    {
      path: '/magazine-groups',
      name: 'magazine groups',
      component: MagazineGroups,
      meta: { requiresAuth: true },
    },
    {
      path: '/additional-magazine-groups',
      name: 'additional magazine groups',
      component: AdditionalMagazineGroups,
      meta: { requiresAuth: true },
    },
    {
      path: '/simple-edition-choices',
      name: 'simple edition choices',
      component: SimpleEditionChoices,
      meta: { requiresAuth: true },
    },
    {
      path: '/weekly-edition-choices',
      name: 'weekly edition choices',
      component: WeeklyEditionChoices,
      meta: { requiresAuth: true },
    },
    {
      path: '/subscription-add-ons',
      name: 'subscription add ons',
      component: SubscriptionAddOns,
      meta: { requiresAuth: true },
    },
    {
      path: '/durations',
      name: 'durations',
      component: Durations,
      meta: { requiresAuth: true },
    },
    {
      path: '/gifts',
      name: 'gifts',
      component: Gifts,
      meta: { requiresAuth: true },
    },
    {
      path: '/addresses',
      name: 'addresses',
      component: Addresses,
      meta: { requiresAuth: true },
    },
    {
      path: '/subscription-orders',
      name: 'subscription orders',
      component: SubscriptionOrders,
      meta: { requiresAuth: true },
    },
    {
      path: '/subscription-orders/:id',
      name: 'subscription order details',
      component: SubscriptionOrderDetails,
      meta: { requiresAuth: true },
    },
    // {
    //   path: '/:catchAll(.*)',  // Catch-all route for 404
    //   name: 'NotFound',
    //   component: NotFound,
    //   meta: { requiresAuth: false },
    // },
  ],
});

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('auth');
  if (to.meta.requiresAuth && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router
