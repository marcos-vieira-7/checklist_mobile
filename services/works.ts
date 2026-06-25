import { Alert } from "react-native";
import { WorkProps } from "../types/work";
import api from "./api";
import { logout } from "../utils/logout";

export async function getAllWorks(): Promise<WorkProps[] | undefined> {
    try {
        const response = await api.get('work');
        if (response.status === 200) {
            return response.data;
        }
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Ocorreu um erro ao tentar baixar as obras", JSON.stringify(error))
        console.error('Erro ao obter obras', error);
    }
}