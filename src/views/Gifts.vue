<template>
    <v-app>
        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="showCreateGiftDialog">Nieuw welkomscadeau</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loading"
                @update:options="updateOptions">
                <template v-slot:item.image_url="{ item }">
                    <v-img max-width="75"
                        :src="'https://read-package-floris-dev.ams3.digitaloceanspaces.com/' + item.image_url"></v-img>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-icon color="warning" @click="showEditGiftDialog(item)">mdi-pencil</v-icon>
                    <v-icon color="red" @click="removeGiftPrompt(item)">mdi-delete</v-icon>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="giftDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Welkomscadeau Bewerken' : 'Nieuw welkomscadeau toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid" @submit.prevent="isEditMode ? updateGift() : createGift()">
                        <v-textarea v-model="gift.name" label="Naam" required></v-textarea>
                        <v-select v-model="gift.valid_after_months" :items="['3 maanden', '12 maanden', '24 maanden']"
                            label="Geldig bij" required></v-select>
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
                    <v-btn color="blue darken-1" text @click="giftDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateGift() : createGift()"
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarMessage }}
            <template v-slot:action>
                <v-btn color="white" @click="hideSnackbar">Close</v-btn>
                <v-btn color="red" @click="confirmRemoveGift">Ja</v-btn>
                <v-btn color="grey" @click="hideSnackbar">Nee</v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>
<script setup>
import DOSpacesUploadComponent from '@/components/DOSpacesUploadComponent.vue';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';

const giftDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loading = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const isUploading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const giftToDelete = ref(null);

const headers = ref([
    { text: "Id", value: "id", sortable: true },
    { text: "Naam", value: "name", sortable: true },
    { text: "Geldig bij", value: "valid_after_months", sortable: true },
    { text: "Image", value: "image_url", sortable: false },
    { text: "Acties", value: "actions", sortable: false }
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

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const isFormValid = computed(() => {
    return gift.value.name && gift.value.valid_after_months && gift.value.image_url;
});

const getGifts = async () => {
    loading.value = true;

    const params = {
        page: page.value,
        sort_by: sortBy.value[0].key,
        sort_dir: sortBy.value[0].order,
    };

    axios.get('/api/gifts', { params })
        .then(response => {
            tableRows.value = response.data.data;
            console.log(tableRows.value);
            totalItems.value = response.data.meta.pagination.total;
        })
        .catch(error => {
            // toast.error("Niet gelukt om welkomscadeaus op te halen.", { duration: 2500 });
        })
        .finally(() => {
            loading.value = false;
        });
}

const createGift = async () => {
    if (valid.value) {
        loading.value = true;

        gift.value.valid_after_months = mapMonthsToInteger(gift.value.valid_after_months);

        axios.post('/api/gifts', gift.value)
            .then(response => {
                // this.$toasted.success("Welkomscadeau succesvol aangemaakt!", { duration: 2500 });
                showSnackbar("Welkomscadeau succesvol aangemakaakt!", "success");
                getGifts();
                giftDialog.value = false;
                resetGift();
            })
            .catch(error => {
                // this.$toasted.error("Niet gelukt om welkomscadeau aan te maken.", { duration: 2500 });
            })
            .finally(() => {
                loading.value = false;
            })
    } else {
        // this.$toasted.error("Onjuiste invoer.", { duration: 2500 });
    }
};

const updateGift = async () => {
    if (valid.value) {
        loading.value = true;

        axios.put(`/api/gifts/${gift.value.id}`, gift.value)
            .then(response => {
                // this.$toasted.success("Welkomscadeau succesvol aangemaakt!", { duration: 2500 });
                getGifts();
                giftDialog.value = false;
                resetGift();
            })
            .catch(error => {
                // this.$toasted.error("Niet gelukt om welkomscadeau aan te maken.", { duration: 2500 });
            })
            .finally(() => {
                loading.value = false;
            })
    } else {
        // this.$toasted.error("Onjuiste invoer.", { duration: 2500 });
    }
};

const removeGift = async () => {
    if (giftToDelete.value) {
        loading.value = true;
        const indexOf = tableRows.value.indexOf(giftToDelete.value);

        axios.delete(`/api/gifts/${giftToDelete.value.id}`)
            .then(response => {
                if (indexOf > -1) {
                    tableRows.value.splice(indexOf, 1);
                    totalItems.value -= 1;
                }
                getGifts();
                showSnackbar("Welkomscadeau succesvol verwijderd!", "success");
            })
            .catch(error => {
                showSnackbar("Niet gelukt om welkomscadeau te verwijderen.", "error");
            })
            .finally(() => {
                loading.value = false;
                giftToDelete.value = null;
                hideSnackbar();
            });
    }
};

const removeGiftPrompt = (gift) => {
    giftToDelete.value = gift;
    snackbarMessage.value = "Weet u zeker dat u het welkomscadeau wilt verwijderen?";
    snackbarColor.value = 'warning';
    snackbar.value = true;
};

const confirmRemoveGift = () => {
    removeGift();
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
    gift.value.image_url = file.name;
};

const handleFileRemoved = () => {
    gift.value.image_url = '';
}

const showCreateGiftDialog = () => {
    isEditMode.value = false;
    resetGift();
    giftDialog.value = true;
};

const showEditGiftDialog = (newGift) => {
    isEditMode.value = true;
    gift.value = { ...newGift };
    // filenam.value = gift.value.image_url || '';
    giftDialog.value = true;
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