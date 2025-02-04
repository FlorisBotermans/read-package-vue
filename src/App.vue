<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary">
      <template v-slot:prepend>
        <v-app-bar-nav-icon v-if="currentAuth" @click="toggleDrawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Read Package</v-app-bar-title>

      <!-- User Icon Dropdown -->
      <template v-slot:append>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon>
              <v-icon>{{ currentAuth ? "mdi-account" : "mdi-account-outline" }}</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-if="currentAuth">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ currentUser.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ currentUser.email }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-divider v-if="currentAuth"></v-divider>

            <v-list-item v-if="currentAuth">
              <v-btn block color="error" @click.prevent="logout">
                <v-icon start>mdi-logout</v-icon> Afmelden
              </v-btn>
            </v-list-item>

            <v-list-item v-if="!currentAuth" @click="navigateTo('/login')">
              <v-list-item-title>Inloggen</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-if="currentAuth" v-model="drawer" theme="dark" permanent>
      <v-list>
        <v-list-item link to="/" exact>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/subscriptions">
          <v-list-item-title>Abonnementen</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/packages">
          <v-list-item-title>Pakketten</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/options">
          <v-list-item-title>Opties</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/magazines">
          <v-list-item-title>Tijdschriften</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/magazine-groups">
          <v-list-item-title>Tijdschrift groepen</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/additional-magazine-groups">
          <v-list-item-title>Aanvullende tijdschrift groepen</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/simple-edition-choices">
          <v-list-item-title>Simpele editie keuzes</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/weekly-edition-choices">
          <v-list-item-title>Wekelijkse editie keuzes</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/subscription-add-ons">
          <v-list-item-title>Abonnement add-ons</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/durations">
          <v-list-item-title>Looptijden</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/gifts">
          <v-list-item-title>Welkomscadeau's</v-list-item-title>
        </v-list-item>
        <v-list-item link to="/addresses">
          <v-list-item-title>Adressen</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area with Routing -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import pinia from "@/stores";
import { useAuthStore } from "@/stores/auth.module";
import { useAccountStore } from "@/stores/account.module";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const store = pinia;
    const authStore = useAuthStore();
    const accountStore = useAccountStore();
    const router = useRouter();

    accountStore.initAuthWatch();

    return {
      store,
      authStore,
      accountStore,
      router,
    };
  },
  data() {
    return {
      drawer: true,
    };
  },
  computed: {
    currentAuth() {
      return this.authStore.auth;
    },
    currentUser() {
      return this.accountStore.user;
    },
  },
  methods: {
    logout() {
      this.authStore.logout();
      this.router.push("/login");
    },
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    navigateTo(route) {
      this.router.push(route);
    },
  },
};
</script>
