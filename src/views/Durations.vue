<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateDurationDialog">Nieuwe looptijd</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.key" :server-items-length="totalItems" :loading="loading"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditDurationDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeDurationPrompt(item)">mdi-delete</v-icon>
                </template>
            </v-data-table>
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
                        <!-- <v-text-field v-model="duration.addition" label="Extra" required></v-text-field> -->
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
const loading = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);

const duration = ref({
    amount_of_months: '',
});

const headers = ref([
    { text: "Id", value: "id", sortable: true },
    { text: "Aantal maanden", value: "amount_of_months", sortable: true },
]);

// Computed property
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const getDurations = async () => {
    loading.value = true;
    const url = '/api/durations';

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    }

    axios.get(url, { params })
        .then(response => {
            tableRows.value = response.data.data;
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            toast.error("Niet gelukt om looptijden op te halen.", { duration: 2500 });
        })
        .finally(() => {
            loading.value = false;
        })
}

const createDuration = async () => {
    if (valid.value) {
        loading.value = true;

        axios.post('/api/durations', duration.value)
            .then(response => {
                toast.success("Looptijd succesvol aangemaakt!", { duration: 2500 });
                getDurations();
                durationDialog.value = false;
                resetDuration();
            })
            .catch(error => {
                toast.error("Niet gelukt om looptijd aan te maken.", { duration: 2500 });
            })
            .finally(() => {
                loading.value = false;
            })
    } else {
        toast.error("Onjuiste invoer.", { duration: 2500 });
    }
}

const updateDuration = async (duration) => {
    if (valid.value) {
        loading.value = true;
        axios.put(`/api/durations/${duration.value.id}`, duration.value)
            .then(response => {
                toast.success("Looptijd succesvol bijgewerkt", { duration: 2500 });
                getDurations();
                durationDialog.value = false;
            })
            .catch(error => {
                toast.error("Niet gelukt om looptijd bij te werken.", { duration: 2500 });
            })
            .finally(() => {
                loading.value = false;
            });
    } else {
        toast.error("Onjuiste invoer.", { duration: 2500 });
    }
}

const removeDuration = async (duration) => {
    loading.value = true;
    const indexOf = tableRows.value.indexOf(duration);
    axios.delete(`/api/durations/${duration.id}`)
        .then(response => {
            if (indexOf > -1) {
                tableRows.value.splice(indexOf, 1);
                totalItems.value -= 1;
            }
            toast.success("Looptijd is verwijderd.", { duration: 2500 });
            getDurations();
        })
        .catch(error => {
            toast.error("Niet gelukt om looptijd te verwijderen.", { duration: 2500 });
        })
        .finally(() => {
            loading.value = false;
        })
}

const removeDurationPrompt = (duration) => {
    toast.show("Weet u zeker dat u de looptijd wilt verwijderen?", {
        action: [
            {
                text: "Ja",
                onClick: (e, toast) => {
                    toast.goAway(0);
                    removeDuration(duration);
                },
            },
            {
                text: "Nee",
                onClick: (e, toast) => {
                    toast.goAway(0);
                },
            },
        ],
    });
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
    };
}

const updateOptions = (options) => {
    if (!options.sortBy || options.sortBy.length === 0) {
        sortBy.value = [{ key: 'id', order: 'asc' }];
        getDurations();
        return;
    }

    if (options.sortBy[0].key !== sortBy.value[0].key || options.sortBy[0].order !== sortBy.value[0].order) {
        sortBy.value[0].key = options.sortBy[0].key;
        sortBy.value[0].order = options.sortBy[0].order;
        getDurations();
    } else if (options.page !== page.value || options.itemsPerPage !== itemsPerPage.value) {
        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;
        getDurations();
    }
}

onMounted(() => {
    getDurations();
})

</script>

<style scoped></style>