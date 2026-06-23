import { Alert } from "react-native";
import api from "./api";
import { EquipmentProps } from "../types/equipment";

export async function getEquipments(): Promise<EquipmentProps[] | undefined> {
    try {
        const response = await api.get('equipment');
        return response.data;
    } catch (error: any) {
        Alert.alert("Não foi possível obter os equipamentos", JSON.stringify(error));
        console.log(error);
    }
}