<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateWeeklyEditionChoiceDialog">Nieuwe wekelijkse editie
                    keuze</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.week_price="{ item }">
                    €{{ parseFloat(item.week_price).toFixed(2) }}
                </template>
                <template v-slot:item.available="{ item }">
                    {{ item.available ? 'Ja' : 'Nee' }}
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditWeeklyEditionChoiceDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveWeeklyEditionChoiceDialog(item)">
                                Verwijder
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="weeklyEditionChoiceDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Wekelijkse editie keuze bewerken' : 'Nieuwe wekelijkse editie keuze toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateWeeklyEditionChoice() : createWeeklyEditionChoice()">
                        <v-text-field v-model="weeklyEditionChoice.name" label="Naam" required></v-text-field>
                        <v-text-field v-model="weeklyEditionChoice.week_price" label="Week prijs" type="number" required
                            min="0" step="1"></v-text-field>
                        <v-select v-model="weeklyEditionChoice.available" :items="[
                            { text: 'Ja', value: true },
                            { text: 'Nee', value: false }
                        ]" label="Beschikbaar" required item-title="text" item-value="value"></v-select>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="weeklyEditionChoiceDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateWeeklyEditionChoice() : createWeeklyEditionChoice()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteWeeklyEditionChoiceDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de wekelijkse editie keuze wilt verwijderen?</span>
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
import { useWeeklyEditionChoiceStore } from '../stores/weekly-edition-choice.module';

const weeklyEditionChoiceStore = useWeeklyEditionChoiceStore();
const weeklyEditionChoiceDialog = ref(false);
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
const weeklyEditionChoiceToDelete = ref(null);
const deleteWeeklyEditionChoiceDialog = ref(null);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Week prijs", value: "week_price", sortable: true },
    { title: "Beschikbaar", value: "available", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const weeklyEditionChoice = ref({
    name: '',
    week_price: '',
    available: true,
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
    return weeklyEditionChoice.value.name && weeklyEditionChoice.value.week_price;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getWeeklyEditionChoices();
    }, 500);
};

const getWeeklyEditionChoices = async () => {
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
        weeklyEditionChoiceStore.weeklyEditionChoiceData = await weeklyEditionChoiceStore.getWeeklyEditionChoices(params);
        tableRows.value = weeklyEditionChoiceStore.weeklyEditionChoiceData.data;
        totalItems.value = weeklyEditionChoiceStore.weeklyEditionChoiceData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om wekelijkse editie keuzes op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
};

const createWeeklyEditionChoice = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await weeklyEditionChoiceStore.createWeeklyEditionChoice(weeklyEditionChoice.value);
            showSnackbar("Wekelijkse editie keuze succesvol aangemakaakt!", "success");
            getWeeklyEditionChoices();
            resetWeeklyEditionChoice();
        } catch (error) {
            showSnackbar("Niet gelukt om wekelijkse editie keuze aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            weeklyEditionChoiceDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateWeeklyEditionChoice = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await weeklyEditionChoiceStore.updateWeeklyEditionChoice(weeklyEditionChoice.value.id, weeklyEditionChoice.value);
            showSnackbar("Wekelijkse editie keuze succesvol aangepast!", "success");
            getWeeklyEditionChoices();
            resetWeeklyEditionChoice();
        } catch (error) {
            showSnackbar("Niet gelukt om wekelijkse editie keuze te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            weeklyEditionChoiceDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeWeeklyEditionChoice = async (weeklyEditionChoice) => {
    if (weeklyEditionChoice) {
        loadingDialog.value = true;

        try {
            await weeklyEditionChoiceStore.deleteWeeklyEditionChoice(weeklyEditionChoice.id);
            showSnackbar("Wekelijkse editie keuze succesvol verwijderd!", "success");
            getWeeklyEditionChoices();
        } catch (error) {
            showSnackbar("Niet gelukt om wekelijkse editie keuze te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteWeeklyEditionChoiceDialog.value = false;
        }
    }
};

const showCreateWeeklyEditionChoiceDialog = () => {
    isEditMode.value = false;
    resetWeeklyEditionChoice();
    weeklyEditionChoiceDialog.value = true;
};

const cancelDelete = () => {
    deleteWeeklyEditionChoiceDialog.value = false;
    weeklyEditionChoiceToDelete.value = null;
};

const confirmDelete = () => {
    removeWeeklyEditionChoice(weeklyEditionChoiceToDelete.value);
};

const showRemoveWeeklyEditionChoiceDialog = (weeklyEditionChoice) => {
    weeklyEditionChoiceToDelete.value = weeklyEditionChoice;
    deleteWeeklyEditionChoiceDialog.value = true;
};

const showEditWeeklyEditionChoiceDialog = (newWeeklyEditionChoice) => {
    isEditMode.value = true;
    weeklyEditionChoice.value = {
        ...newWeeklyEditionChoice,
        available: !!newWeeklyEditionChoice.available,
    };
    weeklyEditionChoiceDialog.value = true;
};

const resetWeeklyEditionChoice = () => {
    weeklyEditionChoice.value = {
        name: '',
        week_price: '',
        available: true,
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

        getWeeklyEditionChoices();
    }
};

onMounted(() => {
    getWeeklyEditionChoices();
});

</script>