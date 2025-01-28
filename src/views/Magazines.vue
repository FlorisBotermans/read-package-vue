<template>
    <v-app>
        <v-card>
            <v-card-title>
                <div>
                    <v-btn color="primary" @click="showCreateMagazineDialog">
                        Nieuw tijdschrift
                    </v-btn>
                </div>
                <div>
                    <v-select v-model="selectedSource" :items="sourceOptions" label="Filter op bron" clearable dense
                        outlined></v-select>
                </div>
            </v-card-title>
            <v-data-table :headers="headers" :items="filteredTableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loadingMagazine"
                @update:options="updateOptions">
                <template v-slot:item.image_url="{ item }">
                    <v-img max-width="75" :src="item.image_url"></v-img>
                </template>
                <template v-slot:item.external_source="{ item }">
                    <span>{{ item.external_source || "Read Package CMS" }}</span>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditMagazineDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeMagazinePrompt(item)">mdi-delete</v-icon>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="magazineDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Tijdschrift Bewerken' : 'Nieuw tijdschrift toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateMagazine() : createMagazine()">
                        <v-text-field v-model="magazine.name" label="Naam" required></v-text-field>
                        <DOSpacesUploadComponent @uploaded="handleFileUploaded" :isUploading="isUploading"
                            @upload-start="handleUploadStart" @upload-finish="handleUploadFinish"
                            @file-removed="handleFileRemoved" @upload-error="handleUploadError"
                            v-bind="isEditMode ? { file: magazine.image_url } : {}" accepted="image/jpeg,image/png"
                            msg="Upload hier de afbeelding (alleen jpeg en png) die hoort bij dit tijdschrift (max 5 mb).)"
                            extension="jpeg">
                        </DOSpacesUploadComponent>

                        <v-progress-linear v-if="isUploading" indeterminate color="blue"
                            class="mt-4"></v-progress-linear>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="magazineDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateMagazine() : createMagazine()"
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarMessage }}
            <template v-slot:action>
                <v-btn color="white" @click="hideSnackbar">Close</v-btn>
                <v-btn color="red" @click="confirmRemoveMagazine">Ja</v-btn>
                <v-btn color="grey" @click="hideSnackbar">Nee</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>
<script setup>
import DOSpacesUploadComponent from '@/components/DOSpacesUploadComponent.vue';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const magazineDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingMagazine = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const isUploading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const magazineToDelete = ref(null);
const selectedSource = ref(null);
const sourceOptions = ["Wait", "Read Package CMS"];

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Image url", value: "image_url", sortable: false },
    { title: "Externe bron", value: "external_source", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const magazine = ref({
    name: '',
    image_url: '',
    external_source: '',
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
    return magazine.value.name && magazine.value.image_url;
});

const filteredTableRows = computed(() => {
    if (!selectedSource.value) return tableRows.value;
    return tableRows.value.filter((item) =>
        selectedSource.value === "Read Package CMS"
            ? !item.external_source
            : item.external_source === selectedSource.value
    );
});

const getMagazines = async () => {
    loadingMagazine.value = true;

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/magazines', { params })
        .then(response => {
            tableRows.value = response.data.data;
            console.log(tableRows.value);
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            // toast.error("Niet gelukt om welkomscadeaus op te halen.", { duration: 2500 });
        })
        .finally(() => {
            loadingMagazine.value = false;
        });
}

const createMagazine = () => {
    if (valid.value) {
        loadingMagazine.value = true;
        axios.post('/api/magazines', magazine.value)
            .then(response => {
                showSnackbar("Tijdschrift succesvol aangemakaakt!", "success");
                getMagazines();
                magazineDialog.value = false;
                resetMagazine();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om tijdschrift aan te maken.", "error");
            })
            .finally(() => {
                loadingMagazine.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateMagazine = async () => {
    if (valid.value) {
        loadingMagazine.value = true;

        axios.put(`/api/magazines/${magazine.value.id}`, magazine.value)
            .then(response => {
                showSnackbar("Tijdschrift succesvol aangepast!", "success");
                getMagazines();
                magazineDialog.value = false;
                resetMagazine();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om tijdschrift te bewerken.", "error");
            })
            .finally(() => {
                loadingMagazine.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeMagazine = async () => {
    if (magazineToDelete.value) {
        loadingMagazine.value = true;
        const indexOf = tableRows.value.indexOf(magazineToDelete.value);

        axios.delete(`/api/magazines/${magazineToDelete.value.id}`)
            .then(response => {
                if (indexOf > -1) {
                    tableRows.value.splice(indexOf, 1);
                    totalItems.value -= 1;
                }
                getMagazines();
                showSnackbar("Tijdschrift succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om tijdschrift te verwijderen.", "error");
            })
            .finally(() => {
                loadingMagazine.value = false;
                magazineToDelete.value = null;
                hideSnackbar();
            });
    }
};

const removeMagazinePrompt = (magazine) => {
    showSnackbar("Weet u zeker dat u het tijdschrift wilt verwijderen?", {
        action: [
            {
                text: "Ja",
                onClick: (e, toast) => {
                    toast.goAway(0);
                    removeMagazine(magazine);
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

const showCreateMagazineDialog = () => {
    isEditMode.value = false;
    resetMagazine();
    magazineDialog.value = true;
};

const showEditMagazineDialog = (newMagazine) => {
    isEditMode.value = true;
    magazine.value = { ...newMagazine };
    magazineDialog.value = true;
};

const handleUploadStart = () => {
    isUploading.value = true;
};

const handleUploadFinish = () => {
    isUploading.value = false;
};

const handleUploadError = () => {
    isUploading.value = false;
};

const handleFileUploaded = (file) => {
    magazine.value.image_url = file.name;
};

const handleFileRemoved = () => {
    magazine.value.image_url = '';
};

const resetMagazine = () => {
    magazine.value = {
        name: '',
        image_url: '',
        external_source: '',
    };
};

const updateOptions = (options) => {
    if (!options.sortBy || options.sortBy.length === 0) {
        sortBy.value = [{ key: 'id', order: 'asc' }];
        getMagazines();
        return;
    }

    if (options.sortBy[0].key !== sortBy.value[0].key || options.sortBy[0].order !== sortBy.value[0].order) {
        sortBy.value[0].key = options.sortBy[0].key;
        sortBy.value[0].order = options.sortBy[0].order;
        getMagazines();
    } else if (options.page !== page.value || options.itemsPerPage !== itemsPerPage.value) {
        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;
        getMagazines();
    }
};

onMounted(() => {
    getMagazines();
});

</script>