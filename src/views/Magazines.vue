<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-select v-model="selectedSource" :items="sourceOptions" label="Filter op bron" clearable dense
                    outlined></v-select>
                <v-btn color="primary" @click="showCreateMagazineDialog">
                    Nieuw tijdschrift
                </v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.image_url="{ item }">
                    <v-img max-width="50" :src="item.image_url"></v-img>
                </template>
                <template v-slot:item.external_source="{ item }">
                    <span>{{ item.external_source || "Read Package CMS" }}</span>
                </template>
                <template v-slot:item.actions="{ item }">
                    <template v-if="!item.external_source">
                        <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditMagazineDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveMagazineDialog(item)">
                                Verwijder
                            </v-btn>
                        </v-col>
                    </v-row>
                    </template>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="magazineDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Tijdschrift Bewerken' : 'Nieuw tijdschrift toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateMagazine() : createMagazine()">
                        <v-text-field v-model="magazine.name" label="Naam" required></v-text-field>
                        <DOSpacesUploadComponent @uploaded="handleFileUploaded" @upload-start="handleUploadStart"
                            @upload-finish="handleUploadFinish" @delete-start="handleStartDeleteFile"
                            @file-deleted="handleFileDeleted" @upload-error="handleUploadError"
                            @delete-error="handleRemoveFileError"
                            v-bind="isEditMode ? { file: magazine.image_url } : {}" accepted="image/jpeg,image/png"
                            msg="Upload hier de afbeelding (alleen jpeg en png) die hoort bij dit tijdschrift (max 5 mb).)"
                            extension="jpeg" folder="magazines" :maxSize="5">
                        </DOSpacesUploadComponent>

                        <v-progress-linear v-if="isUploading || isRemovingFile" indeterminate color="blue"
                            class="mb-3"></v-progress-linear>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="magazineDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateMagazine() : createMagazine()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteMagazineDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u het tijdschrift wilt verwijderen?</span>
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
import DOSpacesUploadComponent from '@/components/DOSpacesUploadComponent.vue';
import { ref, watch, computed, onMounted } from 'vue';
import { useMagazineStore } from '../stores/magazine.module';

const magazineStore = useMagazineStore();
const magazineDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const loadingDialog = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const isUploading = ref(false);
const isRemovingFile = ref(false);
const uploadError = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const magazineToDelete = ref(null);
const deleteMagazineDialog = ref(null);
const selectedSource = ref(null);
const sourceOptions = ["Wait", "Read Package CMS"];
const search = ref('');
const timeout = ref(null);

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

const isFormValid = computed(() => {
    return magazine.value.name && magazine.value.image_url;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getMagazines();
    }, 500);
};

// const filteredTableRows = computed(() => {
//     if (!selectedSource.value) return tableRows.value;
//     return tableRows.value.filter((item) =>
//         selectedSource.value === "Read Package CMS"
//             ? !item.external_source
//             : item.external_source === selectedSource.value
//     );
// });

const getMagazines = async () => {
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

    if (selectedSource.value) {
        params.external_source = selectedSource.value;
    }

    try {
        magazineStore.magazineData = await magazineStore.getMagazines(params);
        tableRows.value = magazineStore.magazineData.data;
        totalItems.value = magazineStore.magazineData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om tijdschriften op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createMagazine = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await magazineStore.createMagazine(magazine.value);
            showSnackbar("Tijdschrift succesvol aangemakaakt!", "success");
            getMagazines();
            resetMagazine();
        } catch (error) {
            showSnackbar("Niet gelukt om tijdschrift aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            magazineDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateMagazine = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await magazineStore.updateMagazine(magazine.value.id, magazine.value);
            showSnackbar("Tijdschrift succesvol aangepast!", "success");
            getMagazines();
            resetMagazine();
        } catch (error) {
            showSnackbar("Niet gelukt om tijdschrift te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            magazineDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeMagazine = async (magazine) => {
    if (magazine) {
        loadingDialog.value = true;

        try {
            await magazineStore.deleteMagazine(magazine.id);
            showSnackbar("Weet u zeker dat u het tijdschrift wilt verwijderen?", "success");
            getMagazines();
        } catch (error) {
            showSnackbar("Niet gelukt om tijdschrift te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteMagazineDialog.value = false;
        }
    }
};

const showCreateMagazineDialog = () => {
    isEditMode.value = false;
    resetMagazine();
    magazineDialog.value = true;
};

const cancelDelete = () => {
    deleteMagazineDialog.value = false;
    magazineToDelete.value = null;
};

const confirmDelete = () => {
    removeMagazine(magazineToDelete.value);
};

const showRemoveMagazineDialog = (magazine) => {
    magazineToDelete.value = magazine;
    deleteMagazineDialog.value = true;
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
    uploadError.value = 'Er is een fout opgetreden bij het uploaden van de afbeelding.';
};

const handleFileUploaded = (file) => {
    magazine.value.image_url = file.url;
};

const handleStartDeleteFile = () => {
    isRemovingFile.value = true;
};

const handleRemoveFileError = () => {
    isRemovingFile.value = false;
    uploadError.value = 'Er is een fout opgetreden bij het verwijderen van de afbeelding.';
}

const handleFileDeleted = () => {
    isRemovingFile.value = false;
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

        getMagazines();
    }
};

watch(selectedSource, () => {
    getMagazines();
});

onMounted(() => {
    getMagazines();
});

</script>