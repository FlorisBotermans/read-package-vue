<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateEditionDialog">Nieuwe editie</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loading"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditEditionDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeEditionPrompt(item)">mdi-delete</v-icon>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="editionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Editie Bewerken' : 'Nieuwe editie toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid">
                        <v-text-field v-model="edition.name" label="Naam" required></v-text-field>
                        <v-select v-model="edition.enabled" :items="['Ja', 'Nee']" label="Ingeschakeld"
                            required></v-select>
                        <v-text-field v-model="edition.price" label="Prijs" required type="number"></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="editionDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateEdition() : createEdition()">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-app>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const tableRows = ref([]);
const editionDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(10);
const page = ref(1);
const loading = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);

const edition = ref({
    name: '',
    enabled: 'Ja',
    price: '',
});

const headers = ref([
    { text: "Id", value: "id", sortable: true },
    { text: "Naam", value: "name", sortable: true },
    { text: "Ingeschakeld", value: "enabled", sortable: true },
    { text: "Prijs", value: "price", sortable: true }
]);

// Computed property
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const getEditions = async () => {
    loading.value = true;
    const url = '/api/editions';

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    }

    axios.get(url, { params })
        .then(response => {
            console.log(response.data.data)
            tableRows.value = response.data.data;
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            toast.error("Niet gelukt om edities op te halen.", { duration: 2500 });
        })
        .finally(() => {
            loading.value = false;
        })
}

const createEdition = async () => {
    if (valid.value) {
        loading.value = true;

        const payload = {
            ...edition.value,
            enabled: edition.value.enabled === 'Ja'
        };

        axios.post('/api/editions', payload)
            .then(response => {
                toast.success("Editie succesvol aangemaakt!", { duration: 2500 });
                getEditions();
                resetEdition();
                editionDialog.value = false;
            })
            .catch(error => {
                toast.error("Niet gelukt om editie aan te maken.", { duration: 2500 });
            })
            .finally(() => {
                loading.value = false;
            })
    } else {
        toast.error("Onjuiste invoer.", { duration: 2500 });
    }
};

const updateEdition = async (edition) => {
    if (valid.value) {
        loading.value = true;
        axios.put(`/api/editions/${edition.value.id}`, edition.value)
            .then(response => {
                toast.success("Editie succesvol bijgewerkt", { duration: 2500 });
                getEditions();
                editionDialog.value = false;
            })
            .catch(error => {
                toast.error("Niet gelukt om editie bij te werken.", { duration: 2500 });
            })
            .finally(() => {
                loading.value = false;
            });
    } else {
        toast.error("Onjuiste invoer.", { duration: 2500 });
    }
}

const removeEdition = async (edition) => {
    loading.value = true;
    const indexOf = tableRows.value.indexOf(edition);
    axios.delete(`/api/editions/${edition.id}`)
        .then(response => {
            if (indexOf > -1) {
                tableRows.value.splice(indexOf, 1);
                totalItems.value -= 1;
            }
            toast.success("Editie is verwijderd.", { duration: 2500 });
            getEditions();
        })
        .catch(error => {
            toast.error("Niet gelukt om editie te verwijderen.", { duration: 2500 });
        })
        .finally(() => {
            loading.value = false;
        })
}

const removeEditionPrompt = (edition) => {
    toast.show("Weet u zeker dat u de editie wilt verwijderen?", {
        action: [
            {
                text: "Ja",
                onClick: (e, toast) => {
                    toast.goAway(0);
                    removeEdition(edition);
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

const showCreateEditionDialog = () => {
    isEditMode.value = false;
    resetEdition();
    editionDialog.value = true;
};

const showEditEditionDialog = () => {
    isEditMode.value = true;
    edition.value = { ...edition };
    editionDialog.value = true;
};

const resetEdition = () => {
    edition.value = {
        name: '',
        enabled: 'Ja',
        price: ''
    };
}

const updateOptions = (options) => {
    // Check if sortDesc is undefined or null and set a default value (false)
    // const finalSortDesc = options.sortDesc !== undefined ? options.sortDesc : false;

    // console.log('test123');
    // console.log(options.sortBy.key);
    // console.log('dsafas');
    // console.log(sortBy.value.key);

    // console.log(options)
    // console.log(sortBy.value[0].)
    // console.log(options.sortBy.order)
    // console.log(sortBy.value.order)

    if (!options.sortBy || options.sortBy.length === 0) {
        sortBy.value = [{ key: 'id', order: 'asc' }];
        getEditions();
        return;
    }

    if (options.sortBy[0].key !== sortBy.value[0].key || options.sortBy[0].order !== sortBy.value[0].order) {
        sortBy.value[0].key = options.sortBy[0].key;
        sortBy.value[0].order = options.sortBy[0].order;
        getEditions();
    } else if (options.page !== page.value || options.itemsPerPage !== itemsPerPage.value) {
        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;
        getEditions();
    }
}

onMounted(() => {
    getEditions();
})

</script>

<style scoped></style>