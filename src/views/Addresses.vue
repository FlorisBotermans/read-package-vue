<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
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
import { useAddressStore } from '../stores/address.module';

const addressStore = useAddressStore();
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Straat", value: "street", sortable: true },
    { title: "Huisnummer", value: "house_number", sortable: true },
    { title: "Postcode", value: "postal_code", sortable: true },
    { title: "Plaats", value: "city", sortable: true },
    { title: "Abonnement type", value: "subscription_type", sortable: true },
    { title: "Abonnement bedrijf", value: "subscription_company", sortable: true },
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
        getAddresses();
    }, 500);
};

const getAddresses = async () => {
    loadingDataTable.value = true;

    const params = {
        page: page.value,
        items_per_page: itemsPerPage.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    if (search.value) {
        params.query = search.value;
    };

    try {
        addressStore.addressData = await addressStore.getAddresses(params);
        tableRows.value = addressStore.addressData.data;
        totalItems.value = addressStore.addressData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om adressen op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
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
            sortBy.value[0] = newSort;
        }

        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;

        getAddresses();
    }
};

onMounted(() => {
    getAddresses();
});

</script>