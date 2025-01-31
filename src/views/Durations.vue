<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateDurationDialog">Nieuwe looptijd</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.key" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditDurationDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemoveDurationDialog(item)">mdi-delete</v-icon>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="durationDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Looptijd Bewerken' : 'Nieuwe looptijd toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid">
                        <v-text-field v-model="duration.amount_of_months" label="Aantal maanden" required
                            type="number"></v-text-field>
                        <v-text-field v-model="duration.promotion_message" label="Promotie bericht"
                            required></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="durationDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateDuration() : createDuration()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteDurationDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de looptijd wilt verwijderen?</span>
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
import { useDurationStore } from '../stores/duration.module';

const durationStore = useDurationStore();
const tableRows = ref([]);
const durationDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const page = ref(1);
const loadingDataTable = ref(false);
const loadingDialog = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const durationToDelete = ref(null);
const deleteDurationDialog = ref(null);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Aantal maanden", value: "amount_of_months", sortable: true },
    { title: "Promotie bericht", value: "promotion_message", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const duration = ref({
    amount_of_months: '',
    promotion_message: '',
});

const showSnackbar = (message, color = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
}

const hideSnackbar = () => {
    snackbar.value = false;
};

const isFormValid = computed(() => {
    return duration.value.amount_of_months && duration.value.promotion_message;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getDurations();
    }, 500);
};

const getDurations = async () => {
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
        durationStore.durationData = await durationStore.getDurations(params);
        tableRows.value = durationStore.durationData.data;
        totalItems.value = durationStore.durationData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om looptijden op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createDuration = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await durationStore.createDuration(duration.value);
            showSnackbar("Looptijd succesvol aangemakaakt!", "success");
            getDurations();
            resetDuration();
        } catch (error) {
            showSnackbar("Niet gelukt om looptijd aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            durationDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
}

const updateDuration = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await durationStore.updateDuration(duration.value.id, duration.value);
            showSnackbar("Looptijd succesvol aangepast!", "success");
            getDurations();
            resetDuration();
        } catch (error) {
            showSnackbar("Niet gelukt om looptijd te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            durationDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
}

const removeDuration = async (duration) => {
    if (duration) {
        loadingDialog.value = true;

        try {
            await durationStore.deleteDuration(duration.id);
            showSnackbar("Looptijd succesvol verwijderd!", "success");
            getDurations();
        } catch (error) {
            showSnackbar("Niet gelukt om looptijd te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteDurationDialog.value = false;
        }
    }
}

const showCreateDurationDialog = () => {
    isEditMode.value = false;
    resetDuration();
    durationDialog.value = true;
};

const cancelDelete = () => {
    deleteDurationDialog.value = false;
    durationToDelete.value = null;
};

const confirmDelete = () => {
    removeDuration(durationToDelete.value);
};

const showRemoveDurationDialog = (duration) => {
    durationToDelete.value = duration;
    deleteDurationDialog.value = true;
};

const showEditDurationDialog = (newDuration) => {
    isEditMode.value = true;
    duration.value = { ...newDuration };
    durationDialog.value = true;
};

const resetDuration = () => {
    duration.value = {
        amount_of_months: '',
        promotion_message: '',
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

        getDurations();
    }
};

onMounted(() => {
    getDurations();
});

</script>

<style scoped></style>