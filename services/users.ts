import { Alert} from "react-native";
import api from "./api";
import { UserProps } from "../types/user";
import { logout } from "../utils/logout";

export async function getUsers(): Promise<UserProps[] | undefined> {
    try {
        const response = await api.get('users');
        return response.data;
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter os usuários", JSON.stringify(error));
        console.log(error);
    }
}

//below is a function to get user by id
export async function getUserById(id: string): Promise<UserProps | undefined> {
    try {
        const response = await api.get(`users/${id}`);
        return response.data;
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter o usuário", JSON.stringify(error));
        console.log(error);
    }
}