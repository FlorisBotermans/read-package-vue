<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateAdditionalMagazineGroupDialog">Nieuwe aanvullende tijdschriften
                    groep</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditAdditionalMagazineGroupDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveAdditionalMagazineGroupDialog(item)">
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
                                    <v-list-item @click="showAddAdditionalMagazinesDialog(item)">
                                        <v-list-item-title>Tijdschriften toevoegen</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="additionalMagazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Additionele tijdschrift groep Bewerken' : 'Nieuwe additionele tijdschrift groep toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateAdditionalMagazineGroup() : createAdditionalMagazineGroup()">
                        <v-text-field v-model="additionalMagazineGroup.name" label="Naam" required></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="additionalMagazineGroupDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateAdditionalMagazineGroup() : createAdditionalMagazineGroup()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteAdditionalMagazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de aanvullende tijdschriften groep wilt
                        verwijderen?</span>
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

        <v-dialog v-model="additionalMagazineDialog" max-width="600px" max-height="800px">
            <v-card>
                <v-card-title>
                    <span class="headline">Tijdschriften toevoegen aan aanvullende tijdschriften groep</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingMagazines || isAddingMagazines" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingMagazines" v-model="selectedMagazines" :items="availableMagazines"
                        item-value="id" item-title="name" label="Voeg tijdschriften toe" multiple chips clearable
                        :disabled="loadingMagazines" @update:model-value="onMagazineSelectionChange"></v-combobox>

                    <v-row v-if="selectedMagazines.length > 0" v-for="(magazine, index) in selectedMagazines"
                        :key="magazine.id" dense>
                        <v-col cols="6">
                            <v-list-subheader>{{ magazine.name }}:</v-list-subheader>
                        </v-col>
                        <v-col cols="6">
                            <v-text-field v-model="magazine.price" label="Prijs (€)" type="number"
                                class="ml-3"></v-text-field>
                        </v-col>
                    </v-row>

                    <v-btn v-if="!loadingMagazines" color="primary" @click="addSelectedMagazinesToTable"
                        :disabled="isAddSelectedMagazinesToTableButtonDisabled">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingMagazines" :headers="addedAdditionalMagazinesTableHeaders"
                        :items="addedMagazines" item-value="id" class="mt-3">
                        <template v-slot:item.image_url="{ item }">
                            <img :src="item.image_url" style="max-width: 50px;">
                        </template>

                        <template v-slot:item.price="{ item }">
                            €{{ parseFloat(item.price).toFixed(2) }}
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red"
                                @click="removeMagazineFromAdditionalMagazineGroup(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingMagazines" class="mt-3">
                        Laden van beschikbare tijdschriften...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="additionalMagazineDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addMagazinesToAdditionalMagazineGroup"
                        :disabled="isAddingMagazines || loadingMagazines">Opslaan</v-btn>
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
import { useAdditionalMagazineGroupStore } from '../stores/additional-magazine-group.module';
import { useMagazineStore } from '../stores/magazine.module';
import { useAdditionalMagazineGroupMagazineStore } from '../stores/additional-magazine-group-magazine.module';

const additionalMagazineGroupStore = useAdditionalMagazineGroupStore();
const magazineStore = useMagazineStore();
const additionalMagazineGroupMagazineStore = useAdditionalMagazineGroupMagazineStore();
const additionalMagazineGroupDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const loadingDialog = ref(false);
const loadingMagazines = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const additionalMagazineGroupToDelete = ref(null);
const deleteAdditionalMagazineGroupDialog = ref(null);
const availableMagazines = ref([]);
const selectedMagazines = ref([]);
const additionalMagazineDialog = ref(false);
const currentAdditionalMagazineGroup = ref(null);
const selectedMagazinesInitial = ref([]);
const isAddingMagazines = ref(false);
const addedMagazines = ref([]);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const addedAdditionalMagazinesTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Afbeelding", value: "image_url" },
    { title: "Prijs", value: "price" },
    { title: "Acties", value: "actions" },
]);

const additionalMagazineGroup = ref({
    name: '',
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
    return additionalMagazineGroup.value.name;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getAdditionalMagazineGroups();
    }, 500);
};

const isAddSelectedMagazinesToTableButtonDisabled = computed(() => {
    return selectedMagazines.value.length === 0 ||
        selectedMagazines.value.some(magazine => !magazine.price || parseFloat(magazine.price) <= 0);
});

const getAdditionalMagazineGroups = async () => {
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
        additionalMagazineGroupStore.additionalMagazineGroupData = await additionalMagazineGroupStore.getAdditionalMagazineGroups(params);
        tableRows.value = additionalMagazineGroupStore.additionalMagazineGroupData.data;
        totalItems.value = additionalMagazineGroupStore.additionalMagazineGroupData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om aanvullende tijdschrift groepen op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createAdditionalMagazineGroup = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await additionalMagazineGroupStore.createAdditionalMagazineGroup(additionalMagazineGroup.value);
            showSnackbar("Aanvullende tijdschrift groep succesvol aangemakaakt!", "success");
            getAdditionalMagazineGroups();
            resetAdditionalMagazineGroup();
        } catch (error) {
            showSnackbar("Niet gelukt om aanvullende tijdschrift groep aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            additionalMagazineGroupDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateAdditionalMagazineGroup = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await additionalMagazineGroupStore.updateAdditionalMagazineGroup(additionalMagazineGroup.value.id, additionalMagazineGroup.value);
            showSnackbar("Aanvullende tijdschrift groep succesvol aangepast!", "success");
            getAdditionalMagazineGroups();
            resetAdditionalMagazineGroup();
        } catch (error) {
            showSnackbar("Niet gelukt om aanvullende tijdschrift groep te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            additionalMagazineGroupDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeAdditionalMagazineGroup = async (additionalMagazineGroup) => {
    if (additionalMagazineGroup) {
        loadingDialog.value = true;

        try {
            await additionalMagazineGroupStore.deleteAdditionalMagazineGroup(additionalMagazineGroup.id);
            getAdditionalMagazineGroups();
            showSnackbar("Aanvullende tijdschrift groep succesvol verwijderd!", "success");
        } catch (error) {
            showSnackbar("Niet gelukt om aanvullende tijdschrift groep te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteAdditionalMagazineGroupDialog.value = false;
        }
    }
};

const addSelectedMagazinesToTable = () => {
    const magazinesWithPrices = selectedMagazines.value.map(magazine => {
        return {
            ...magazine,
            price: magazine.price,
        };
    });

    addedMagazines.value = addedMagazines.value.concat(magazinesWithPrices);

    availableMagazines.value = availableMagazines.value.filter(
        (magazine) => !selectedMagazines.value.includes(magazine)
    );

    selectedMagazines.value = [];
};

const addMagazinesToAdditionalMagazineGroup = async () => {
    isAddingMagazines.value = true;

    try {
        const magazineDetails = addedMagazines.value.map(magazine => ({
            id: magazine.id,
            price: magazine.price,
        }));

        await additionalMagazineGroupStore.updateAdditionalMagazineGroup(currentAdditionalMagazineGroup.value.id, {
            magazines: magazineDetails
        });

        showSnackbar("Tijdschriften succesvol bijgewerkt!", "success");
        additionalMagazineDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bewerken van tijdschriften", "error");
    } finally {
        isAddingMagazines.value = false;
    }
};

const getMagazinesForAdditionalMagazineGroup = async (additionalMagazineGroupId) => {
    try {
        loadingMagazines.value = true;

        magazineStore.magazineData = await magazineStore.getMagazines();
        availableMagazines.value = magazineStore.magazineData.data;

        additionalMagazineGroupMagazineStore.additionalMagazineGroupMagazineData = await additionalMagazineGroupMagazineStore.getMagazinesForAdditionalMagazineGroup(additionalMagazineGroupId);

        addedMagazines.value = additionalMagazineGroupMagazineStore.additionalMagazineGroupMagazineData.map((magazine) => ({
            ...magazine,
            price: magazine.pivot.price
        }));

        availableMagazines.value = availableMagazines.value.filter(
            magazine => !addedMagazines.value.some(added => added.id === magazine.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van aanvullende tijdschriften.", "error");
    } finally {
        loadingMagazines.value = false;
    }
};

const onMagazineSelectionChange = () => {
    availableMagazines.value = availableMagazines.value.filter(
        magazine => !selectedMagazines.value.includes(magazine.id)
    );

    const newSelectedMagazine = selectedMagazines.value.filter(
        selectedMagazine => !addedMagazines.value.some(added => added.id === selectedMagazine.id)
    );
};

const removeMagazineFromAdditionalMagazineGroup = (magazine) => {
    addedMagazines.value = addedMagazines.value.filter(addedMagazine => addedMagazine.id !== magazine.id);

    availableMagazines.value.push(magazine);
}

const showAddAdditionalMagazinesDialog = (additionalMagazineGroup) => {
    currentAdditionalMagazineGroup.value = additionalMagazineGroup;
    selectedMagazines.value = [];
    additionalMagazineDialog.value = true;
    getMagazinesForAdditionalMagazineGroup(additionalMagazineGroup.id);
}

const showCreateAdditionalMagazineGroupDialog = () => {
    isEditMode.value = false;
    resetAdditionalMagazineGroup();
    additionalMagazineGroupDialog.value = true;
};

const cancelDelete = () => {
    deleteAdditionalMagazineGroupDialog.value = false;
    additionalMagazineGroupToDelete.value = null;
}

const confirmDelete = () => {
    removeAdditionalMagazineGroup(additionalMagazineGroupToDelete.value);
}

const showRemoveAdditionalMagazineGroupDialog = (additionalMagazineGroup) => {
    additionalMagazineGroupToDelete.value = additionalMagazineGroup;
    deleteAdditionalMagazineGroupDialog.value = true;
};

const showEditAdditionalMagazineGroupDialog = (newAdditionalMagazineGroup) => {
    isEditMode.value = true;
    additionalMagazineGroup.value = { ...newAdditionalMagazineGroup };
    additionalMagazineGroupDialog.value = true;
};

const resetAdditionalMagazineGroup = () => {
    additionalMagazineGroup.value = {
        name: '',
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

        getAdditionalMagazineGroups();
    }
};

onMounted(() => {
    getAdditionalMagazineGroups();
});

</script>