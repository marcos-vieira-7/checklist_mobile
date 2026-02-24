import axios from 'axios';
const BASEURL = process.env.EXPO_PUBLIC_BASE_URL;

const api = axios.create({
    baseURL: BASEURL, // Sua URL base da API externa
    timeout: 60000, // Tempo limite para as requisições em milissegundos
    headers: {
        'Content-Type': 'application/json',
    },
});

export { api };