import { Alert } from "react-native";
import { CategoryProps } from "../types/category";
import api from "./api";

export async function getCategories(): Promise<CategoryProps[] | undefined> {
    try {
        const response = await api.get('category');
        return response.data;
    } catch (error: any) {
        Alert.alert("Não foi possível obter as categorias", JSON.stringify(error));
        console.log(error);
    }
}