<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateAdditionalMagazineDialog">Nieuwe optie</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loadingDataTable"
                @update:additionalMagazines="updateAditionalMagazines">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditAdditionalMagazineDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemoveAdditionalMagazineDialog(item)">mdi-delete</v-icon>

                    <v-icon color="warning" @click="showEditMagazineGroupDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemoveMagazineGroupDialog(item)">mdi-delete</v-icon>
                    <v-btn color="primary" @click="showAddMagazinesDialog(item)">Tijdschriften toevoegen</v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="optionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Optie Bewerken' : 'Nieuwe optie toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
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
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarMessage }}
            <template v-slot:action>
                <v-btn color="white" @click="hideSnackbar">Close</v-btn>
                <v-btn color="red" @click="confirmRemoveOption">Ja</v-btn>
                <v-btn color="grey" @click="hideSnackbar">Nee</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>
<script setup>
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

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

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Tijdschrift aantal", value: "magazine_amount", sortable: true },
    { title: "Levering type", value: "delivery_type", sortable: true },
    { title: "Levering naam", value: "delivery_name", sortable: true },
    { title: "Week prijs", value: "week_price", sortable: true },
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

const getOptions = async () => {
    loadingDataTable.value = true;

    const params = {
        page: page.value,
        items_per_page: itemsPerPage.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/options', { params })
        .then(response => {
            tableRows.value = response.data.data;
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            showSnackbar("Niet gelukt om opties op te halen.", "error");
        })
        .finally(() => {
            loadingDataTable.value = false;
        });
}

const createOption = () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.post('/api/options', option.value)
            .then(response => {
                showSnackbar("Optie succesvol aangemakaakt!", "success");
                getOptions();
                optionDialog.value = false;
                resetOption();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om optie aan te maken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateOption = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.put(`/api/options/${option.value.id}`, option.value)
            .then(response => {
                showSnackbar("Optie succesvol aangepast!", "success");
                getOptions();
                optionDialog.value = false;
                resetOption();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om optie te bewerken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeOption = async (option) => {
    if (option) {
        loadingDialog.value = true;

        axios.delete(`/api/options/${option.id}`)
            .then(response => {
                getOptions();
                showSnackbar("Optie succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om optie te verwijderen.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    }
};

const showCreateOptionDialog = () => {
    isEditMode.value = false;
    resetOption();
    optionDialog.value = true;
};

const showEditOptionDialog = (newOption) => {
    isEditMode.value = true;
    option.value = { ...newOption };
    option.value = true;
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