import { Alert } from "react-native";
import api from "./api";
import { EquipmentProps } from "../types/equipment";
import { logout } from "../utils/logout";

export async function getEquipments(): Promise<EquipmentProps[] | undefined> {
    try {
        const response = await api.get('equipment');
        return response.data;
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter os equipamentos", JSON.stringify(error));
        console.log(error);
    }
}