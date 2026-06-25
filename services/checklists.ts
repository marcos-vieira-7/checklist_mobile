import { Alert } from "react-native";
import api from "./api";
import { ChecklistProps } from "../types/checklist";
import { logout } from "../utils/logout";

export async function getChecklists(): Promise<ChecklistProps[] | undefined> {
    try {
        const result = await api.get('checklist');
        if (result.status === 200) {
            return result.data;
        }
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter os checklists", JSON.stringify(error));
        console.log(error);
    }
}

export async function sendChecklist(formData: FormData): Promise<boolean | undefined> {
    try {
        await api.post('checklist/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return true;
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        console.log(error.status);
        console.log(error.response);
        Alert.alert("Não foi possível enviar o checklist", JSON.stringify(error));
        console.log(error);
    }
}