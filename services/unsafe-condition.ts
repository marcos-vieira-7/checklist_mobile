import { Alert } from "react-native";
import api from "./api";
import { logout } from "../utils/logout";
import { UnsafeConditionProps } from "../types/unsafe-condition";


export async function sendUnsafeCondition(unsafeCondition: UnsafeConditionProps): Promise<boolean | undefined> {
    try {
        const formData = new FormData();

        formData.append("uuid", unsafeCondition?.uuid || "");
        formData.append("responsavel", unsafeCondition?.responsavel || "");
        formData.append("testemunha", (unsafeCondition?.testemunha || "").toString());
        formData.append("datetime", unsafeCondition?.datetime || "");
        formData.append("local", unsafeCondition?.local || "");
        formData.append("descricao", unsafeCondition?.descricao || "");

        unsafeCondition?.fotos?.forEach((photo:any) => {
            formData.append("fotos", {
                uri: photo.uri,
                name: photo.name || `unsafe-condition-${Date.now()}.jpg`,
                type: photo.type || "image/jpeg",
            } as any);
        });

        const result = await api.post('unsafe-condition/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return result.status === 201 || result.status === 200;
    } catch (error: any) {
        if (error.status == 401) {
            Alert.alert("Atenção", "Sessão expirada, faça login novamente!");
            logout();
        }
        console.log(error.status);
        console.log(error.response);
        Alert.alert("Não foi possível enviar o formulário de condição insegura", JSON.stringify(error));
        console.log(error);
        return false;
    }
}