import { Alert } from "react-native";
import api from "./api";
import { logout } from "../utils/logout";
import { ReportClienteProps } from "../types/report-cliente";

export async function sendReportCliente(reportClient: ReportClienteProps): Promise<boolean | undefined> {
    try {
        const formData = new FormData();
        // formData.append("uuid", reportClient?.uuid || "");
        formData.append("tipo", reportClient?.tipo || "");
        formData.append("obra", (reportClient?.obra || 0).toString());
        formData.append("responsavel_frente_servico", (reportClient?.responsavel_frente_servico || 0).toString());
        formData.append("tecnico_seguranca_responsavel", (reportClient?.tecnico_seguranca_responsavel || 0).toString());
        formData.append("observacoes", reportClient?.observacoes || "");

        reportClient?.fotos?.forEach((photo) => {
            formData.append("fotos", {
                uri: photo.uri,
                name: photo.name || `report-cliente-${Date.now()}.jpg`,
                type: photo.type || "image/jpeg",
            } as any);
        });

        const result = await api.post('report-cliente/', formData, {
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
        Alert.alert("Não foi possível enviar o report de cliente", JSON.stringify(error));
        console.log(error);
        return false;
    }
}