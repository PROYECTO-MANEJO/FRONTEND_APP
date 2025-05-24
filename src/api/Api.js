import axios from "axios";
import { getEnvironments } from "../helpers/getEnvironments";

const { DATABASE_URL } = getEnvironments();

export const api = axios.create({
    baseURL: DATABASE_URL,
});

api.interceptors.request.use(config => {
    config.headers = {
        ...config.headers,
        'x-token': sessionStorage.getItem('token'),
    }
    return config;
});

