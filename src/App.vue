<template>
  <v-app>
    <v-app-bar color="primary">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Read Package</v-app-bar-title>

      <template v-slot:append>
        <v-btn icon="mdi-dots-vertical"></v-btn>
      </template>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" theme="dark" permanent>
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
        <v-list-item link to="/editions">
          <v-list-item-title>Edities</v-list-item-title>
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
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area with Routing -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      drawer: true
    }
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer
    }
  }
}
</script>
