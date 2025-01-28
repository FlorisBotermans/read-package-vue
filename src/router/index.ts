import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Gifts from '@/views/Gifts.vue'
import Subscriptions from '@/views/Subscriptions.vue'
import Editions from '@/views/Editions.vue'
import Packages from '@/views/Packages.vue'
import Durations from '@/views/Durations.vue'
import Options from '@/views/Options.vue'
import MagazineGroups from '@/views/MagazineGroups.vue'
import Magazines from '@/views/Magazines.vue'
import AdditionalMagazineGroups from '@/views/AdditionalMagazineGroups.vue'
import SimpleEditionChoices from '@/views/SimpleEditionChoices.vue'
import WeeklyEditionChoices from '@/views/WeeklyEditionChoices.vue'
import SubscriptionAddOns from '@/views/SubscriptionAddOns.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/subscriptions', name: 'subscriptions', component: Subscriptions },
    { path: '/packages', name: 'packages', component: Packages },
    { path: '/options', name: 'options', component: Options },
    { path: '/magazines', name: 'magazines', component: Magazines },
    { path: '/magazine-groups', name: 'magazine groups', component: MagazineGroups },
    { path: '/additional-magazine-groups', name: 'additional magazine groups', component: AdditionalMagazineGroups },
    { path: '/editions', name: 'editions', component: Editions },
    { path: '/simple-edition-choices', name: 'simple edition choices', component: SimpleEditionChoices },
    { path: '/weekly-edition-choices', name: 'weekly edition choices', component: WeeklyEditionChoices },
    { path: '/subscription-add-ons', name: 'subscription add ons', component: SubscriptionAddOns },
    { path: '/durations', name: 'durations', component: Durations },
    { path: '/gifts', name: 'gifts', component: Gifts },
  ],
})

export default router
