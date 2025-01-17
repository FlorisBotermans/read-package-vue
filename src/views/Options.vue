<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateOptionDialog">Nieuwe optie</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loading"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditOptionDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeOptionPrompt(item)">mdi-delete</v-icon>
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
const loading = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const optionToDelete = ref(null);

const headers = ref([
    { text: "Id", value: "id", sortable: true },
    { text: "Tijdschrift aantal", value: "magazine_amount", sortable: true },
    { text: "Levering type", value: "delivery_type", sortable: true },
    { text: "Levering naam", value: "delivery_name", sortable: true },
    { text: "Week prijs", value: "week_price", sortable: true },
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

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const isFormValid = computed(() => {
    return option.value.magazine_amount && option.value.delivery_type && option.value.delivery_name && option.value.week_price;
});

const getOptions = async () => {
    loading.value = true;

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/options', { params })
        .then(response => {
            tableRows.value = response.data.data;
            console.log(tableRows.value);
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            // toast.error("Niet gelukt om welkomscadeaus op te halen.", { duration: 2500 });
        })
        .finally(() => {
            loading.value = false;
        });
}

const createOption = () => {
    if (valid.value) {
        loading.value = true;
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
                loading.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateOption = async () => {
    if (valid.value) {
        loading.value = true;

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
                loading.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeOption = async () => {
    if (optionToDelete.value) {
        loading.value = true;
        const indexOf = tableRows.value.indexOf(optionToDelete.value);

        axios.delete(`/api/options/${optionToDelete.value.id}`)
            .then(response => {
                if (indexOf > -1) {
                    tableRows.value.splice(indexOf, 1);
                    totalItems.value -= 1;
                }
                getOptions();
                showSnackbar("Optie succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om optie te verwijderen.", "error");
            })
            .finally(() => {
                loading.value = false;
                optionToDelete.value = null;
                hideSnackbar();
            });
    }
};

const removeOptionPrompt = (option) => {
    showSnackbar("Weet u zeker dat u de optie wilt verwijderen?", {
        action: [
            {
                text: "Ja",
                onClick: (e, toast) => {
                    toast.goAway(0);
                    removeOption(option);
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
    if (!options.sortBy || options.sortBy.length === 0) {
        sortBy.value = [{ key: 'id', order: 'asc' }];
        getOptions();
        return;
    }

    if (options.sortBy[0].key !== sortBy.value[0].key || options.sortBy[0].order !== sortBy.value[0].order) {
        sortBy.value[0].key = options.sortBy[0].key;
        sortBy.value[0].order = options.sortBy[0].order;
        getOptions();
    } else if (options.page !== page.value || options.itemsPerPage !== itemsPerPage.value) {
        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;
        getOptions();
    }
};

onMounted(() => {
    getOptions();
});

</script>