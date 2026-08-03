import { Alert } from "react-native";
import api from "./api";
import { ChecklistProps } from "../types/checklist";
import { logout } from "../utils/logout";


export async function sendRightRefusal(data: any): Promise<boolean | undefined> {
    try {
        await api.post('right-refusal/', data, {
            headers: {
                'Content-Type': 'application/json',
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
        Alert.alert("Não foi possível enviar o direito de recusa", JSON.stringify(error));
        console.log(error);
    }
}


export async function getRightRefusals(): Promise<ChecklistProps[] | undefined> {
    try {
        const result = await api.get('right-refusal/');
        if (result.status === 200) {
            return result.data;
        }
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter os direitos de recusa", JSON.stringify(error));
        console.log(error);
    }
}