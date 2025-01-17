<template>
    <div>
        <div v-if="state.files.length > 0" class="files">
            <div class="file-item" v-for="(file, index) in state.files" :key="index">
                <span>{{ file.file.name }}</span>
                <span class="delete-file" @click="handleClickDeleteFile(index)">Verwijder</span>
                <span v-if="file.uploadError" class="error">Error uploading file</span>
            </div>
        </div>
        <div v-else class="dropzone" v-bind="getRootProps()">
            <div class="border" :class="{
                isDragActive,
            }">
                <input v-bind="getInputProps()" />
                <p v-if="isDragActive">Drop the files here ...</p>
                <p v-else>{{ msg }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import { useDropzone } from 'vue3-dropzone';
import axios from 'axios';

const state = reactive({
    files: [],
});

const filename = ref(null);
const hostname = ref(null);
const signedUrl = ref(null);

const props = defineProps({
    accepted: {
        type: String,
        default: 'image/jpeg,image/png',
    },
    extension: {
        type: String,
        default: null,
    },
    file: {
        type: String,
        default: null,
    },
    maxSize: {
        type: Number,
        default: 5,
    },
    msg: {
        type: String,
        default: "Upload hier je bestand",
    },
    folder: {
        type: Boolean,
        default: false,
    },
    publicRead: {
        type: Boolean,
        default: false,
    },
});

const { accepted } = props;

const emit = defineEmits(['uploaded', 'upload-start', 'upload-finish', 'upload-error', 'file-removed']);

const { getRootProps, getInputProps, isDragActive, isFileDialogActive, ...rest } = useDropzone({
    onDrop,
    accept: accepted,
    maxFiles: 1,
});

// watch(state, () => {
//     console.log('state', state);
// });

// watch(isDragActive, () => {
//     console.log('isDragActive', isDragActive.value, rest);
// });

// watch(isFileDialogActive, () => {
//     //
// });

watch(() => props.file, (newFile) => {
    if (newFile && !state.files.some(file => file.file.name === newFile)) {
        state.files.push({
            file: { name: newFile },
            uploading: false,
            uploadError: false,
        });
    };

}, { immediate: true });


function onDrop(acceptFiles, rejectReasons) {
    if (acceptFiles.length > 0) {
        emit('upload-start');

        saveFiles(acceptFiles);

        if (rejectReasons.length > 0) {
            alert('Some files were rejected. Only JPG, JPEG, and PNG files are allowed.');
        }

        state.files = acceptFiles.map((file) => ({
            file,
            uploading: true,
            uploadError: false,
        }));
    }
}

async function saveFiles(files) {
    console.log(files[0]);

    const config = {
        headers: {
            "Content-Type": files[0].type,
        },
    };

    axios.put(signedUrl.value, files[0], config)
        .then(response => {
            console.info(response.data);
            state.files[0].uploading = false;
            handleImageUpload(state.files[0].file);
            emit('upload-finish');
        })
        .catch(err => {
            console.error(err);
            state.files[0].uploadError = true;
            emit('upload-error');
        });
}

function handleClickDeleteFile(index) {
    console.log(filename.value);
    axios.delete(`/api/do-spaces/file/${btoa(filename.value)}`)
        .then(response => {
            state.files.splice(index, 1);
        })
        .catch(err => {
            console.error(err);
        });

    emit('file-removed', {});
}

function handleImageUpload(file, response) {
    emit("uploaded", {
        name: filename.value,
        url: hostname.value + "/" + filename.value,
    });
};

function getPresignedUrl() {
    axios.get(
        `/api/do-spaces/upload/request?extension=${props.extension}${props.folder ? "&folder=" + props.folder : ""
        }${props.publicRead ? "&public=true" : ""}`,
    )
        .then(response => {
            filename.value = response.data.filename;
            hostname.value = new URL(response.data.url).origin;
            signedUrl.value = response.data.url;
        });
};

onMounted(() => {
    getPresignedUrl();
});

</script>

<style scoped>
.dropzone,
.files {
    width: 100%;
    margin: 0 auto;
    padding: 10px;
    border-radius: 8px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
        rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    font-size: 12px;
    line-height: 1.5;
}

.border {
    border: 2px dashed #ccc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    transition: all 0.3s ease;
    background: #fff;

    &.isDragActive {
        border: 2px dashed #ffb300;
        background: rgb(255 167 18 / 20%);
    }
}

.file-item {
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgb(255 167 18 / 20%);
    padding: 7px;
    padding-left: 15px;
    margin-top: 10px;

    &:first-child {
        margin-top: 0;
    }

    .delete-file {
        background: red;
        color: #fff;
        padding: 5px 10px;
        border-radius: 8px;
        cursor: pointer;
    }
}
</style>
