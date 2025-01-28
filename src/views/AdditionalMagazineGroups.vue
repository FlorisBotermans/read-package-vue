<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateAdditionalMagazineGroupDialog">Nieuwe aanvullende tijdschriften
                    groep</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditAdditionalMagazineGroupDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="showRemoveAdditionalMagazineGroupDialog(item)">mdi-delete</v-icon>
                    <v-btn color="primary" @click="showAddAdditionalMagazinesDialog(item)">Aanvullende tijdschriften
                        toevoegen</v-btn>
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
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteAdditionalMagazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de aanvullende tijdschriften groep wilt
                        verwijderen?</span>
                </v-card-title>
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
                    <v-progress-linear v-if="loadingMagazines" indeterminate color="blue"
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
                            <v-text-field v-model="magazine.price" label="Prijs (€)" type="number" class="ml-3"></v-text-field>
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
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

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
    { title: "Acties", value: "actions", sortable: false },
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

const isAddSelectedMagazinesToTableButtonDisabled = computed(() => {
    return selectedMagazines.value.length === 0 ||
        selectedMagazines.value.some(magazine => !magazine.price || parseFloat(magazine.price) <= 0);
});

const isAdditionalMagazinesFormValid = computed(() => {
    const selectedAdditionalMagazinesSet = new Set(selectedAdditionalMagazines.value);
    const initialAdditionalMagazinesSet = new Set(selectedMagazinesInitial.value);

    return selectedAdditionalMagazinesSet.size !== initialAdditionalMagazinesSet.size ||
        [...selectedAdditionalMagazinesSet].some(additionalMagazine => !initialAdditionalMagazinesSet.has(additionalMagazine)) ||
        [...initialAdditionalMagazinesSet].some(additionalMagazine => !selectedAdditionalMagazinesSet.has(additionalMagazine));
});

const getAdditionalMagazineGroups = async () => {
    loadingDataTable.value = true;

    const params = {
        page: page.value,
        items_per_page: itemsPerPage.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/additional-magazine-groups', { params })
        .then(response => {
            tableRows.value = response.data.data;
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            showSnackbar("Niet gelukt om aanvullende tijdschrift groepen op te halen.", "error");
        })
        .finally(() => {
            loadingDataTable.value = false;
        });
}

const createAdditionalMagazineGroup = () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.post('/api/additional-magazine-groups', additionalMagazineGroup.value)
            .then(response => {
                showSnackbar("Aanvullende tijdschrift groep succesvol aangemakaakt!", "success");
                getAdditionalMagazineGroups();
                additionalMagazineGroupDialog.value = false;
                resetAdditionalMagazineGroup();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om aanvullende tijdschrift groep aan te maken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            });
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateAdditionalMagazineGroup = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        axios.put(`/api/additional-magazine-groups/${additionalMagazineGroup.value.id}`, additionalMagazineGroup.value)
            .then(response => {
                showSnackbar("Aanvullende tijdschrift groep succesvol aangepast!", "success");
                getAdditionalMagazineGroups();
                additionalMagazineGroupDialog.value = false;
                resetAdditionalMagazineGroup();
            })
            .catch(error => {
                showSnackbar("Niet gelukt om aanvullende tijdschrift groep te bewerken.", "error");
            })
            .finally(() => {
                loadingDialog.value = false;
            })
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeAdditionalMagazineGroup = async (additionalMagazineGroup) => {
    if (additionalMagazineGroup) {
        loadingDialog.value = true;

        axios.delete(`/api/additional-magazine-groups/${additionalMagazineGroup.id}`)
            .then(response => {
                getAdditionalMagazineGroups();
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
    loadingMagazines.value = true;
    // try {
    //     const currentAdditionalMagazinesResponse = await axios.get(`/api/magazine-groups/${currentAdditionalMagazineGroup.value.id}/magazines`);
    //     const currentAdditionalMagazineIds = currentAdditionalMagazinesResponse.data.map(additionalMagazine => additionalMagazine.id);

    //     const additionalMagazinesToAdd = selectedAdditionalMagazines.value.filter(id => !currentAdditionalMagazineIds.includes(id));
    //     const additionalMagazinesToRemove = currentAdditionalMagazineIds.filter(id => !selectedAdditionalMagazines.value.includes(id));

    //     if (additionalMagazinesToAdd.length > 0) {
    //         await axios.post(`/api/additional-magazine-groups/${currentAdditionalMagazineGroup.value.id}/add-additional-magazines`, { additionalMagazines: additionalMagazineDialog, agazinesToAdd });
    //     }
    //     if (additionalMagazinesToRemove.length > 0) {
    //         await axios.post(`/api/additional-magazine-groups/${currentAdditionalMagazineGroup.value.id}/remove-additional-magazines`, { additionalMagazines: additionalMagazinesToRemove });
    //     }

    //     showSnackbar("Aanvullende tijdschriften succesvol bijgewerkt!", "success");
    //     additionalMagazineDialog.value = false;
    // } catch (error) {
    //     showSnackbar("Fout bij het bijwerken van aanvullende tijdschriften.", "error");
    // } finally {
    //     loadingAdditionalMagazines.value = false;
    //     isAddingAdditionalMagazines.value = false;
    // }

    try {
        // const magazineIds = addedMagazines.value.map(magazine => magazine.id);

        const magazineDetails = addedMagazines.value.map(magazine => ({
            id: magazine.id,
            price: magazine.price,
        }));

        console.log(magazineDetails);

        await axios.put(`/api/additional-magazine-groups/${currentAdditionalMagazineGroup.value.id}`, {
            magazines: magazineDetails
        });

        showSnackbar("Tijdschriften succesvol bijgewerkt!", "success");
        additionalMagazineDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bewerken van tijdschriften", "error");
    } finally {
        isAddingMagazines.value = false;
        loadingMagazines.value = false;
    }
};

const getMagazinesForAdditionalMagazineGroup = async (additionalMagazineGroupId) => {
    try {
        loadingMagazines.value = true;
        const magazinesResponse = await axios.get('/api/magazines');
        availableMagazines.value = magazinesResponse.data.data;

        const additionalMagazineGroupMagazinesResponse = await axios.get(`/api/additional-magazine-groups/${additionalMagazineGroupId}/magazines`);
        addedMagazines.value = additionalMagazineGroupMagazinesResponse.data.map((magazine) => ({
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
    )
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
    deleteAdditionalMagazineGroupDialog.value = false
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