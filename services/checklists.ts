import { Alert } from "react-native";
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChecklistProps } from "../types/checklist";

export async function getChecklists(): Promise<ChecklistProps[] | undefined> {
    try {
        const result = await api.get('checklist');
        if (result.status === 200) {
            return result.data;
        }
    } catch (error) {
        Alert.alert("Não foi possível obter os checklists", JSON.stringify(error));
        console.log(error);
    }
}