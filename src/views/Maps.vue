<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateMapDialog">Nieuwe map</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loadingMap"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditMapDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeMapPrompt(item)">mdi-delete</v-icon>
                    <v-btn color="primary" @click="showAddOptionsDialog(item)">Opties toevoegen</v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="mapDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Map Bewerken' : 'Nieuwe map toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid" @submit.prevent="isEditMode ? updateMap() : createMap()">
                        <v-text-field v-model="map.name" label="Naam" required></v-text-field>
                        <v-text-field v-model="map.order" label="Aantal" type="number" required min="0"
                            step="1"></v-text-field>
                        <DOSpacesUploadComponent @uploaded="handleFileUploaded" :isUploading="isUploading"
                            @upload-start="handleUploadStart" @upload-finish="handleUploadFinish"
                            @file-removed="handleFileRemoved" @upload-error="handleUploadError"
                            v-bind="isEditMode ? { file: gift.image_url } : {}" accepted="image/jpeg,image/png"
                            msg="Upload hier de afbeelding (alleen jpeg en png) die hoort bij dit welkomscadeau (max 5 mb).)"
                            extension="jpeg">
                        </DOSpacesUploadComponent>

                        <v-progress-linear v-if="isUploading" indeterminate color="blue"
                            class="mt-4"></v-progress-linear>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="mapDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateMap() : createMap()"
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="optionsDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Opties toevoegen aan map</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingOptions" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>
                    <v-form v-model="validOptions" @submit.prevent="addOptionsToMap"
                        v-if="!loadingOptions || isAddingOptions">
                        <div v-for="option in availableOptions" :key="option.id">
                            <v-checkbox v-model="selectedOptions" :value="option.id"
                                :label="getOptionLabel(option)"></v-checkbox>
                        </div>
                    </v-form>

                    <v-alert v-if="loadingOptions && !isAddingOptions" class="mt-3">
                        Laden van beschikbare opties...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="optionsDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addOptionsToMap"
                        :disabled="!isOptionsFormValid || isAddingOptions || loadingOptions">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarMessage }}
            <template v-slot:action>
                <v-btn color="white" @click="hideSnackbar">Close</v-btn>
                <v-btn color="red" @click="confirmRemoveMap">Ja</v-btn>
                <v-btn color="grey" @click="hideSnackbar">Nee</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>
<script setup>
import DOSpacesUploadComponent from '@/components/DOSpacesUploadComponent.vue';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const mapDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingMap = ref(false);
const loadingOptions = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const validOptions = ref(false);
const isUploading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const mapToDelete = ref(null);

const availableOptions = ref([]);
const selectedOptions = ref([]);
const optionsDialog = ref(false);
const currentMap = ref(null);
const selectedOptionsInitial = ref([]);
const isAddingOptions = ref(false);

const headers = ref([
    { text: "Id", value: "id", sortable: true },
    { text: "Naam", value: "name", sortable: true },
    { text: "Volgorde", value: "order", sortable: true },
    { text: "Image url", value: "image_url", sortable: false },
    { text: "Acties", value: "actions", sortable: false },
]);

const map = ref({
    name: '',
    order: '',
    image_url: '',
});

const getOptionLabel = (option) => {
    return `${option.delivery_name} (${option.magazine_amount} magazines, ${option.delivery_type}, €${option.week_price} per week)`;
};

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
    return map.value.name && map.value.order && map.value.image_url;
});

const isOptionsFormValid = computed(() => {
    const selectedOptionsSet = new Set(selectedOptions.value);
    const initialOptionsSet = new Set(selectedOptionsInitial.value);

    return selectedOptionsSet.size !== initialOptionsSet.size ||
        [...selectedOptionsSet].some(option => !initialOptionsSet.has(option)) ||
        [...initialOptionsSet].some(option => !selectedOptionsSet.has(option));
});

const getMaps = async () => {
    loadingMap.value = true;

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/maps', { params })
        .then(response => {
            tableRows.value = response.data.data;
            console.log(tableRows.value);
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            // toast.error("Niet gelukt om welkomscadeaus op te halen.", { duration: 2500 });
        })
        .finally(() => {
            loadingMap.value = false;
        });
}

const createMap = () => {
    if (valid.value) {
        loadingMap.value = true;
        axios.post('/api/maps', map.value)
            .then(response => {
                showSnackbar("Map succesvol aangemakaakt!", "success");
                getMaps();
                mapDialog.value = false;
                resetMap();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om map aan te maken.", "error");
            })
            .finally(() => {
                loadingMap.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateMap = async () => {
    if (valid.value) {
        loadingMap.value = true;

        axios.put(`/api/maps/${map.value.id}`, map.value)
            .then(response => {
                showSnackbar("Map succesvol aangepast!", "success");
                getMaps();
                mapDialog.value = false;
                resetMap();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om map te bewerken.", "error");
            })
            .finally(() => {
                loadingMap.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeMap = async () => {
    if (mapToDelete.value) {
        loadingMap.value = true;
        const indexOf = tableRows.value.indexOf(mapToDelete.value);

        axios.delete(`/api/maps/${mapToDelete.value.id}`)
            .then(response => {
                if (indexOf > -1) {
                    tableRows.value.splice(indexOf, 1);
                    totalItems.value -= 1;
                }
                getMaps();
                showSnackbar("Welkomscadeau succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om welkomscadeau te verwijderen.", "error");
            })
            .finally(() => {
                loadingMap.value = false;
                mapToDelete.value = null;
                hideSnackbar();
            });
    }
};

const removeMapPrompt = (map) => {
    showSnackbar("Weet u zeker dat u de map wilt verwijderen?", {
        action: [
            {
                text: "Ja",
                onClick: (e, toast) => {
                    toast.goAway(0);
                    removeMap(map);
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

const addOptionsToMap = async () => {
    if (selectedOptions.value.length > 0) {
        isAddingOptions.value = true;
        loadingOptions.value = true;
        try {
            const currentOptionsResponse = await axios.get(`/api/maps/${currentMap.value.id}/options`);
            const currentOptionIds = currentOptionsResponse.data.map(option => option.id);

            const optionsToAdd = selectedOptions.value.filter(id => !currentOptionIds.includes(id));
            const optionsToRemove = currentOptionIds.filter(id => !selectedOptions.value.includes(id));

            if (optionsToAdd.length > 0) {
                await axios.post(`/api/maps/${currentMap.value.id}/add-options`, { options: optionsToAdd });
            }
            if (optionsToRemove.length > 0) {
                await axios.post(`/api/maps/${currentMap.value.id}/remove-options`, { options: optionsToRemove });
            }

            showSnackbar("Opties succesvol bijgewerkt!", "success");
            optionsDialog.value = false;
            getMaps();
        } catch (error) {
            showSnackbar("Fout bij het bijwerken van opties.", "error");
        } finally {
            loadingOptions.value = false;
            isAddingOptions.value = false;
        }
    } else {
        showSnackbar("Kies minstens één optie.", "error");
    }
};

const getOptionsForMap = async (mapId) => {
    try {
        loadingOptions.value = true;
        const optionsResponse = await axios.get('/api/options');
        availableOptions.value = optionsResponse.data.data;

        const mapOptionsResponse = await axios.get(`/api/maps/${mapId}/options`);
        selectedOptions.value = mapOptionsResponse.data.map(option => option.id);

        selectedOptionsInitial.value = [...selectedOptions.value];
    } catch (error) {
        showSnackbar("Fout bij het ophalen van opties.", "error");
    } finally {
        loadingOptions.value = false;
    }
}

const showAddOptionsDialog = (map) => {
    currentMap.value = map;
    selectedOptions.value = [];
    optionsDialog.value = true;
    getOptionsForMap(map.id);
}

const showCreateMapDialog = () => {
    isEditMode.value = false;
    resetMap();
    mapDialog.value = true;
};

const showEditMapDialog = (newMap) => {
    isEditMode.value = true;
    map.value = { ...newMap };
    map.value = true;
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
    map.value.image_url = file.name;
};

const handleFileRemoved = () => {
    map.value.image_url = '';
};

const resetMap = () => {
    map.value = {
        name: '',
        order: '',
        image_url: '',
    };
};

const optionsChanged = computed(() => selectedOptions.value.length > 0);

const updateOptions = (options) => {
    if (!options.sortBy || options.sortBy.length === 0) {
        sortBy.value = [{ key: 'id', order: 'asc' }];
        getMaps();
        return;
    }

    if (options.sortBy[0].key !== sortBy.value[0].key || options.sortBy[0].order !== sortBy.value[0].order) {
        sortBy.value[0].key = options.sortBy[0].key;
        sortBy.value[0].order = options.sortBy[0].order;
        getMaps();
    } else if (options.page !== page.value || options.itemsPerPage !== itemsPerPage.value) {
        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;
        getMaps();
    }
};

onMounted(() => {
    getMaps();
});

</script>