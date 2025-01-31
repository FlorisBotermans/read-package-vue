<template>
    <v-container fluid class="pa-0 ma-0">
        <!-- File List Card -->
        <v-card v-if="files.length > 0" class="files-card">
            <v-list>
                <v-list-item v-for="(file, index) in files" :key="index" class="file-item">
                    <v-img v-if="file.preview" :src="file.preview" max-width="48" max-height="48"
                        class="file-thumbnail" />
                    <v-list-item-content>
                        <v-list-item-subtitle v-if="file.uploadError" class="error-text">
                            ⚠ Error uploading file
                        </v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-btn icon color="error" variant="text" @click="handleClickDeleteFile(index)">
                            <v-icon>mdi-close-circle</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>

        <div v-else class="dropzone" v-bind="getRootProps()">
            <v-sheet class="dropzone-sheet">
                <input v-bind="getInputProps()" />
                <v-icon size="48" color="primary">mdi-cloud-upload</v-icon>
                <p class="dropzone-text">{{ isDragActive ? 'Drop files here...' : msg }}</p>
            </v-sheet>
        </div>
    </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useDropzone } from 'vue3-dropzone';
import axios from '../services/axios-setup';

const files = ref([]);
const filename = ref(null);
const hostname = ref(null);
const signedUrl = ref(null);

const props = defineProps({
    accepted: { type: String, default: 'image/jpeg,image/png' },
    extension: { type: String, default: null },
    file: { type: String, default: null },
    maxSize: { type: Number, default: 5 },
    msg: { type: String, default: 'Upload hier je bestand' },
    folder: { type: String, default: 'uploads' },
    publicRead: { type: Boolean, default: false },
});

const emit = defineEmits(['uploaded', 'upload-start', 'upload-finish', 'upload-error', 'file-removed', 'delete-start', 'file-deleted']);

const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: props.accepted,
    maxFiles: 1,
    maxSize: props.maxSize * 1024 * 1024,
});

async function getPresignedUrl() {
    try {
        const response = await axios.get(`/api/do-spaces/upload/request`, {
            params: { extension: props.extension, folder: props.folder },
        });
        filename.value = response.data.filename;
        hostname.value = new URL(response.data.url).origin;
        signedUrl.value = response.data.url;
    } catch (error) {
        console.error(error);
    }
}

function onDrop(acceptedFiles, rejectReasons) {
    if (rejectReasons.length > 0) {
        emit('upload-error');
        return;
    }

    emit('upload-start');
    const file = acceptedFiles[0];
    files.value = [{ file, preview: URL.createObjectURL(file), uploading: true, uploadError: false }];
    getPresignedUrl().then(() => saveFile(file));
}

async function saveFile(file) {
    try {
        await axios.put(signedUrl.value, file, {
            headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
        });
        files.value[0] = {
            file: `${hostname.value}/${filename.value}`,
            preview: `${hostname.value}/${filename.value}`,
            uploading: false,
            uploadError: false,
        };
        emit('uploaded', { name: filename.value, url: files.value[0].file });
        emit('upload-finish');
    } catch (error) {
        console.error('Upload error:', error);
        files.value[0].uploadError = true;
        emit('upload-error');
    }
}

function handleClickDeleteFile(index) {
    emit('delete-start');

    const fileToDelete = files.value[index].file;
    const url = new URL(fileToDelete);
    const pathToDelete = url.pathname.substring(1);

    const encodedFileName = btoa(pathToDelete);
    axios.delete(`/api/do-spaces/file/${encodedFileName}`)
        .then(() => {
            files.value.splice(index, 1);
            emit('file-deleted');
        })
        .catch(() => emit('delete-error'));
}

watch(() => props.file, (newFile) => {
    if (newFile && !files.value.some(f => f.file === newFile)) {
        files.value = [{ file: newFile, preview: newFile, uploading: false, uploadError: false }];
    }
}, { immediate: true });
</script>

<style scoped>
.v-container {
    width: 100%;
    max-width: 100%;
}

.files-card {
    width: 100%;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f1f1f1;
    transition: background 0.3s ease-in-out;
}

.file-item:hover {
    background: rgba(0, 0, 0, 0.05);
}

.file-thumbnail {
    border-radius: 8px;
    margin-right: 16px;
    object-fit: cover;
}

.file-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.error-text {
    color: #d32f2f;
    font-size: 14px;
    margin-top: 4px;
}

.dropzone {
    width: 100%;
    margin: 0;
    padding: 0;
}

.dropzone-sheet {
    border: 2px dashed #bbb;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    transition: 0.3s;
    width: 100%;
    background: #f9fafb;
}

.dropzone-sheet:hover {
    border-color: #1976d2;
    background-color: rgba(25, 118, 210, 0.05);
}

.dropzone-text {
    font-size: 18px;
    font-weight: 500;
    color: #555;
    margin-top: 8px;
    text-align: center;
}
</style>