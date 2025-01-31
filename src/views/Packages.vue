<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreatePackageDialog">Nieuw pakket</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.image_url="{ item }">
                    <v-img max-width="50" :src="item.image_url"></v-img>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditPackageDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemovePackageDialog(item)">
                                Verwijder
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn color="primary" text v-bind="props" class="text-nowrap">
                                        Meer acties
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item @click="showAddOptionsDialog(item)">
                                        <v-list-item-title>Opties toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddMagazineGroupDialog(item)">
                                        <v-list-item-title>Tijdschriften groep toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddEditionChoicesDialog(item)">
                                        <v-list-item-title>Editie keuzes toevoegen</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                    </v-row>
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
                        <DOSpacesUploadComponent @uploaded="handleFileUploaded" @upload-start="handleUploadStart"
                            @upload-finish="handleUploadFinish" @delete-start="handleStartDeleteFile"
                            @file-deleted="handleFileDeleted" @upload-error="handleUploadError"
                            @delete-error="handleRemoveFileError" v-bind="isEditMode ? { file: pkg.image_url } : {}"
                            accepted="image/jpeg,image/png"
                            msg="Upload hier de afbeelding (alleen jpeg en png) die hoort bij dit pakket (max 5 mb).)"
                            extension="jpeg" folder="packages" :maxSize="5">
                        </DOSpacesUploadComponent>

                        <v-progress-linear v-if="isUploading || isRemovingFile" indeterminate color="blue"
                            class="mb-3"></v-progress-linear>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="packageDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updatePackage() : createPackage()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="optionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Opties toevoegen aan pakket</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingOptions || isAddingOptions" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingOptions" v-model="selectedOptions" :items="availableOptions"
                        item-value="id" :item-title="getOptionLabel" label="Voeg opties toe" multiple chips clearable
                        :disabled="loadingOptions" @update:model-value="onOptionSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingOptions" color="primary" @click="addSelectedOptionsToTable"
                        :disabled="selectedOptions.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingOptions" :headers="addedOptionsTableHeaders" :items="addedOptions"
                        item-value="id" class="mt-3">
                        <template v-slot:item.week_price="{ item }">
                            €{{ parseFloat(item.week_price).toFixed(2) }}
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeOptionFromPackage(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingOptions" class="mt-3">
                        Laden van beschikbare opties...
                    </v-alert>
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
                    <v-progress-linear v-if="loadingMagazineGroups || isAddingMagazineGroups" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>
                    <v-form v-model="validMagazineGroups" @submit.prevent="addMagazineGroupToPackage"
                        v-if="!loadingMagazineGroups">

                        <v-data-table :headers="magazineGroupHeaders" :items="availableMagazineGroups"
                            select-strategy="single" show-select v-model="selectedMagazineGroup">
                        </v-data-table>

                    </v-form>

                    <v-alert v-if="loadingMagazineGroups" class="mt-3">
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

        <v-dialog v-model="editionChoiceDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Editie keuzes toevoegen aan pakket</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingEditionChoices || isAddingEditionChoices" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingEditionChoices" v-model="selectedEditionChoices"
                        :items="availableEditionChoices" item-value="id" :item-title="getEditionChoiceLabel"
                        label="Voeg editie keuzes toe" multiple chips clearable :disabled="loadingEditionChoices"
                        @update:model-value="onEditionChoiceSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingEditionChoices" color="primary" @click="addSelectedEditionChoicesToTable"
                        :disabled="selectedEditionChoices.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingEditionChoices" :headers="addedEditionChoicesTableHeaders"
                        :items="addedEditionChoices" item-value="id" class="mt-3">
                        <template v-slot:item.week_price="{ item }">
                            €{{ parseFloat(item.week_price).toFixed(2) }}
                        </template>
                        <template v-slot:item.available="{ item }">
                            <span>{{ item.available ? 'Ja' : 'Nee' }}</span>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeEditionChoiceFromPackage(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingEditionChoices" class="mt-3">
                        Laden van beschikbare editie keuzes...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="editionChoiceDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addEditionChoicesToPackage"
                        :disabled="isAddingEditionChoices || loadingEditionChoices">Opslaan</v-btn>
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
import { ref, computed, onMounted } from 'vue';
import { usePackageStore } from '../stores/package.module';
import { useOptionStore } from '../stores/option.module';
import { usePackageOptionStore } from '../stores/package-option.module';
import { useMagazineGroupStore } from '../stores/magazine-group.module';
import { useWeeklyEditionChoiceStore } from '../stores/weekly-edition-choice.module';
import { usePackageWeeklyEditionChoiceStore } from '../stores/package-weekly-edition-choice.module';

const packageStore = usePackageStore();
const optionStore = useOptionStore();
const packageOptionStore = usePackageOptionStore();
const magazineGroupStore = useMagazineGroupStore();
const weeklyEditionChoiceStore = useWeeklyEditionChoiceStore();
const packageWeeklyEditionChoiceStore = usePackageWeeklyEditionChoiceStore();
const packageDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const loadingEditionChoices = ref(false);
const loadingDialog = ref(false);
const loadingOptions = ref(false);
const loadingMagazineGroups = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const deletePackageDialog = ref(null);
const validMagazineGroups = ref(false);
const isUploading = ref(false);
const isRemovingFile = ref(false);
const uploadError = ref('');
const addedEditionChoices = ref([]);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const packageToDelete = ref(null);
const addedOptions = ref([]);
const search = ref('');
const timeout = ref(null);

const availableOptions = ref([]);
const selectedOptions = ref([]);
const optionDialog = ref(false);
const currentPackage = ref(null);
const isAddingOptions = ref(false);

const availableMagazineGroups = ref([]);
const selectedMagazineGroup = ref([]);
const magazineGroupDialog = ref(false);
const selectedMagazineGroupInitial = ref([]);
const isAddingMagazineGroups = ref(false);

const availableEditionChoices = ref([]);
const selectedEditionChoices = ref([]);
const editionChoiceDialog = ref(false);
const isAddingEditionChoices = ref(false);

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
]);

const addedEditionChoicesTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Week prijs", value: "week_price" },
    { title: "Beschikbaar", value: "available" },
    { title: "Acties", value: "actions", sortable: false },
]);

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

const getEditionChoiceLabel = (choice) => {
    return `€${choice.week_price} per week, ${choice.available ? 'Beschikbaar' : 'Niet beschikbaar'}`;
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

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getPackages();
    }, 500);
};

const isMagazineGroupsFormValid = computed(() => {
    return JSON.stringify(selectedMagazineGroup.value) !== JSON.stringify(selectedMagazineGroupInitial.value);
});

const getPackages = async () => {
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
        packageStore.packageData = await packageStore.getPackages(params);
        tableRows.value = packageStore.packageData.data;
        totalItems.value = packageStore.packageData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om pakketten op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createPackage = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await packageStore.createPackage(pkg.value);
            showSnackbar("Pakket succesvol aangemakaakt!", "success");
            getPackages();
            resetPackage();
        } catch (error) {
            showSnackbar("Niet gelukt om pakket aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            packageDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updatePackage = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await packageStore.updatePackage(pkg.value.id, pkg.value);
            showSnackbar("Pakket succesvol aangepast!", "success");
            getPackages();
            resetPackage();
        } catch (error) {
            showSnackbar("Niet gelukt om pakket te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            packageDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removePackage = async (pkg) => {
    if (pkg) {
        loadingDialog.value = true;

        try {
            await packageStore.removePackage(pkg.id);
            showSnackbar("Pakket succesvol verwijderd!", "success");
            getPackages();
        } catch (error) {
            showSnackbar("Niet gelukt om pakket te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deletePackageDialog.value = false;
        }
    }
};

const addSelectedOptionsToTable = () => {
    addedOptions.value = addedOptions.value.concat(selectedOptions.value);

    availableOptions.value = availableOptions.value.filter(
        (option) => !selectedOptions.value.includes(option)
    );

    selectedOptions.value = [];
};

const addSelectedEditionChoicesToTable = () => {
    addedEditionChoices.value = addedEditionChoices.value.concat(selectedEditionChoices.value);

    availableEditionChoices.value = availableEditionChoices.value.filter(
        (choice) => !selectedEditionChoices.value.includes(choice)
    );

    selectedEditionChoices.value = [];
};

const addOptionsToPackage = async () => {
    isAddingOptions.value = true;

    try {
        const optionIds = addedOptions.value.map(option => option.id);

        await packageStore.updatePackage(currentPackage.value.id, {
            option_ids: optionIds,
        });

        showSnackbar("Opties succesvol bijgewerkt!", "success");
        optionDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bewerken van opties", "error");
    } finally {
        isAddingOptions.value = false;
    }
};

const addEditionChoicesToPackage = async () => {
    isAddingEditionChoices.value = true;

    try {
        const editionChoiceIds = addedEditionChoices.value.map(choice => choice.id);

        await packageStore.updatePackage(currentPackage.value.id, {
            weekly_edition_choice_ids: editionChoiceIds,
        });

        showSnackbar("Editie keuzes succesvol bijgewerkt!", "success");
        editionChoiceDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bewerken van editie keuzes", "error");
    } finally {
        isAddingEditionChoices.value = false;
    }
};

// TODO: kijken of dit weg kan
const onOptionSelectionChange = () => {
    availableOptions.value = availableOptions.value.filter(
        option => !selectedOptions.value.includes(option.id)
    );

    const newSelectedOptions = selectedOptions.value.filter(
        selectedOption => !addedOptions.value.some(added => added.id === selectedOption.id)
    )

    console.log(newSelectedOptions);
};

const onEditionChoiceSelectionChange = () => {
    availableEditionChoices.value = availableEditionChoices.value.filter(
        choice => !selectedEditionChoices.value.includes(choice.id)
    );

    const newSelectedEditionChoices = selectedEditionChoices.value.filter(
        selectedChoice => !addedEditionChoices.value.some(added => added.id === selectedChoice.id)
    );

    console.log(newSelectedEditionChoices);
};

const removeOptionFromPackage = (option) => {
    addedOptions.value = addedOptions.value.filter(addedOption => addedOption.id !== option.id);

    availableOptions.value.push(option);
};

const removeEditionChoiceFromPackage = (editionChoice) => {
    addedEditionChoices.value = addedEditionChoices.value.filter(addedChoice => addedChoice.id !== editionChoice.id);

    availableEditionChoices.value.push(editionChoice);
};

const addMagazineGroupToPackage = async () => {
    const groupId = selectedMagazineGroup.value?.[0] || null;

    isAddingMagazineGroups.value = true;

    try {
        await packageStore.updatePackage(currentPackage.value.id, {
            magazine_group_id: groupId,
        });

        showSnackbar("Tijdschrift groep succesvol bijgewerkt!", "success");
        magazineGroupDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van tijdschrift groep.", "error");
    } finally {
        isAddingMagazineGroups.value = false;
    }
};

const getOptionsForPackage = async (packageId) => {
    try {
        loadingOptions.value = true;

        optionStore.optionData = await optionStore.getOptions();
        availableOptions.value = optionStore.optionData.data;

        packageOptionStore.packageOptionData = await packageOptionStore.getOptionsForPackage(packageId);
        addedOptions.value = packageOptionStore.packageOptionData;

        availableOptions.value = availableOptions.value.filter(
            option => !addedOptions.value.some(added => added.id === option.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van opties.", "error");
    } finally {
        loadingOptions.value = false;
    }
};

const getEditionChoicesForPackage = async (packageId) => {
    try {
        loadingEditionChoices.value = true;

        weeklyEditionChoiceStore.weeklyEditionChoiceData = await weeklyEditionChoiceStore.getWeeklyEditionChoices();
        availableEditionChoices.value = weeklyEditionChoiceStore.weeklyEditionChoiceData.data;

        packageWeeklyEditionChoiceStore.packageWeeklyEditionChoiceData = await packageWeeklyEditionChoiceStore.getWeeklyEditionChoicesForPackage(packageId);
        addedEditionChoices.value = packageWeeklyEditionChoiceStore.packageWeeklyEditionChoiceData;

        availableEditionChoices.value = availableEditionChoices.value.filter(
            choice => !addedEditionChoices.value.some(added => added.id === choice.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van editie keuzes.", "error");
    } finally {
        loadingEditionChoices.value = false;
    }
};

const getMagazineGroupForPackage = async (packageId) => {
    try {
        loadingMagazineGroups.value = true;

        magazineGroupStore.magazineGroupData = await magazineGroupStore.getMagazineGroups();
        availableMagazineGroups.value = magazineGroupStore.magazineGroupData.data;

        const packageByIdResponse = await packageStore.getPackage(packageId);

        const magazineGroupId = packageByIdResponse.magazine_group_id;

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

const showAddEditionChoicesDialog = (pkg) => {
    currentPackage.value = pkg;
    selectedEditionChoices.value = [];
    editionChoiceDialog.value = true;
    getEditionChoicesForPackage(pkg.id);
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
    packageDialog.value = true;
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
    pkg.value.image_url = file.url;
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