<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateMagazineGroupDialog">Nieuwe tijdschriften groep</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="magazineGroupsItemsPerPage"
                :sort-by="magazineGroupsSortBy.key" :sort-desc="magazineGroupsSortBy.order"
                :items-length="magazineGroupsTotalItems" :loading="loadingDataTable"
                @update:options="updateMagazineGroupsOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditMagazineGroupDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemoveMagazineGroupDialog(item)">mdi-delete</v-icon>
                    <v-btn color="primary" @click="showAddMagazinesDialog(item)">Tijdschriften toevoegen</v-btn>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="magazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Tijdschrift groep Bewerken' : 'Nieuwe tijdschrift groep toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateMagazineGroup() : createMagazineGroup()">
                        <v-text-field v-model="magazineGroup.name" label="Naam" required></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="magazineGroupDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateMagazineGroup() : createMagazineGroup()"
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteMagazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de tijdschriften groep wilt verwijderen?</span>
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancelDelete">Annuleer</v-btn>
                    <v-btn color="red darken-1" text @click="confirmDelete">Doorgaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="magazineDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Tijdschriften toevoegen aan groep</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingMagazines" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingMagazines" v-model="selectedMagazines" :items="availableMagazines"
                        item-value="id" item-title="name" label="Voeg tijdschriften toe" multiple chips clearable
                        :disabled="loadingMagazines" @update:model-value="onMagazineSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingMagazines" color="primary" @click="addSelectedMagazinesToTable"
                        :disabled="selectedMagazines.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingMagazines" :headers="addedMagazinesTableHeaders" :items="addedMagazines"
                        item-value="id" class="mt-3">
                        <template v-slot:item.image_url="{ item }">
                            <img :src="item.image_url" style="max-width: 50px;">
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeMagazineFromGroup(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <!-- <v-data-table-server :headers="magazineTableHeaders" :items="availableMagazines"
                        :items-per-page="magazinesItemsPerPage" :items-length="magazinesTotalItems"
                        :sort-by="magazinesSortBy.key" :sort-desc="magazinesSortBy.order" show-select
                        v-model="selectedMagazines" @update:options="updateMagazinesOptions">
                    </v-data-table-server> -->

                    <v-alert v-if="!loadingMagazines && isAddingMagazines" class="mt-3">
                        Laden van beschikbare tijdschriften...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="magazineDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addMagazinesToMagazineGroup"
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
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const magazineGroupDialog = ref(false);
const isEditMode = ref(false);
const magazineGroupsTotalItems = ref(0);
const magazinesTotalItems = ref(0);
const magazineGroupsPage = ref(1);
const magazinesPage = ref(1);
const tableRows = ref([]);
const magazineGroupsItemsPerPage = ref(10);
const magazinesItemsPerPage = ref(10);
const loadingDataTable = ref(false);
const loadingDialog = ref(false);
const loadingMagazines = ref(false);
const magazineGroupsSortBy = ref([{ key: 'id', order: 'asc' }]);
const magazinesSortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const magazineGroupToDelete = ref(null);
const deleteMagazineGroupDialog = ref(null);
const availableMagazines = ref([]);
const selectedMagazines = ref([]);
const magazineDialog = ref(false);
const currentMagazineGroup = ref(null);
const selectedMagazinesInitial = ref([]);
const isAddingMagazines = ref(false);
const addedMagazines = ref([]);

const headers = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Acties", value: "actions", sortable: false },
]);

const addedMagazinesTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Afbeelding", value: "image_url" },
    { title: "Acties", value: "actions", sortable: false },
]);

const magazineGroup = ref({
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
    return magazineGroup.value.name;
});

const isMagazinesFormValid = computed(() => {
    const selectedMagazinesSet = new Set(selectedMagazines.value);
    const initialMagazinesSet = new Set(selectedMagazinesInitial.value);

    return selectedMagazinesSet.size !== initialMagazinesSet.size ||
        [...selectedMagazinesSet].some(magazine => !initialMagazinesSet.has(magazine)) ||
        [...initialMagazinesSet].some(magazine => !selectedMagazinesSet.has(magazine));
});

const getMagazineGroups = async () => {
    loadingDataTable.value = true;

    const params = {
        page: magazineGroupsPage.value,
        items_per_page: magazineGroupsItemsPerPage.value,
        sort_by: magazineGroupsSortBy.value[0].key,
        sort_dir: magazineGroupsSortBy.value[0].order,
    };

    axios.get('/api/magazine-groups', { params })
        .then(response => {
            tableRows.value = response.data.data;
            magazineGroupsTotalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            showSnackbar("Niet gelukt om tijdschrift groepen op te halen.", "error");
        })
        .finally(() => {
            loadingDataTable.value = false;
        });
}

const createMagazineGroup = () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.post('/api/magazine-groups', magazineGroup.value)
            .then(response => {
                showSnackbar("Tijdschrift groep succesvol aangemakaakt!", "success");
                getMagazineGroups();
                magazineGroupDialog.value = false;
                resetMagazineGroup();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om tijdschrift groep aan te maken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateMagazineGroup = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.put(`/api/magazine-groups/${magazineGroup.value.id}`, magazineGroup.value)
            .then(response => {
                showSnackbar("Tijdschrift groep succesvol aangepast!", "success");
                getMagazineGroups();
                magazineGroupDialog.value = false;
                resetMagazineGroup();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om tijdschrift groep te bewerken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeMagazineGroup = async (magazineGroup) => {
    if (magazineGroup) {
        loadingDialog.value = true;

        axios.delete(`/api/magazine-groups/${magazineGroup.id}`)
            .then(response => {
                getMagazineGroups();
                showSnackbar("Tijdschrift groep succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om tijdschrift groep te verwijderen.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    }
};

const addSelectedMagazinesToTable = () => {
    addedMagazines.value = addedMagazines.value.concat(selectedMagazines.value);

    availableMagazines.value = availableMagazines.value.filter(
        (magazine) => !selectedMagazines.value.includes(magazine)
    );

    selectedMagazines.value = [];
};

const addMagazinesToMagazineGroup = async () => {
    // isAddingMagazines.value = true;
    loadingMagazines.value = true;
    // try {
    //     const currentMagazinesResponse = await axios.get(`/api/magazine-groups/${currentMagazineGroup.value.id}/magazines`);
    //     const currentMagazineIds = currentMagazinesResponse.data.map(magazine => magazine.id);

    //     const magazinesToAdd = selectedMagazines.value.filter(id => !currentMagazineIds.includes(id));
    //     const magazinesToRemove = currentMagazineIds.filter(id => !selectedMagazines.value.includes(id));

    //     if (magazinesToAdd.length > 0) {
    //         await axios.post(`/api/magazine-groups/${currentMagazineGroup.value.id}/add-magazines`, { magazines: magazinesToAdd });
    //     }
    //     if (magazinesToRemove.length > 0) {
    //         await axios.post(`/api/magazine-groups/${currentMagazineGroup.value.id}/remove-magazines`, { magazines: magazinesToRemove });
    //     }

    //     showSnackbar("Tijdschriften succesvol bijgewerkt!", "success");
    //     magazineDialog.value = false;
    // } catch (error) {
    //     showSnackbar("Fout bij het bijwerken van tijdschriften.", "error");
    // } finally {
    //     loadingMagazines.value = false;
    //     isAddingMagazines.value = false;
    // }

    try {
        const magazineIds = addedMagazines.value.map(magazine => magazine.id);

        await axios.put(`/api/magazine-groups/${currentMagazineGroup.value.id}`, {
            magazine_ids: magazineIds,
        });

        showSnackbar("Tijdschriften succesvol bijgewerkt!", "success");
        magazineDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bewerken van tijdschriften", "error");
    } finally {
        isAddingMagazines.value = false;
        loadingMagazines.value = false;
    }
};

const getMagazinesForMagazineGroup = async (magazineGroupId) => {
    try {
        loadingMagazines.value = true;

        const params = {
            page: magazinesPage.value,
            items_per_page: magazinesItemsPerPage.value,
            sort_by: magazinesSortBy.value[0].key,
            sort_dir: magazinesSortBy.value[0].order,
        };

        const magazinesResponse = await axios.get('/api/magazines', { params });
        availableMagazines.value = magazinesResponse.data.data;

        magazinesTotalItems.value = magazinesResponse.data.meta.pagination.total;

        const magazineGroupMagazinesResponse = await axios.get(`/api/magazine-groups/${magazineGroupId}/magazines`);
        addedMagazines.value = magazineGroupMagazinesResponse.data;
        // selectedMagazines.value = magazineGroupMagazinesResponse.data.map(magazines => magazines.id);

        availableMagazines.value = availableMagazines.value.filter(
            magazine => !addedMagazines.value.some(added => added.id === magazine.id)
        );
        // selectedMagazinesInitial.value = [...selectedMagazines.value];
    } catch (error) {
        showSnackbar("Fout bij het ophalen van tijdschriften.", "error");
    } finally {
        loadingMagazines.value = false;
    }
};

const onMagazineSelectionChange = () => {
    availableMagazines.value = availableMagazines.value.filter(
        magazine => !selectedMagazines.value.includes(magazine.id)
    );

    const newSelectedMagazines = selectedMagazines.value.filter(
        selectedMagazine => !addedMagazines.value.some(added => added.id === selectedMagazine.id)
    );

    console.log(newSelectedMagazines)
};

const removeMagazineFromGroup = (magazine) => {
    addedMagazines.value = addedMagazines.value.filter(addedMagazine => addedMagazine.id !== magazine.id);

    availableMagazines.value.push(magazine);
};

const showAddMagazinesDialog = (magazineGroup) => {
    currentMagazineGroup.value = magazineGroup;
    selectedMagazines.value = [];
    magazineDialog.value = true;
    getMagazinesForMagazineGroup(magazineGroup.id);
};

const showCreateMagazineGroupDialog = () => {
    isEditMode.value = false;
    resetMagazineGroup();
    magazineGroupDialog.value = true;
};

const cancelDelete = () => {
    deleteMagazineGroupDialog.value = false;
    magazineGroupToDelete.value = null;
};

const confirmDelete = () => {
    removeMagazineGroup(magazineGroupToDelete.value);
    deleteMagazineGroupDialog.value = false
};

const showRemoveMagazineGroupDialog = (magazineGroup) => {
    magazineGroupToDelete.value = magazineGroup;
    deleteMagazineGroupDialog.value = true;
};

const showEditMagazineGroupDialog = (newMagazineGroup) => {
    isEditMode.value = true;
    magazineGroup.value = { ...newMagazineGroup };
    magazineGroupDialog.value = true;
};

const resetMagazineGroup = () => {
    magazineGroup.value = {
        name: '',
    };
};

const updateMagazineGroupsOptions = (options) => {
    const currentSort = Array.isArray(magazineGroupsSortBy.value) && magazineGroupsSortBy.value.length > 0
        ? magazineGroupsSortBy.value[0]
        : { key: 'id', order: 'asc' };

    const newSort = Array.isArray(options.sortBy) && options.sortBy.length > 0
        ? options.sortBy[0]
        : null;

    const shouldUpdateSort = newSort && (newSort.key !== currentSort.key || newSort.order !== currentSort.order);
    const shouldUpdatePagination = options.page !== magazineGroupsPage.value || options.itemsPerPage !== magazineGroupsItemsPerPage.value;

    if (!newSort || shouldUpdateSort || shouldUpdatePagination) {
        if (!newSort) {
            magazineGroupsSortBy.value = [{ key: 'id', order: 'asc' }];
        } else if (shouldUpdateSort) {
            magazineGroupsSortBy.value[0] = newSort;
        }

        magazineGroupsPage.value = options.page;
        magazineGroupsItemsPerPage.value = options.itemsPerPage;

        getMagazineGroups();
    }
};

const updateMagazinesOptions = (options) => {
    console.log('test');
    const currentSort = Array.isArray(magazinesSortBy.value) && magazinesSortBy.value.length > 0
        ? magazinesSortBy.value[0]
        : { key: 'id', order: 'asc' };

    const newSort = Array.isArray(options.sortBy) && options.sortBy.length > 0
        ? options.sortBy[0]
        : null;

    const shouldUpdateSort = newSort && (newSort.key !== currentSort.key || newSort.order !== currentSort.order);
    const shouldUpdatePagination = options.page !== magazinesPage.value || options.itemsPerPage !== magazinesItemsPerPage.value;

    if (!newSort || shouldUpdateSort || shouldUpdatePagination) {
        if (!newSort) {
            magazinesSortBy.value = [{ key: 'id', order: 'asc' }];
        } else if (shouldUpdateSort) {
            magazinesSortBy.value[0] = newSort;
        }

        magazinesPage.value = options.page;
        magazinesItemsPerPage.value = options.itemsPerPage;

        getMagazinesForMagazineGroup(currentMagazineGroup.value.id);
    }
}

onMounted(() => {
    getMagazineGroups();
});

</script>