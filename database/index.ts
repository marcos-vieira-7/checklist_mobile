//CRUD - Create - Read - Update - Delete

import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native";

export async function createAndUpdateData(key: string, value: string): Promise<boolean | undefined> {
    try {
        await AsyncStorage.setItem(key, value);
        return true;
    } catch (error) {
        Alert.alert("Não foi possível salvar o registro", JSON.stringify(error));
        console.log("Não foi possível salvar o registro", JSON.stringify(error));
    }
}

export async function readData(key: string): Promise<string | null | undefined> {
    try {
        const result = await AsyncStorage.getItem(key);
        return result;
    } catch (error) {
        Alert.alert("Não foi possível obter o registro", JSON.stringify(error));
        console.log("Não foi possível obter o registro", JSON.stringify(error));
    }
}

export async function deleteData(key: string): Promise<boolean | undefined> {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        Alert.alert("Não foi possível deletar o registro", JSON.stringify(error));
        console.log("Não foi possível deletar o registro", JSON.stringify(error));
    }
}