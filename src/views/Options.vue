<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateOptionDialog">Nieuwe optie</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.week_price="{ item }">
                    €{{ parseFloat(item.week_price).toFixed(2) }}
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditOptionDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveOptionDialog(item)">
                                Verwijder
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="optionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Optie Bewerken' : 'Nieuwe optie toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid" @submit.prevent="isEditMode ? updateOption() : createOption()">
                        <v-text-field v-model="option.magazine_amount" label="Aantal tijdschriften" type="number"
                            required min="0" step="1"></v-text-field>
                        <v-text-field v-model="option.delivery_type" label="Levering type" required></v-text-field>
                        <v-text-field v-model="option.delivery_name" label="Levering naam" required></v-text-field>
                        <v-text-field v-model="option.week_price" label="Week prijs" type="number" required min="0"
                            step="1"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="optionDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateOption() : createOption()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteOptionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de optie wilt verwijderen?</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancelDelete">Annuleer</v-btn>
                    <v-btn color="red darken-1" text @click="confirmDelete">Doorgaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarMessage }}
            <template v-slot:action>
                <v-btn color="white" @click="hideSnackbar">Close</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOptionStore } from '../stores/option.module';

const optionStore = useOptionStore();
const optionDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const loadingDialog = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const optionToDelete = ref(null);
const deleteOptionDialog = ref(null);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Tijdschrift aantal", value: "magazine_amount", sortable: true },
    { title: "Levering type", value: "delivery_type", sortable: true },
    { title: "Levering naam", value: "delivery_name", sortable: true },
    { title: "Week prijs", value: "week_price", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const option = ref({
    magazine_amount: '',
    delivery_type: '',
    delivery_name: '',
    week_price: '',
});

const showSnackbar = (message, color = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

const hideSnackbar = () => {
    snackbar.value = false;
};

const isFormValid = computed(() => {
    return option.value.magazine_amount && option.value.delivery_type && option.value.delivery_name && option.value.week_price;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getOptions();
    }, 500);
};

const getOptions = async () => {
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
        optionStore.optionData = await optionStore.getOptions(params);
        tableRows.value = optionStore.optionData.data;
        totalItems.value = optionStore.optionData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om opties op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createOption = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await optionStore.createOption(option.value);
            showSnackbar("Optie succesvol aangemakaakt!", "success");
            getOptions();
            resetOption();
        } catch (error) {
            showSnackbar("Niet gelukt om optie aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            optionDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateOption = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await optionStore.updateOption(option.value.id, option.value);
            showSnackbar("Optie succesvol aangepast!", "success");
            getOptions();
            resetOption();
        } catch (error) {
            showSnackbar("Niet gelukt om optie te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            optionDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeOption = async (option) => {
    if (option) {
        loadingDialog.value = true;

        try {
            await optionStore.deleteOption(option.id);
            showSnackbar("Optie succesvol verwijderd!", "success");
            getOptions();
        } catch (error) {
            showSnackbar("Niet gelukt om optie te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteOptionDialog.value = false;
        }
    }
};

const showCreateOptionDialog = () => {
    isEditMode.value = false;
    resetOption();
    optionDialog.value = true;
};

const cancelDelete = () => {
    deleteOptionDialog.value = false;
    optionToDelete.value = null;
};

const confirmDelete = () => {
    removeOption(optionToDelete.value);
};

const showRemoveOptionDialog = (option) => {
    optionToDelete.value = option;
    deleteOptionDialog.value = true;
};

const showEditOptionDialog = (newOption) => {
    isEditMode.value = true;
    option.value = { ...newOption };
    optionDialog.value = true;
};

const resetOption = () => {
    option.value = {
        magazine_amount: '',
        delivery_type: '',
        delivery_name: '',
        week_price: '',
    };
};

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

        getOptions();
    }
};

onMounted(() => {
    getOptions();
});

</script>