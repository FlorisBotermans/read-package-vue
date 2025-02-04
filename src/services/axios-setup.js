import axios from 'axios';
import authHeader from './auth-header';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

axiosInstance.interceptors.request.use(
    (config) => {
        // List of routes that should not have authentication headers
        const excludedRoutes = [
            "/api/do-spaces/upload/request",
            "/api/do-spaces/file/"
        ];

        // Check if the request URL should be excluded
        const isExcluded = excludedRoutes.some(route => config.url.startsWith(route)) ||
            config.url.includes("digitaloceanspaces.com");

        if (!isExcluded) {
            config.headers = { ...config.headers, ...authHeader() };
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;