<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.person="{ item }">
                    {{ item.first_name }} {{ item.last_name }}
                </template>
                <template v-slot:item.created_at="{ item }">
                    {{ formatDate(item.created_at) }}
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="primary" @click="showSubscriptionOrderDetails(item)">
                                Bekijken
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table-server>
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
import { useRouter } from 'vue-router';
import { useSubscriptionOrderStore } from '../stores/subscription-order.module';

const router = useRouter();
const subscriptionOrderStore = useSubscriptionOrderStore();
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Person", value: "person", sortable: true },
    { title: "Email", value: "email", sortable: true },
    { title: "Datum", value: "created_at", sortable: true },
    { title: "Merk", value: "company_name", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const showSnackbar = (message, color = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

const hideSnackbar = () => {
    snackbar.value = false;
};

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getSubscriptionOrders();
    }, 500);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const getSubscriptionOrders = async () => {
    loadingDataTable.value = true;

    const params = {
        page: page.value,
        items_per_page: itemsPerPage.value,
        sort_by: sortBy.value[0].key === 'person' ? 'first_name' : sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
        include: 'subscription,simple_edition_choice,duration,gift,subscription_order_packages,subscription_order_packages.package,subscription_order_packages.option,subscription_order_packages.weekly_edition_choice,magazines,subscription_add_ons',
    };

    if (search.value) {
        params.query = search.value;
    }



    try {
        subscriptionOrderStore.subscriptionOrderData = await subscriptionOrderStore.getSubscriptionOrders(params);
        tableRows.value = subscriptionOrderStore.subscriptionOrderData.data;
        totalItems.value = subscriptionOrderStore.subscriptionOrderData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om bestellingen op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
};

const showSubscriptionOrderDetails = (item) => {
    router.push({
        name: 'subscription order details',
        params: { id: item.id },
    });
}

const updateOptions = (options) => {
    const currentSort = Array.isArray(sortBy.value) && sortBy.value.length > 0
        ? sortBy.value[0]
        : { key: 'id', order: 'asc' };

    const newSort = Array.isArray(options.sortBy) && options.sortBy.length > 0
        ? options.sortBy[0]
        : null;

    const shouldUpdateSort = newSort && (newSort.key !== currentSort.key || newSort.order !== currentSort.order);
    const shouldUpdatePagination = options.page !== page.value || options.itemsPerPage !== itemsPerPage.value;

    if (!newSort || shouldUpdateSort || shouldUpdatePagination) {
        if (!newSort) {
            sortBy.value = [{ key: 'id', order: 'asc' }];
        } else if (shouldUpdateSort) {
            sortBy.value[0] = newSort.key === 'person' ? { key: 'first_name', order: newSort.order } : newSort;
        }

        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;

        getSubscriptionOrders();
    }
};

onMounted(() => {
    getSubscriptionOrders();
});
</script>