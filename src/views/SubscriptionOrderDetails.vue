<template>
    <v-app>

        <v-card class="ma-4 pa-4 elevation-4">
            <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>
            <div v-if="order && !loading">
                <v-card-title class=" font-weight-bold text-primary">Bestelling details</v-card-title>
                <v-divider class="my-4"></v-divider>

                <v-card class="mb-4 pa-4 elevation-2">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Klant Informatie</v-card-title>
                    <v-card-text>
                        <v-list dense>
                            <v-list-item>
                                <v-list-item-title><strong>Naam:</strong> {{ order.first_name }} {{ order.last_name
                                    }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title><strong>Email:</strong> {{ order.email }}</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title><strong>Bedrijf:</strong> {{ order.company_name }} ({{
                                    order.company_type }})</v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-title>
                                    <strong>Adres:</strong> {{ order.street }} {{ order.house_number }}, {{
                                        order.city }}, {{ order.postal_code }}
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>

                <v-card class="mb-4 pa-4 elevation-2">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Abonnement Details</v-card-title>
                    <v-card-text>
                        <v-list dense>
                            <v-list-item>
                                <strong>Bedrijf:</strong> {{ order.subscription.data.company }}
                            </v-list-item>
                            <v-list-item>
                                <strong>Type:</strong> {{ order.subscription.data.type }}
                            </v-list-item>
                            <v-list-item>
                                <strong>Editie keuze:</strong> {{ order.simple_edition_choice.data.name }} (€{{
                                    order.simple_edition_choice.data.additional_price }})
                            </v-list-item>
                            <v-list-item>
                                <strong>Looptijd:</strong> {{ order.duration.data.amount_of_months }} maanden
                            </v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>

                <v-card class="mb-4 pa-4 elevation-2">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Pakketten</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col v-for="pkg in order.subscription_order_packages.data" :key="pkg.id" cols="12" md="6">
                                <v-card class="pa-3 elevation-3">
                                    <v-img v-if="pkg.package.data.image_url" :src="pkg.package.data.image_url"
                                        height="120" contain class="rounded-lg"></v-img>
                                    <v-card-title>{{ pkg.package.data.name }}</v-card-title>

                                    <v-card-text v-if="pkg.option">
                                        <v-list dense>
                                            <v-list-item>
                                                <strong>Tijdschriften:</strong> {{ pkg.option.data.magazine_amount }}
                                            </v-list-item>
                                            <v-list-item>
                                                <strong>Levering:</strong> {{ pkg.option.data.delivery_name }}
                                            </v-list-item>
                                            <v-list-item>
                                                <strong>Week prijs:</strong> €{{ pkg.option.data.week_price }}
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>

                                    <v-card-text v-if="pkg.weekly_edition_choice">
                                        <v-list dense>
                                            <v-list-item>
                                                <strong>Editie keuze:</strong>
                                            </v-list-item>
                                            <v-list-item>
                                                <strong>Week nummer:</strong> {{
                                                    pkg.weekly_edition_choice.data.week_number }}
                                            </v-list-item>
                                            <v-list-item>
                                                <strong>Week prijs:</strong> €{{
                                                    pkg.weekly_edition_choice.data.week_price }}
                                            </v-list-item>
                                        </v-list>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <v-card v-if="order.gift" class="mb-4 pa-4 elevation-2">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Welkomstcadeau</v-card-title>
                    <v-card-text>
                        <v-card class="d-flex flex-column align-center">
                            <v-img :src="order.gift.data.image_url" height="150" width="150" contain
                                class="rounded-lg"></v-img>
                            <v-card-title class="text-center">{{ order.gift.data.name }}</v-card-title>
                        </v-card>
                    </v-card-text>
                </v-card>

                <v-card v-if="order.magazines.data.length" class="mb-4 pa-4 elevation-2">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Aanvullende Tijdschriften</v-card-title>
                    <v-row>
                        <v-col v-for="magazine in order.magazines.data" :key="magazine.id" cols="12" sm="6" md="4">
                            <v-card class="elevation-3">
                                <v-img :src="magazine.image_url" height="150" class="rounded-lg"></v-img>
                                <v-card-title>{{ magazine.name }}</v-card-title>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>

                <v-card v-if="order.subscription_add_ons.data.length" class="mb-4 pa-4 elevation-2">
                    <v-card-title class="text-subtitle-1 font-weight-bold">Abonnement add-ons</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col v-for="addOn in order.subscription_add_ons.data" :key="addOn.id" cols="12" md="6">
                                <v-card class="pa-3 elevation-3">
                                    <v-img :src="addOn.image_url" height="120" contain class="rounded-lg"></v-img>
                                    <v-card-title>{{ addOn.name }}</v-card-title>
                                    <v-card-text>
                                        <p>{{ addOn.description }}</p>
                                        <p><strong>Prijs:</strong> €{{ addOn.price }}</p>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </div>
        </v-card>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarMessage }}
            <template v-slot:action>
                <v-btn color="white" @click="hideSnackbar">Close</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSubscriptionOrderStore } from '../stores/subscription-order.module';

const route = useRoute();
const subscriptionOrderStore = useSubscriptionOrderStore();
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const order = ref(null);
const loading = ref(false);

const showSnackbar = (message, color = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

const hideSnackbar = () => {
    snackbar.value = false;
};

const getSubscriptionOrder = async () => {
    loading.value = true;

    const params = {
        include: 'subscription,simple_edition_choice,duration,gift,subscription_order_packages,subscription_order_packages.package,subscription_order_packages.option,subscription_order_packages.weekly_edition_choice,magazines,subscription_add_ons',
    };

    try {
        const response = await subscriptionOrderStore.getSubscriptionOrder(route.params.id, params);
        order.value = response;
    } catch (error) {
        showSnackbar("Failed to load subscription order details.", "error");
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getSubscriptionOrder();
});
</script>