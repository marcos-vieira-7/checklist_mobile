import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import { ToastAndroid } from "react-native";

export async function logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('nomeUsuario');
    ToastAndroid.show("Logout realizado com sucesso!", ToastAndroid.SHORT);
    router.replace('/');
}