<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-btn color="primary" @click="showCreateSubscriptionAddOnDialog">Nieuwe abonnement add-on</v-btn>
            </v-card-title>
            <v-data-table-server :headers="headers" :items="tableRows" :items-per-page="itemsPerPage"
                :sort-by="sortBy.key" :sort-desc="sortBy.order" :items-length="totalItems" :loading="loadingDataTable"
                @update:options="updateOptions">
                <template v-slot:item.price="{ item }">
                    €{{ parseFloat(item.price).toFixed(2) }}
                </template>
                <template v-slot:item.image_url="{ item }">
                    <v-img max-width="50" :src="item.image_url"></v-img>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditSubscriptionAddOnDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveSubscriptionAddOnDialog(item)">
                                Verwijder
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table-server>
        </v-card>

        <v-dialog v-model="subscriptionAddOnDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Abonnement add-on bewerken' : 'Nieuwe abonnement add-on toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateSubscriptionAddOn() : createSubscriptionAddOn()">
                        <v-text-field v-model="subscriptionAddOn.name" label="Naam" required></v-text-field>
                        <v-text-field v-model="subscriptionAddOn.description" label="Beschrijving"
                            required></v-text-field>
                        <v-text-field v-model="subscriptionAddOn.price" label="Prijs" type="number" required min="0"
                            step="1"></v-text-field>
                            <DOSpacesUploadComponent @uploaded="handleFileUploaded" @upload-start="handleUploadStart"
                            @upload-finish="handleUploadFinish" @delete-start="handleStartDeleteFile"
                            @file-deleted="handleFileDeleted" @upload-error="handleUploadError"
                            @delete-error="handleRemoveFileError"
                            v-bind="isEditMode ? { file: subscriptionAddOn.image_url } : {}" accepted="image/jpeg,image/png"
                            msg="Upload hier de afbeelding (alleen jpeg en png) die hoort bij deze abonnement add-on (max 5 mb).)"
                            extension="jpeg" folder="subscription-add-ons" :maxSize="5">
                        </DOSpacesUploadComponent>

                        <v-progress-linear v-if="isUploading || isRemovingFile" indeterminate color="blue"
                            class="mb-3"></v-progress-linear>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="subscriptionAddOnDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text
                        @click="isEditMode ? updateSubscriptionAddOn() : createSubscriptionAddOn()"
                        :disabled="!isFormValid || loadingDialog">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteSubscriptionAddOnDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u de abonnement add-on wilt verwijderen?</span>
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
import { useSubscriptionAddOnStore } from '../stores/subscription-add-on.module';

const subscriptionAddOnStore = useSubscriptionAddOnStore();
const subscriptionAddOnDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingDataTable = ref(false);
const isRemovingFile = ref(false);
const uploadError = ref(false);
const loadingDialog = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const subscriptionAddOnToDelete = ref(null);
const deleteSubscriptionAddOnDialog = ref(null);
const search = ref('');
const timeout = ref(null);
const isUploading = ref(false);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Naam", value: "name", sortable: true },
    { title: "Beschrijving", value: "description", sortable: true },
    { title: "Prijs", value: "price", sortable: true },
    { title: "Afbeelding", value: "image_url", sortable: false },
    { title: "Acties", value: "actions", sortable: false },
]);

const subscriptionAddOn = ref({
    name: '',
    description: '',
    price: '',
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
    return subscriptionAddOn.value.name && subscriptionAddOn.value.description && subscriptionAddOn.value.price && subscriptionAddOn.value.image_url;
});

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getSubscriptionAddOns();
    }, 500);
}

const getSubscriptionAddOns = async () => {
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
        subscriptionAddOnStore.subscriptionAddOnData = await subscriptionAddOnStore.getSubscriptionAddOns(params);
        tableRows.value = subscriptionAddOnStore.subscriptionAddOnData.data;
        totalItems.value = subscriptionAddOnStore.subscriptionAddOnData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om abonnement add-ons op te halen.", "error");
    } finally {
        loadingDataTable.value = false;
    }
}

const createSubscriptionAddOn = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await subscriptionAddOnStore.createSubscriptionAddOn(subscriptionAddOn.value);
            showSnackbar("Abonnement add-on succesvol aangemakaakt!", "success");
            getSubscriptionAddOns();
            resetSubscriptionAddOn();
        } catch (error) {
            showSnackbar("Niet gelukt om abonnement add-on aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            subscriptionAddOnDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateSubscriptionAddOn = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await subscriptionAddOnStore.updateSubscriptionAddOn(subscriptionAddOn.value.id, subscriptionAddOn.value);
            showSnackbar("Abonnement add-on succesvol aangepast!", "success");
            getSubscriptionAddOns();
            resetSubscriptionAddOn();
        } catch (error) {
            showSnackbar("Niet gelukt om abonnement add-on aan te passen.", "error");
        } finally {
            loadingDialog.value = false;
            subscriptionAddOnDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeSubscriptionAddOn = async (subscriptionAddOn) => {
    if (subscriptionAddOn) {
        loadingDialog.value = true;

        try {
            await subscriptionAddOnStore.deleteSubscriptionAddOn(subscriptionAddOn.id);
            showSnackbar("Abonnement add-on succesvol verwijderd!", "success");
            getSubscriptionAddOns();
        } catch (error) {
            showSnackbar("Niet gelukt om abonnement add-on te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteSubscriptionAddOnDialog.value = false;
        }
    }
};

const showCreateSubscriptionAddOnDialog = () => {
    isEditMode.value = false;
    resetSubscriptionAddOn();
    subscriptionAddOnDialog.value = true;
};

const cancelDelete = () => {
    deleteSubscriptionAddOnDialog.value = false;
    subscriptionAddOnToDelete.value = null;
};

const confirmDelete = () => {
    removeSubscriptionAddOn(subscriptionAddOnToDelete.value);
};

const showRemoveSubscriptionAddOnDialog = (subscriptionAddOn) => {
    subscriptionAddOnToDelete.value = subscriptionAddOn;
    deleteSubscriptionAddOnDialog.value = true;
};

const showEditSubscriptionAddOnDialog = (newSubscriptionAddOn) => {
    isEditMode.value = true;
    subscriptionAddOn.value = { ...newSubscriptionAddOn };
    subscriptionAddOnDialog.value = true;
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
    subscriptionAddOn.value.image_url = file.url;
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
    subscriptionAddOn.value.image_url = '';
};

const resetSubscriptionAddOn = () => {
    subscriptionAddOn.value = {
        name: '',
        description: '',
        price: '',
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

        getSubscriptionAddOns();
    }
};

onMounted(() => {
    getSubscriptionAddOns();
});

</script>