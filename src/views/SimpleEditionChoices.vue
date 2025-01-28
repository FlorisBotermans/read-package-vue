<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateSimpleEditionChoiceDialog">Nieuwe simpele editie keuze</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order"
                :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditSimpleEditionChoiceDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemoveSimpleEditionChoiceDialog(item)">mdi-delete</v-icon>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="simpleEditionChoiceDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Simpele editie keuze bewerken' : 'Nieuwe simpele editie keuze toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateSimpleEditionChoice() : createSimpleEditionChoice()">
                        <v-text-field v-model="simpleEditionChoice.name" label="Naam" required></v-text-field>
                        <v-text-field v-model="simpleEditionChoice.additional_price" label="Extra prijs" type="number" required min="0"
                            step="1"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="simpleEditionChoiceDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateSimpleEditionChoice() : createSimpleEditionChoice()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteSimpleEditionChoiceDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de simpele editie keuze wilt verwijderen?</span>
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
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const simpleEditionChoiceDialog = ref(false);
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
const simpleEditionChoiceToDelete = ref(null);
const deleteSimpleEditionChoiceDialog = ref(null);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Extra prijs", value: "additional_price", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const simpleEditionChoice = ref({
    name: '',
    additional_price: '',
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
    return simpleEditionChoice.value.name && simpleEditionChoice.value.additional_price;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getSimpleEditionChoices();
    }, 500);
}

const getSimpleEditionChoices = async () => {
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

    axios.get('/api/simple-edition-choices', { params })
        .then(response => {
            tableRows.value = response.data.data;
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            showSnackbar("Niet gelukt om simpele editie keuzes op te halen.", "error");
        })
        .finally(() => {
            loadingDataTable.value = false;
        });
}

const createSimpleEditionChoice = () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.post('/api/simple-edition-choices', simpleEditionChoice.value)
            .then(response => {
                showSnackbar("Simpele editie keuze succesvol aangemakaakt!", "success");
                getSimpleEditionChoices();
                resetSimpleEditionChoice();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om simpele editie keuze aan te maken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
                simpleEditionChoiceDialog.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateSimpleEditionChoice = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.put(`/api/simple-edition-choices/${simpleEditionChoice.value.id}`, simpleEditionChoice.value)
            .then(response => {
                showSnackbar("Simpele editie keuze succesvol aangepast!", "success");
                getSimpleEditionChoices();
                resetSimpleEditionChoice();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om simpele editie keuze te bewerken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
                simpleEditionChoiceDialog.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeSimpleEditionChoice = async (simpleEditionChoice) => {
    if (simpleEditionChoice) {
        loadingDialog.value = true;

        axios.delete(`/api/simple-edition-choices/${simpleEditionChoice.id}`)
            .then(response => {
                getSimpleEditionChoices();
                showSnackbar("Simpele editie keuze succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om simpele editie keuze te verwijderen.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
                deleteSimpleEditionChoiceDialog.value = false;
            });
    }
};

const showCreateSimpleEditionChoiceDialog = () => {
    isEditMode.value = false;
    resetSimpleEditionChoice();
    simpleEditionChoiceDialog.value = true;
};

const cancelDelete = () => {
    deleteSimpleEditionChoiceDialog.value = false;
    simpleEditionChoiceToDelete.value = null;
};

const confirmDelete = () => {
    removeSimpleEditionChoice(simpleEditionChoiceToDelete.value);
};

const showRemoveSimpleEditionChoiceDialog = (simpleEditionChoice) => {
    simpleEditionChoiceToDelete.value = simpleEditionChoice;
    deleteSimpleEditionChoiceDialog.value = true;
};

const showEditSimpleEditionChoiceDialog = (newSimpleEditionChoice) => {
    isEditMode.value = true;
    simpleEditionChoice.value = { ...newSimpleEditionChoice };
    simpleEditionChoiceDialog.value = true;
};

const resetSimpleEditionChoice = () => {
    simpleEditionChoice.value = {
        name: '',
        additional_price: '',
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

        getSimpleEditionChoices();
    }
};

onMounted(() => {
    getSimpleEditionChoices();
});

</script>