import { Alert } from "react-native";
import { WorkProps } from "../types/work";
import api from "./api";

export async function getAllWorks(): Promise<WorkProps[] | undefined> {
    try {
        const response = await api.get('work');
        if (response.status === 200) {
            return response.data;
        }
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Não foi possível obter as categorias", JSON.stringify(error));
            console.log(error);
        }
        console.error('Erro ao obter obras', error);
    }
}