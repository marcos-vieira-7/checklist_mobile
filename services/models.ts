import { Alert } from "react-native";
import api from "./api";
import { ModelProps } from "../types/model";

export async function getModels(): Promise<ModelProps[] | undefined> {
    try {
        const result = await api.get('model');
        if (result.status === 200) {
            return result.data;
        }
    } catch (error) {
        Alert.alert("Não foi possível obter os modelos", JSON.stringify(error));
        console.log(error);
    }
}