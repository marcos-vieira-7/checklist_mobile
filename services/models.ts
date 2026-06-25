import { Alert } from "react-native";
import api from "./api";
import { ModelProps } from "../types/model";
import { logout } from "../utils/logout";

export async function getModels(): Promise<ModelProps[] | undefined> {
    try {
        const result = await api.get('model');
        if (result.status === 200) {
            return result.data;
        }
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter os modelos", JSON.stringify(error));
        console.log(error);
    }
}