<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateGiftDialog">Nieuw welkomscadeau</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.image_url="{ item }">
                    <v-img max-width="50" :src="item.image_url"></v-img>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditGiftDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveGiftDialog(item)">
                                Verwijder
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="giftDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Welkomscadeau Bewerken' : 'Nieuw welkomscadeau toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid" @submit.prevent="isEditMode ? updateGift() : createGift()">
                        <v-text-field v-model="gift.name" label="Naam" required></v-text-field>
                        <v-text-field v-model="gift.valid_after_months" label="Geldig bij (maanden)" type="number"
                            required min="0" step="1"></v-text-field>
                        <DOSpacesUploadComponent @uploaded="handleFileUploaded" @upload-start="handleUploadStart"
                            @upload-finish="handleUploadFinish" @delete-start="handleStartDeleteFile"
                            @file-deleted="handleFileDeleted" @upload-error="handleUploadError"
                            @delete-error="handleRemoveFileError" v-bind="isEditMode ? { file: gift.image_url } : {}"
                            accepted="image/jpeg,image/png"
                            msg="Upload hier de afbeelding (alleen jpeg en png) die hoort bij dit welkomscadeau (max 5 mb).)"
                            extension="jpeg" folder="gifts" :maxSize="5">
                        </DOSpacesUploadComponent>

                        <v-progress-linear v-if="isUploading || isRemovingFile" indeterminate color="blue"
                            class="mt-4"></v-progress-linear>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="giftDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateGift() : createGift()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteGiftDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u het welkomscadeau wilt verwijderen?</span>
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
import { ref, computed, onMounted } from 'vue';
import { useGiftStore } from '../stores/gift.module';

const giftStore = useGiftStore();
const giftDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const loadingDialog = ref(false);
const isUploading = ref(false);
const isRemovingFile = ref(false);
const uploadError = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const giftToDelete = ref(null);
const deleteGiftDialog = ref(null);
const search = ref('');
const timeout = ref(null);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Geldig bij (maanden)", value: "valid_after_months", sortable: true },
    { title: "Afbeelding", value: "image_url", sortable: false },
    { title: "Acties", value: "actions", sortable: false }
]);

const gift = ref({
    name: '',
    valid_after_months: '',
    image_url: '',
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
    return gift.value.name && gift.value.valid_after_months && gift.value.image_url;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getGifts();
    }, 500);
};

const getGifts = async () => {
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
        giftStore.giftData = await giftStore.getGifts(params);
        tableRows.value = giftStore.giftData.data;
        totalItems.value = giftStore.giftData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om welkomscadeaus op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createGift = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await giftStore.createGift(gift.value);
            showSnackbar("Welkomscadeau succesvol aangemakaakt!", "success");
            getGifts();
            resetGift();
        } catch (error) {
            showSnackbar("Niet gelukt om welkomscadeau aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            giftDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const updateGift = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await giftStore.updateGift(gift.value.id, gift.value);
            showSnackbar("Welkomscadeau succesvol aangepast!", "success");
            getGifts();
            resetGift();
        } catch (error) {
            showSnackbar("Niet gelukt om welkomscadeau aan te passen.", "error");
        } finally {
            loadingDialog.value = false;
            giftDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeGift = async (gift) => {
    if (gift) {
        loadingDialog.value = true;

        try {
            await giftStore.deleteGift(gift.id);
            showSnackbar("Welkomscadeau succesvol verwijderd!", "success");
            getGifts();
        } catch (error) {
            showSnackbar("Niet gelukt om welkomscadeau te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteGiftDialog.value = false;
        }
    }
};

const showCreateGiftDialog = () => {
    isEditMode.value = false;
    resetGift();
    giftDialog.value = true;
};

const showRemoveGiftDialog = (gift) => {
    giftToDelete.value = gift;
    deleteGiftDialog.value = true;
};

const cancelDelete = () => {
    deleteGiftDialog.value = false;
    giftToDelete.value = null;
};

const confirmDelete = () => {
    removeGift(giftToDelete.value);
};

const showEditGiftDialog = (newGift) => {
    isEditMode.value = true;
    gift.value = { ...newGift };
    giftDialog.value = true;
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
    gift.value.image_url = file.url;
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
    gift.value.image_url = '';
};

const resetGift = () => {
    gift.value = {
        name: '',
        valid_after_months: '',
        image_url: '',
    };
};

const mapMonthsToInteger = (monthString) => {
    const mapping = {
        '3 maanden': 3,
        '12 maanden': 12,
        '24 maanden': 24,
    };
    return mapping[monthString] || 0;
};

const updateOptions = (options) => {
    if (!options.sortBy || options.sortBy.length === 0) {
        sortBy.value = [{ key: 'id', order: 'asc' }];
        getGifts();
        return;
    }

    if (options.sortBy[0].key !== sortBy.value[0].key || options.sortBy[0].order !== sortBy.value[0].order) {
        sortBy.value[0].key = options.sortBy[0].key;
        sortBy.value[0].order = options.sortBy[0].order;
        getGifts();
    } else if (options.page !== page.value || options.itemsPerPage !== itemsPerPage.value) {
        page.value = options.page;
        itemsPerPage.value = options.itemsPerPage;
        getGifts();
    }
};

onMounted(() => {
    getGifts();
});

</script>