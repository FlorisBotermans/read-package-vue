<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateDurationDialog">Nieuwe looptijd</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.key" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditDurationDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeDurationPrompt(item)">mdi-delete</v-icon>
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
                    <v-form ref="form" v-model="valid">
                        <v-text-field v-model="duration.amount_of_months" label="Aantal maanden" required type="number"></v-text-field>
                        <v-text-field v-model="duration.promotion_message" label="Promotie bericht" required></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="durationDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateDuration() : createDuration()">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

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

const duration = ref({
    amount_of_months: '',
    promotion_message: '',
});

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Aantal maanden", value: "amount_of_months", sortable: true },
    { title: "Promotie bericht", value: "promotion_message", sortable: true },
]);

const showSnackbar = (message, color = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
}

const hideSnackbar = () => {
    snackbar.value = false;
};

const getDurations = async () => {
    loadingDataTable.value = true;

    const params = {
        page: page.value,
        items_per_page: itemsPerPage.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    }

    axios.get('/api/durations', { params })
        .then(response => {
            tableRows.value = response.data.data;
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            showSnackbar("Niet gelukt om looptijden op te halen.", "error");
        })
        .finally(() => {
            loadingDataTable.value = false;
        });
}

const createDuration = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.post('/api/durations', duration.value)
            .then(response => {
                showSnackbar("Looptijd succesvol aangemakaakt!", "success");
                getDurations();
                durationDialog.value = false;
                resetDuration();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om looptijd aan te maken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
}

const updateDuration = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.put(`/api/durations/${duration.value.id}`, duration.value)
            .then(response => {
                showSnackbar("Looptijd succesvol aangepast!", "success");
                getDurations();
                durationDialog.value = false;
                resetDuration();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om looptijd te bewerken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
}

const removeDuration = async (duration) => {
    if (duration) {
        loadingDialog.value = true;

        axios.delete(`/api/durations/${duration.id}`)
        .then(response => {
            getDurations();
            showSnackbar("Looptijd succesvol verwijderd!", "success");
        })
        .catch(error => {
            showSnackbar("Niet gelukt om looptijd te verwijderen.", "error");
        })
        .finally(() => {
            loadingDialog.value = false;
        });
    }
}

const showCreateDurationDialog = () => {
    isEditMode.value = false;
    resetDuration();
    durationDialog.value = true;
};

const showEditDurationDialog = () => {
    isEditMode.value = true;
    duration.value = { ...duration };
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