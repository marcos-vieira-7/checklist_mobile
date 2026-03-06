import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
});
// Interceptador para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;



