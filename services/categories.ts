import { Alert } from "react-native";
import { CategoryProps } from "../types/category";
import api from "./api";
import { logout } from "../utils/logout";

export async function getCategories(): Promise<CategoryProps[] | undefined> {
    try {
        const response = await api.get('category');
        return response.data;
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        Alert.alert("Não foi possível obter as categorias", JSON.stringify(error));
        console.log(error);
    }
}