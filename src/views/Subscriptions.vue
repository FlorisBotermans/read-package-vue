<template>
    <v-app>
        <v-card class="ma-4">
            <v-card-title>
                <v-text-field v-model="search" label="Zoeken" @input="userInput"></v-text-field>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showCreateSubscriptionDialog">Nieuw abonnement</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="tableRows" :items-per-page="itemsPerPage" :sort-by="sortBy.key"
                :sort-desc="sortBy.order" :server-items-length="totalItems" :loading="loadingSubscriptionsDataTable"
                @update:options="updateSubscriptionOptions">
                <template v-slot:item.actions="{ item }">
                    <v-row dense>
                        <v-col cols="auto">
                            <v-btn text color="warning" @click="showEditSubscriptionDialog(item)">
                                Bewerken
                            </v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn text color="red" @click="showRemoveSubscriptionDialog(item)">
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
                                    <v-list-item @click="showAddPackagesDialog(item)">
                                        <v-list-item-title>Pakketten toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddAdditionalMagazineGroupDialog(item)">
                                        <v-list-item-title>Aanvullende tijdschriften groep toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddEditionChoicesDialog(item)">
                                        <v-list-item-title>Editie keuzes toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddGiftsDialog(item)">
                                        <v-list-item-title>Welkomscadeau's toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddDurationsDialog(item)">
                                        <v-list-item-title>Looptijden toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddDigitalAddOnDialog(item)">
                                        <v-list-item-title>Digitale add-on toevoegen</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item @click="showAddPaperAddOnDialog(item)">
                                        <v-list-item-title>Papieren add-on toevoegen</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card>

        <v-dialog v-model="subscriptionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">{{ isEditMode ? 'Abonnement Bewerken' : 'Nieuw abonnement toevoegen'
                        }}</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDialog" indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form ref="form" v-model="valid"
                        @submit.prevent="isEditMode ? updateSubscription() : createSubscription()">
                        <v-text-field v-model="subscription.type" label="Type" required></v-text-field>
                        <v-text-field v-model="subscription.company" label="Bedrijf" required></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="subscriptionDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="isEditMode ? updateSubscription() : createSubscription()"
                        :disabled="!isFormValid">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="additionalMagazineGroupDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Aanvullende tijdschriften groep toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingAdditionalMagazineGroups || isAddingAdditionalMagazineGroups"
                        indeterminate color="blue" class="mb-3"></v-progress-linear>
                    <v-form v-model="validAdditionalMagazineGroups"
                        @submit.prevent="addAdditionalMagazineGroupToSubscription"
                        v-if="!loadingAdditionalMagazineGroups">

                        <v-data-table :headers="additionalMagazineGroupHeaders"
                            :items="availableAdditionalMagazineGroups" select-strategy="single" show-select
                            v-model="selectedAdditionalMagazineGroup">
                        </v-data-table>

                    </v-form>

                    <v-alert v-if="loadingAdditionalMagazineGroups" class="mt-3">
                        Laden van beschikbare aanvullende tijdschrift groepen...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="additionalMagazineGroupDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addAdditionalMagazineGroupToSubscription"
                        :disabled="!isAdditionalMagazineGroupsFormValid || isAddingAdditionalMagazineGroups || loadingAdditionalMagazineGroups">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="digitalAddOnDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Digitale add-on toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDigitalAddOns || isAddingDigitalAddOns" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>
                    <v-form v-model="validDigitalAddOns" @submit.prevent="addDigitalAddOnToSubscription"
                        v-if="!loadingDigitalAddOns">

                        <v-data-table :headers="addOnHeaders" :items="availableDigitalAddOns" select-strategy="single"
                            show-select v-model="selectedDigitalAddOn">
                        </v-data-table>

                    </v-form>

                    <v-alert v-if="loadingDigitalAddOns" class="mt-3">
                        Laden van beschikbare digitale add-ons...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="digitalAddOnDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addDigitalAddOnToSubscription"
                        :disabled="!isDigitalAddOnsFormValid || isAddingDigitalAddOns || loadingDigitalAddOns">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="paperAddOnDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Papieren add-on toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingPaperAddOns || isAddingPaperAddOns" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>
                    <v-form v-model="validPaperAddOns" @submit.prevent="addPaperAddOnToSubscription"
                        v-if="!loadingPaperAddOns">

                        <v-data-table :headers="addOnHeaders" :items="availablePaperAddOns" select-strategy="single"
                            show-select v-model="selectedPaperAddOn">
                        </v-data-table>

                    </v-form>

                    <v-alert v-if="loadingPaperAddOns" class="mt-3">
                        Laden van beschikbare papieren add-ons...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="paperAddOnDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addPaperAddOnToSubscription"
                        :disabled="!isPaperAddOnsFormValid || isAddingPaperAddOns || loadingPaperAddOns">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="editionChoiceDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Editie keuzes toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingEditionChoices || isAddingEditionChoices" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingEditionChoices" v-model="selectedEditionChoices"
                        :items="availableEditionChoices" item-value="id" item-title="name"
                        label="Voeg editie keuzes toe" multiple chips clearable :disabled="loadingEditionChoices"
                        @update:model-value="onEditionChoiceSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingEditionChoices" color="primary" @click="addSelectedEditionChoicesToTable"
                        :disabled="selectedEditionChoices.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingEditionChoices" :headers="addedEditionChoicesTableHeaders"
                        :items="addedEditionChoices" item-value="id" class="mt-3">
                        <template v-slot:item.additional_price="{ item }">
                            €{{ parseFloat(item.additional_price).toFixed(2) }}
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeEditionChoiceFromSubscription(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingEditionChoices" class="mt-3">
                        Laden van beschikbare editie keuzes...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="editionChoiceDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addEditionChoicesToSubscription"
                        :disabled="isAddingEditionChoices || loadingEditionChoices">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="packageDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Pakketten toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingPackages || isAddingPackages" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingPackages" v-model="selectedPackages" :items="availablePackages"
                        item-value="id" item-title="name" label="Voeg pakketten toe" multiple chips clearable
                        :disabled="loadingPackages" @update:model-value="onPackageSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingPackages" color="primary" @click="addSelectedPackagesToTable"
                        :disabled="selectedPackages.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingPackages" :headers="addedPackagesTableHeaders" :items="addedPackages"
                        item-value="id" class="mt-3">
                        <template v-slot:item.image_url="{ item }">
                            <img :src="item.image_url" style="max-width: 50px;">
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removePackageFromSubscription(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingPackages" class="mt-3">
                        Laden van beschikbare pakketten...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="packageDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addPackagesToSubscription"
                        :disabled="isAddingPackages || loadingPackages">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="durationDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Looptijden toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingDurations || isAddingDurations" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingDurations" v-model="selectedDurations" :items="availableDurations"
                        item-value="id" item-title="amount_of_months" label="Voeg looptijden toe" multiple chips
                        clearable :disabled="loadingDurations"
                        @update:model-value="onDurationSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingDurations" color="primary" @click="addSelectedDurationsToTable"
                        :disabled="selectedDurations.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingDurations" :headers="addedDurationsTableHeaders" :items="addedDurations"
                        item-value="id" class="mt-3">
                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeDurationFromSubscription(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingDurations" class="mt-3">
                        Laden van beschikbare looptijden...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="durationDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addDurationsToSubscription"
                        :disabled="isAddingDurations || loadingDurations">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="giftDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Welkomscadeau's toevoegen aan abonnement</span>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear v-if="loadingGifts || isAddingGifts" indeterminate color="blue"
                        class="mb-3"></v-progress-linear>

                    <v-combobox v-if="!loadingGifts" v-model="selectedGifts" :items="availableGifts" item-value="id"
                        item-title="name" label="Voeg welkomscadeau's toe" multiple chips clearable
                        :disabled="loadingGifts" @update:model-value="onGiftSelectionChange"></v-combobox>

                    <v-btn v-if="!loadingGifts" color="primary" @click="addSelectedGiftsToTable"
                        :disabled="selectedGifts.length === 0">
                        Toevoegen
                    </v-btn>

                    <v-data-table v-if="!loadingGifts" :headers="addedGiftsTableHeaders" :items="addedGifts"
                        item-value="id" class="mt-3" hide-default-footer>
                        <template v-slot:item.image_url="{ item }">
                            <img :src="item.image_url" style="max-width: 50px;">
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-icon color="red" @click="removeGiftFromSubscription(item)">mdi-delete</v-icon>
                        </template>
                    </v-data-table>

                    <v-alert v-if="loadingGifts" class="mt-3">
                        Laden van beschikbare welkomscadeau's...
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="giftDialog = false">Annuleren</v-btn>
                    <v-btn color="blue darken-1" text @click="addGiftsToSubscription"
                        :disabled="isAddingGifts || loadingGifts">Opslaan</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteSubscriptionDialog" max-width="600px">
            <v-card>
                <v-card-title>
                    <span class="headline">Weet u zeker dat u het abonnement wilt verwijderen?</span>
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
import { ref, computed, onMounted } from 'vue';
import { useSubscriptionStore } from '../stores/subscription.module';
import { useAdditionalMagazineGroupStore } from '../stores/additional-magazine-group.module';
import { usePackageStore } from '../stores/package.module';
import { useDurationStore } from '../stores/duration.module';
import { useGiftStore } from '../stores/gift.module';
import { useSimpleEditionChoiceStore } from '../stores/simple-edition-choice.module';
import { useSubscriptionAddOnStore } from '../stores/subscription-add-on.module';
import { useSubscriptionSimpleEditionChoiceStore } from '../stores/subscription-simple-edition-choice.store';
import { useSubscriptionPackageStore } from '../stores/subscription-package.module';
import { useSubscriptionGiftStore } from '../stores/subscription-gift.module';
import { useSubscriptionDurationStore } from '../stores/subscription-duration.module';

const subscriptionStore = useSubscriptionStore();
const additionalMagazineGroupStore = useAdditionalMagazineGroupStore();
const subscriptionAddOnStore = useSubscriptionAddOnStore();
const packageStore = usePackageStore();
const durationStore = useDurationStore();
const giftStore = useGiftStore();
const simpleEditionChoiceStore = useSimpleEditionChoiceStore();
const subscriptionSimpleEditionChoiceStore = useSubscriptionSimpleEditionChoiceStore();
const subscriptionPackageStore = useSubscriptionPackageStore();
const subscriptionGiftStore = useSubscriptionGiftStore();
const subscriptionDurationStore = useSubscriptionDurationStore();

const subscriptionDialog = ref(false);
const isEditMode = ref(false);
const totalItems = ref(0);
const page = ref(1);
const tableRows = ref([]);
const itemsPerPage = ref(10);
const loadingSubscriptionsDataTable = ref(false);
const loadingDialog = ref(false);
const loadingAdditionalMagazineGroups = ref(false);
const loadingDigitalAddOns = ref(false);
const loadingPaperAddOns = ref(false);
const loadingEditionChoices = ref(false);
const loadingPackages = ref(false);
const loadingDurations = ref(false);
const loadingGifts = ref(false);
const sortBy = ref([{ key: 'id', order: 'asc' }]);
const valid = ref(false);
const validAdditionalMagazineGroups = ref(false);
const validDigitalAddOns = ref(false);
const validPaperAddOns = ref(false);
const deleteSubscriptionDialog = ref(null);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const subscriptionToDelete = ref(null);
const addedPackages = ref([]);
const addedEditionChoices = ref([]);
const addedGifts = ref([]);
const addedDurations = ref([]);
const search = ref('');
const timeout = ref(null);

const availableAdditionalMagazineGroups = ref([]);
const selectedAdditionalMagazineGroup = ref([]);
const additionalMagazineGroupDialog = ref(false);
const currentSubscription = ref(null);
const selectedAdditionalMagazineGroupInitial = ref([]);
const isAddingAdditionalMagazineGroups = ref(false);

const availableEditionChoices = ref([]);
const selectedEditionChoices = ref([]);
const editionChoiceDialog = ref(false);
const isAddingEditionChoices = ref(false);

const availablePackages = ref([]);
const selectedPackages = ref([]);
const packageDialog = ref(false);
const isAddingPackages = ref(false);

const availableDurations = ref([]);
const selectedDurations = ref([]);
const durationDialog = ref(false);
const isAddingDurations = ref(false);

const availableGifts = ref([]);
const selectedGifts = ref([]);
const giftDialog = ref(false);
const isAddingGifts = ref(false);

const availableDigitalAddOns = ref([]);
const selectedDigitalAddOn = ref([]);
const digitalAddOnDialog = ref(false);
const selectedDigitalAddOnInitial = ref([]);
const isAddingDigitalAddOns = ref(false);

const availablePaperAddOns = ref([]);
const selectedPaperAddOn = ref([]);
const paperAddOnDialog = ref(false);
const selectedPaperAddOnInitial = ref([]);
const isAddingPaperAddOns = ref(false);

const headers = ref([
    { title: "Id", value: "id", sortable: true },
    { title: "Type", value: "type", sortable: true },
    { title: "Bedrijf", value: "company", sortable: true },
    { title: "Acties", value: "actions", sortable: false },
]);

const additionalMagazineGroupHeaders = ref([
    { title: 'Groep naam', value: 'name' },
]);

const addedPackagesTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Volgorde", value: "order" },
    { title: "Afbeelding", value: "image_url" },
    { title: "Acties", value: "actions", sortable: false },
]);

const addedDurationsTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Aantal maanden", value: "amount_of_months" },
    { title: "Promotie bericht", value: "promotion_message" },
    { title: "Acties", value: "actions", sortable: false },
]);

const addedGiftsTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Geldig bij (maanden)", value: "valid_after_months" },
    { title: "Afbeelding", value: "image_url" },
    { title: "Acties", value: "actions", sortable: false },
]);

const addedEditionChoicesTableHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Extra prijs", value: "additional_price" },
    { title: "Acties", value: "actions", sortable: false },
]);

const addOnHeaders = ref([
    { title: "Id", value: "id" },
    { title: "Naam", value: "name" },
    { title: "Afbeelding", value: "image_url" },
    { title: "Acties", value: "actions", sortable: false },
]);

const subscription = ref({
    type: '',
    company: '',
});

const showSnackbar = (message, color = 'success') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

const hideSnackbar = () => {
    snackbar.value = false;
};

const userInput = () => {
    clearTimeout(timeout.value);
    timeout.value = setTimeout(() => {
        getSubscriptions();
    }, 500);
}

const isFormValid = computed(() => {
    return subscription.value.type && subscription.value.company;
});

const isAdditionalMagazineGroupsFormValid = computed(() => {
    return JSON.stringify(selectedAdditionalMagazineGroup.value) !== JSON.stringify(selectedAdditionalMagazineGroupInitial.value);
});

const isDigitalAddOnsFormValid = computed(() => {
    return JSON.stringify(selectedDigitalAddOn.value) !== JSON.stringify(selectedDigitalAddOnInitial.value);
});

const isPaperAddOnsFormValid = computed(() => {
    return JSON.stringify(selectedPaperAddOn.value) !== JSON.stringify(selectedPaperAddOnInitial.value);
});

const addSelectedPackagesToTable = () => {
    addedPackages.value = addedPackages.value.concat(selectedPackages.value);

    availablePackages.value = availablePackages.value.filter(
        (pkg) => !selectedPackages.value.includes(pkg)
    );

    selectedPackages.value = [];
};

const addSelectedDurationsToTable = () => {
    addedDurations.value = addedDurations.value.concat(selectedDurations.value);

    availableDurations.value = availableDurations.value.filter(
        (duration) => !selectedDurations.value.includes(duration)
    );

    selectedDurations.value = [];
};

const addSelectedEditionChoicesToTable = () => {
    addedEditionChoices.value = addedEditionChoices.value.concat(selectedEditionChoices.value);

    availableEditionChoices.value = availableEditionChoices.value.filter(
        (choice) => !selectedEditionChoices.value.includes(choice)
    );

    selectedEditionChoices.value = [];
}

const addSelectedGiftsToTable = () => {
    addedGifts.value = addedGifts.value.concat(selectedGifts.value);

    availableGifts.value = availableGifts.value.filter(
        (gift) => !selectedGifts.value.includes(gift)
    );

    selectedGifts.value = [];
}

const getSubscriptions = async () => {
    loadingSubscriptionsDataTable.value = true;

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
        subscriptionStore.subscriptionData = await subscriptionStore.getSubscriptions(params);
        tableRows.value = subscriptionStore.subscriptionData.data;
        totalItems.value = subscriptionStore.subscriptionData.meta.pagination.total;
    } catch (error) {
        showSnackbar("Niet gelukt om abonnementen op te halen.", "error");
    } finally {
        loadingSubscriptionsDataTable.value = false;
    }
}

const createSubscription = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await subscriptionStore.createSubscription(subscription.value);
            showSnackbar("Abonnement succesvol aangemakaakt!", "success");
            getSubscriptions();
            resetSubscription();
        } catch (error) {
            showSnackbar("Niet gelukt om abonnement aan te maken.", "error");
        } finally {
            loadingDialog.value = false;
            subscriptionDialog.value = false;
        }

    } else {
        showSnackbar("Onjuiste invoer.", "error");
    };
};

const updateSubscription = async () => {
    if (valid.value) {
        loadingDialog.value = true;

        try {
            await subscriptionStore.updateSubscription(subscription.value.id, subscription.value);
            showSnackbar("Abonnement succesvol aangepast!", "success");
            getSubscriptions();
            resetSubscription();
        } catch (error) {
            showSnackbar("Niet gelukt om abonnement te bewerken.", "error");
        } finally {
            loadingDialog.value = false;
            subscriptionDialog.value = false;
        }
    } else {
        showSnackbar("Onjuiste invoer.", "error");
    }
};

const removeSubscription = async (subscription) => {
    if (subscription) {
        loadingDialog.value = true;

        try {
            await subscriptionStore.deleteSubscription(subscription.id);
            showSnackbar("Abonnement succesvol verwijderd!", "success");
            getSubscriptions();
        } catch (error) {
            showSnackbar("Niet gelukt om abonnement te verwijderen.", "error");
        } finally {
            loadingDialog.value = false;
            deleteSubscriptionDialog.value = false;
        }
    }
};

const addEditionChoicesToSubscription = async () => {
    isAddingEditionChoices.value = true;

    try {
        const editionChoiceIds = addedEditionChoices.value.map(choice => choice.id);

        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            simple_edition_choice_ids: editionChoiceIds,
        });

        showSnackbar("Editie keuzes succesvol bijgewerkt!", "success");
        editionChoiceDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van editie keuzes.", "error");
    } finally {
        isAddingEditionChoices.value = false;
    }
};

const addAdditionalMagazineGroupToSubscription = async () => {
    const groupId = selectedAdditionalMagazineGroup.value?.[0] || null;

    isAddingAdditionalMagazineGroups.value = true;

    try {
        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            additional_magazine_group_id: groupId,
        });

        showSnackbar("Aanvullende tijdschrift groep succesvol bijgewerkt!", "success");
        additionalMagazineGroupDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van aanvullende tijdschrift groep.", "error");
    } finally {
        isAddingAdditionalMagazineGroups.value = false;
    }
};

const addDigitalAddOnToSubscription = async () => {
    const digitalAddOnId = selectedDigitalAddOn.value?.[0] || null;

    isAddingDigitalAddOns.value = true;

    try {
        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            digital_add_on_id: digitalAddOnId,
        });

        showSnackbar("Digitale add-on succesvol bijgewerkt!", "success");
        digitalAddOnDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van digitale add-on.", "error");
    } finally {
        isAddingDigitalAddOns.value = false;
    }
}

const addPaperAddOnToSubscription = async () => {
    const paperAddOnId = selectedPaperAddOn.value?.[0] || null;

    isAddingPaperAddOns.value = true;

    try {
        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            paper_add_on_id: paperAddOnId,
        });

        showSnackbar("Papieren add-on succesvol bijgewerkt!", "success");
        paperAddOnDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van papieren add-on.", "error");
    } finally {
        isAddingPaperAddOns.value = false;
    }
}

const addPackagesToSubscription = async () => {
    isAddingPackages.value = true;

    try {
        const packageIds = addedPackages.value.map(pkg => pkg.id);

        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            package_ids: packageIds,
        });

        showSnackbar("Pakketten succesvol bijgewerkt!", "success");
        packageDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van pakketten.", "error");
    } finally {
        isAddingPackages.value = false;
    }
};

const addDurationsToSubscription = async () => {
    isAddingDurations.value = true;

    try {
        const durationIds = addedDurations.value.map(duration => duration.id);

        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            duration_ids: durationIds,
        });

        showSnackbar("Looptijden succesvol bijgewerkt!", "success");
        durationDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van looptijden.", "error");
    } finally {
        isAddingDurations.value = false;
    }
};

const addGiftsToSubscription = async () => {
    isAddingGifts.value = true;

    try {
        const giftIds = addedGifts.value.map(gift => gift.id);

        await subscriptionStore.updateSubscription(currentSubscription.value.id, {
            gift_ids: giftIds,
        });

        showSnackbar("Welkomscadeau's succesvol bijgewerkt!", "success");
        giftDialog.value = false;
    } catch (error) {
        showSnackbar("Fout bij het bijwerken van welkomscadeau's.", "error");
    } finally {
        isAddingGifts.value = false;
    }
};

const getAdditionalMagazineGroupForSubscription = async (subscriptionId) => {
    try {
        loadingAdditionalMagazineGroups.value = true;

        additionalMagazineGroupStore.additionalMagazineGroupData = await additionalMagazineGroupStore.getAdditionalMagazineGroups();
        availableAdditionalMagazineGroups.value = additionalMagazineGroupStore.additionalMagazineGroupData.data;

        const subscriptionByIdResponse = await subscriptionStore.getSubscription(subscriptionId);

        const additionalMagazineGroupId = subscriptionByIdResponse.additional_magazine_group_id;

        if (additionalMagazineGroupId) {
            selectedAdditionalMagazineGroup.value = [additionalMagazineGroupId]
        } else {
            selectedAdditionalMagazineGroup.value = [];
        }

        selectedAdditionalMagazineGroupInitial.value = selectedAdditionalMagazineGroup.value;

    } catch (error) {
        showSnackbar("Fout bij het ophalen van aanvullende tijdschrift groepen.", "error");
    } finally {
        loadingAdditionalMagazineGroups.value = false;
    }
};

const getDigitalAddOnForSubscription = async (subscriptionId) => {
    try {
        loadingDigitalAddOns.value = true;

        subscriptionAddOnStore.subscriptionAddOnData = await subscriptionAddOnStore.getSubscriptionAddOns();
        availableDigitalAddOns.value = subscriptionAddOnStore.subscriptionAddOnData.data;

        const subscriptionByIdResponse = await subscriptionStore.getSubscription(subscriptionId);

        const digitalAddOnId = subscriptionByIdResponse.digital_add_on_id;

        if (digitalAddOnId) {
            selectedDigitalAddOn.value = [digitalAddOnId];
        } else {
            selectedDigitalAddOn.value = [];
        }

        selectedDigitalAddOnInitial.value = selectedDigitalAddOn.value;
    } catch (error) {
        showSnackbar("Fout bij het ophalen van digitale add ons.", "error");
    } finally {
        loadingDigitalAddOns.value = false;
    }
}

const getPaperAddOnForSubscription = async (subscriptionId) => {
    try {
        loadingPaperAddOns.value = true;

        subscriptionAddOnStore.subscriptionAddOnData = await subscriptionAddOnStore.getSubscriptionAddOns();
        availablePaperAddOns.value = subscriptionAddOnStore.subscriptionAddOnData.data;

        const subscriptionByIdResponse = await subscriptionStore.getSubscription(subscriptionId);

        const paperAddOnId = subscriptionByIdResponse.paper_add_on_id;

        if (paperAddOnId) {
            selectedPaperAddOn.value = [paperAddOnId];
        } else {
            selectedPaperAddOn.value = [];
        }

        selectedPaperAddOnInitial.value = selectedPaperAddOn.value;
    } catch (error) {
        showSnackbar("Fout bij het ophalen van papieren add ons.", "error");
    } finally {
        loadingPaperAddOns.value = false;
    }
}

const getEditionChoicesForSubscription = async (subscriptionId) => {
    try {
        loadingEditionChoices.value = true;

        simpleEditionChoiceStore.simpleEditionChoiceData = await simpleEditionChoiceStore.getSimpleEditionChoices();
        availableEditionChoices.value = simpleEditionChoiceStore.simpleEditionChoiceData.data;

        subscriptionSimpleEditionChoiceStore.subscriptionSimpleEditionChoiceData = await subscriptionSimpleEditionChoiceStore.getSimpleEditionChoicesForSubscription(subscriptionId);
        addedEditionChoices.value = subscriptionSimpleEditionChoiceStore.subscriptionSimpleEditionChoiceData;

        availableEditionChoices.value = availableEditionChoices.value.filter(
            choice => !addedEditionChoices.value.some(added => added.id === choice.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van editie keuzes.", "error");
    } finally {
        loadingEditionChoices.value = false;
    }
}

const getPackagesForSubscription = async (subscriptionId) => {
    try {
        loadingPackages.value = true;

        packageStore.packageData = await packageStore.getPackages();
        availablePackages.value = packageStore.packageData.data;

        subscriptionPackageStore.subscriptionPackageData = await subscriptionPackageStore.getPackagesForSubscription(subscriptionId);
        addedPackages.value = subscriptionPackageStore.subscriptionPackageData;

        availablePackages.value = availablePackages.value.filter(
            pkg => !addedPackages.value.some(added => added.id === pkg.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van pakketten.", "error");
    } finally {
        loadingPackages.value = false;
    }
}

const getGiftsForSubscription = async (subscriptionId) => {
    try {
        loadingGifts.value = true;

        giftStore.giftData = await giftStore.getGifts();
        availableGifts.value = giftStore.giftData.data;

        subscriptionGiftStore.subscriptionGiftData = await subscriptionGiftStore.getGiftsForSubscription(subscriptionId);
        addedGifts.value = subscriptionGiftStore.subscriptionGiftData;

        availableGifts.value = availableGifts.value.filter(
            gift => !addedGifts.value.some(added => added.id === gift.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van welkomscadeau's.", "error");
    } finally {
        loadingGifts.value = false;
    }
};

const getDurationsForSubscription = async (subscriptionId) => {
    try {
        loadingDurations.value = true;

        durationStore.durationData = await durationStore.getDurations();
        availableDurations.value = durationStore.durationData.data;

        subscriptionDurationStore.subscriptionDurationData = await subscriptionDurationStore.getDurationsForSubscription(subscriptionId);
        addedDurations.value = subscriptionDurationStore.subscriptionDurationData;

        availableDurations.value = availableDurations.value.filter(
            duration => !addedDurations.value.some(added => added.id === duration.id)
        );
    } catch (error) {
        showSnackbar("Fout bij het ophalen van looptijden.", "error");
    } finally {
        loadingDurations.value = false;
    }
}

const onPackageSelectionChange = () => {
    availablePackages.value = availablePackages.value.filter(
        pkg => !selectedPackages.value.includes(pkg.id)
    );

    const newSelectedPackages = selectedPackages.value.filter(
        selectedPackage => !addedPackages.value.some(added => added.id === selectedPackage.id)
    );

    console.log(newSelectedPackages);
};

const onDurationSelectionChange = () => {
    availableDurations.value = availableDurations.value.filter(
        duration => !selectedDurations.value.includes(duration.id)
    );

    const newSelectedDurations = selectedDurations.value.filter(
        selectedDuration => !addedDurations.value.some(added => added.id === selectedDuration.id)
    );

    console.log(newSelectedDurations);
}

const onEditionChoiceSelectionChange = () => {
    availableEditionChoices.value = availableEditionChoices.value.filter(
        choice => !selectedEditionChoices.value.includes(choice.id)
    );

    const newSelectedEditionChoices = selectedEditionChoices.value.filter(
        selectedChoice => !addedEditionChoices.value.some(added => added.id === selectedChoice.id)
    );

    console.log(newSelectedEditionChoices);
};

const onGiftSelectionChange = () => {
    availableGifts.value = availableGifts.value.filter(
        gift => !selectedGifts.value.includes(gift.id)
    );

    const newSelectedGifts = selectedGifts.value.filter(
        selectedGift => !addedGifts.value.some(added => added.id === selectedGift.id)
    );

    console.log(newSelectedGifts);
};

const removePackageFromSubscription = (pkg) => {
    addedPackages.value = addedPackages.value.filter(addedPackage => addedPackage.id !== pkg.id);

    availablePackages.value.push(pkg);
};

const removeEditionChoiceFromSubscription = (editionChoice) => {
    addedEditionChoices.value = addedEditionChoices.value.filter(addedChoice => addedChoice.id !== editionChoice.id);

    availableEditionChoices.value.push(editionChoice);
};

const removeGiftFromSubscription = (gift) => {
    addedGifts.value = addedGifts.value.filter(addedGift => addedGift.id !== gift.id);

    availableGifts.value.push(gift);
};

const removeDurationFromSubscription = (duration) => {
    addedDurations.value = addedDurations.value.filter(addedDuration => addedDuration.id !== duration.id);

    availableDurations.value.push(duration);
}

const showAddAdditionalMagazineGroupDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedAdditionalMagazineGroup.value = null;
    additionalMagazineGroupDialog.value = true;
    getAdditionalMagazineGroupForSubscription(subscription.id);
};

const showAddEditionChoicesDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedEditionChoices.value = [];
    editionChoiceDialog.value = true;
    getEditionChoicesForSubscription(subscription.id);
};

const showAddPackagesDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedPackages.value = [];
    packageDialog.value = true;
    getPackagesForSubscription(subscription.id);
};

const showAddDurationsDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedDurations.value = [];
    durationDialog.value = true;
    getDurationsForSubscription(subscription.id);
}

const showAddGiftsDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedGifts.value = [];
    giftDialog.value = true;
    getGiftsForSubscription(subscription.id);
};

const showAddDigitalAddOnDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedDigitalAddOn.value = null;
    digitalAddOnDialog.value = true;
    getDigitalAddOnForSubscription(subscription.id);
};

const showAddPaperAddOnDialog = (subscription) => {
    currentSubscription.value = subscription;
    selectedPaperAddOn.value = null;
    paperAddOnDialog.value = true;
    getPaperAddOnForSubscription(subscription.id);
};

const showRemoveSubscriptionDialog = (subscription) => {
    subscriptionToDelete.value = subscription;
    deleteSubscriptionDialog.value = true;
};

const cancelDelete = () => {
    deleteSubscriptionDialog.value = false;
    subscriptionToDelete.value = null;
};

const confirmDelete = () => {
    removeSubscription(subscriptionToDelete.value);
};

const showCreateSubscriptionDialog = () => {
    isEditMode.value = false;
    resetSubscription();
    subscriptionDialog.value = true;
};

const showEditSubscriptionDialog = (newSubscription) => {
    isEditMode.value = true;
    subscription.value = { ...newSubscription };
    subscriptionDialog.value = true;
};

const resetSubscription = () => {
    subscription.value = {
        type: '',
        company: '',
    };
};

const updateSubscriptionOptions = (options) => {
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

        getSubscriptions();
    }
};

onMounted(() => {
    getSubscriptions();
});

</script>