<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreatePackageDialog">Nieuw pakket</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditPackageDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemovePackageDialog(item)">mdi-delete</v-icon>
                    <v-btn color="primary" @click="showAddOptionsDialog(item)">Opties toevoegen</v-btn>
                    <v-btn color="primary" @click="showAddMagazineGroupDialog(item)">Tijdschrift groep
                        toevoegen</v-btn>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="packageDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Pakket Bewerken' : 'Nieuwe pakket toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid" @submit.prevent="isEditMode ? updatePackage() : createPackage()">
                        <v-text-field v-model="pkg.name" label="Naam" required></v-text-field>
                        <v-text-field v-model="pkg.order" label="Volgorde" type="number" required min="0"
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
                    <v-btn color="blue darken-1" text @click="pakketDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updatePackage() : createPackage()"
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="optionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Opties toevoegen aan pakket</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingOptions" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingOptions" v-model="selectedOptions" :items="availableOptions"
                        item-value="id" item-title="delivery_name" label="Voeg opties toe" multiple chips clearable
                        :disabled="loadingOptions" @update:model-value="onOptionSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingOptions" color="primary" @click="addSelectedOptionsToTable"
                        :disabled="selectedOptions.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingOptions" :headers="addedOptionsTableHeaders" :items="addedOptions"
                        item-value="id" class="mt-3">
                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeOptionFromPackage(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="optionDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addOptionsToPackage"
                        :disabled="isAddingOptions || loadingOptions">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deletePackageDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de pakket wilt verwijderen?</span>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancelDelete">Annuleer</v-btn>
                    <v-btn color="red darken-1" text @click="confirmDelete">Doorgaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="magazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Tijdschrift groep toevoegen aan pakket</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingMagazineGroups" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>
                    <v-form v-model="validMagazineGroups"
                        @submit.prevent="addMagazineGroupToPackage"
                        v-if="!loadingMagazineGroups || isAddingMagazineGroups">

                        <v-data-table-server :headers="magazineGroupHeaders"
                            :items="availableMagazineGroups" :items-per-page="itemsPerPage"
                            :items-length="totalItems" select-strategy="single" show-select
                            v-model="selectedMagazineGroup" @update:options="updateOptions">
                        </v-data-table-server>

                    </v-form>

                    <v-alert v-if="loadingMagazineGroups && !isAddingMagazineGroups" class="mt-3">
                        Laden van beschikbare tijdschrift groepen...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="magazineGroupDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addMagazineGroupToPackage"
                        :disabled="!isMagazineGroupsFormValid || isAddingMagazineGroups || loadingMagazineGroups">Opslaan</v-btn>
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
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const packageDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const loadingDialog = ref(false);
const loadingOptions = ref(false);
const loadingMagazineGroups = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const validOptions = ref(false);
const deletePackageDialog = ref(null);
const validMagazineGroups = ref(false);
const isUploading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const packageToDelete = ref(null);
const addedOptions = ref([]);

const availableOptions = ref([]);
const selectedOptions = ref([]);
const optionDialog = ref(false);
const currentPackage = ref(null);
const selectedOptionsInitial = ref([]);
const isAddingOptions = ref(false);

const availableMagazineGroups = ref([]);
const selectedMagazineGroup = ref([]);
const magazineGroupDialog = ref(false);
const selectedMagazineGroupInitial = ref([]);
const isAddingMagazineGroups = ref(false);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Volgorde", value: "order", sortable: true },
    { title: "Image url", value: "image_url", sortable: false },
    { title: "Acties", value: "actions", sortable: false },
]);

const addedOptionsTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Aantal tijdschriften", value: "magazine_amount" },
    { title: "Levering type", value: "delivery_type" },
    { title: "Levering naam", value: "delivery_name" },
    { title: "Week prijs", value: "week_price" },
    { title: "Acties", value: "actions", sortable: false },
])

const pkg = ref({
    name: '',
    order: '',
    image_url: '',
});

const magazineGroupHeaders = ref([
    { title: 'Groep naam', value: 'name' },
]);

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

const isFormValid = computed(() => {
    return pkg.value.name && pkg.value.order && pkg.value.image_url;
});

const isOptionsFormValid = computed(() => {
    const selectedOptionsSet = new Set(selectedOptions.value);
    const initialOptionsSet = new Set(selectedOptionsInitial.value);

    return selectedOptionsSet.size !== initialOptionsSet.size ||
        [...selectedOptionsSet].some(option => !initialOptionsSet.has(option)) ||
        [...initialOptionsSet].some(option => !selectedOptionsSet.has(option));
});

const isMagazineGroupsFormValid = computed(() => {
    const selectedMagazineGroupsSet = new Set(selectedMagazineGroup.value);
    const initialMagazineGroupsSet = new Set(selectedMagazineGroupInitial.value);

    return selectedMagazineGroupsSet.size !== initialMagazineGroupsSet.size ||
        [...selectedMagazineGroupsSet].some(magazineGroup => !initialMagazineGroupsSet.has(magazineGroup)) ||
        [...initialMagazineGroupsSet].some(magazineGroup => !selectedMagazineGroupsSet.has(magazineGroup));
});

const getPackages = async () => {
    loadingDataTable.value = true;

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/packages', { params })
        .then(response => {
            tableRows.value = response.data.data;
            console.log(tableRows.value);
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            showSnackbar("Niet gelukt om pakketten op te halen.", "error");
        })
        .finally(() => {
            loadingDataTable.value = false;
        });
}

const createPackage = () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.post('/api/packages', pkg.value)
            .then(response => {
                showSnackbar("Pakket succesvol aangemakaakt!", "success");
                getPackages();
                packageDialog.value = false;
                resetPackage();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om pakket aan te maken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updatePackage = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.put(`/api/packages/${pkg.value.id}`, pkg.value)
            .then(response => {
                showSnackbar("Pakket succesvol aangepast!", "success");
                getPackages();
                packageDialog.value = false;
                resetPackage();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om pakket te bewerken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removePackage = async (pkg) => {
    if (pkg) {
        loadingDialog.value = true;

        axios.delete(`/api/packages/${pkg.id}`)
            .then(response => {
                getPackages();
                showSnackbar("Pakket succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om pakket te verwijderen.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    }
};

const addSelectedOptionsToTable = () => {
    addedOptions.value = addedOptions.value.concat(selectedOptions.value);

    availableOptions.value = availableOptions.value.filter(
        (option) => !selectedOptions.value.includes(option)
    );

    selectedOptions.value = [];
};

const addOptionsToPackage = async () => {
    loadingOptions.value = true;

    try {
        const optionIds = addedOptions.value.map(option => option.id);

        await axios.put(`/api/packages/${currentPackage.value.id}`, {
            option_ids: optionIds,
        });

        showSnackbar("Opties succesvol bijgewerkt!", "success");
        optionDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bewerken van opties", "error");
    } finally {
        isAddingOptions.value = false;
        loadingOptions.value = false;
    }
};

const onOptionSelectionChange = () => {
    availableOptions.value = availableOptions.value.filter(
        option => !selectedOptions.value.includes(option.id)
    );

    const newSelectedOptions = selectedOptions.value.filter(
        selectedOption => !addedOptions.value.some(added => added.id === selectedOption.id)
    )

    console.log(newSelectedOptions);
};

const removeOptionFromPackage = (option) => {
    addedOptions.value = addedOptions.value.filter(addedOption => addedOption.id !== option.id);

    availableOptions.value.push(option);
};

const addMagazineGroupToPackage = async () => {
    const groupId = selectedMagazineGroup.value?.[0] || null;

    isAddingMagazineGroups.value = true;
    loadingMagazineGroups.value = true;

    try {
        const response = await axios.put(`/api/packages/${currentPackage.value.id}`, { magazine_group_id: groupId });

        showSnackbar("Tijdschrift groep succesvol bijgewerkt!", "success");
        magazineGroupDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van tijdschrift groep.", "error");
    } finally {
        loadingMagazineGroups.value = false;
        isAddingMagazineGroups.value = false;
    }
}

const getOptionsForPackage = async (packageId) => {
    try {
        loadingOptions.value = true;

        const optionsResponse = await axios.get('/api/options');
        availableOptions.value = optionsResponse.data.data;

        const packageOptionsResponse = await axios.get(`/api/packages/${packageId}/options`);
        addedOptions.value = packageOptionsResponse.data;

        availableOptions.value = availableOptions.value.filter(
            option => !addedOptions.value.some(added => added.id === option.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van opties.", "error");
    } finally {
        loadingOptions.value = false;
    }
};

const getMagazineGroupForPackage = async (packageId) => {
    try {
        loadingMagazineGroups.value = true;
        const magazineGroupsResponse = await axios.get('/api/magazine-groups');
        availableMagazineGroups.value = magazineGroupsResponse.data.data;

        const packageByIdResponse = await axios.get(`/api/packages/${packageId}`);
        
        const magazineGroupId = packageByIdResponse.data.data.magazine_group_id;

        if (magazineGroupId) {
            selectedMagazineGroup.value = [magazineGroupId]
        } else {
            selectedMagazineGroup.value = [];
        }

        selectedMagazineGroupInitial.value = selectedMagazineGroup.value;        
    } catch (error) {
        showSnackbar("Fout bij het ophalen van tijdschrift groepen.", "error");
    } finally {
        loadingMagazineGroups.value = false;
    }
};

const showAddOptionsDialog = (pkg) => {
    currentPackage.value = pkg;
    selectedOptions.value = [];
    optionDialog.value = true;
    getOptionsForPackage(pkg.id);
}

const showAddMagazineGroupDialog = (pkg) => {
    currentPackage.value = pkg;
    selectedMagazineGroup.value = null;
    magazineGroupDialog.value = true;
    getMagazineGroupForPackage(pkg.id);
}

const showRemovePackageDialog = (pkg) => {
    packageToDelete.value = pkg;
    deletePackageDialog.value = true;
}

const cancelDelete = () => {
    deletePackageDialog.value = false;
    packageToDelete.value = null;
}

const confirmDelete = () => {
    removePackage(packageToDelete.value);
    deletePackageDialog.value = false;
}

const showCreatePackageDialog = () => {
    isEditMode.value = false;
    resetPackage();
    packageDialog.value = true;
};

const showEditPackageDialog = (newPackage) => {
    isEditMode.value = true;
    pkg.value = { ...newPackage };
    pkg.value = true;
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
    pkg.value.image_url = file.name;
};

const handleFileRemoved = () => {
    pkg.value.image_url = '';
};

const resetPackage = () => {
    pkg.value = {
        name: '',
        order: '',
        image_url: '',
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

        getPackages();
    }
};

onMounted(() => {
    getPackages();
});

</script>