import { Alert } from "react-native";
import api from "./api";

export async function sendRecoverCode(mail: string): Promise<boolean | undefined> {
    try {
        const result = await api.post('recover/code', { email_usuario: mail });
        if (result.status === 200) {
            return true;
        }
    } catch (error: any) {
        console.log(JSON.stringify(error));
        Alert.alert('Atenção', 'Não foi possível enviar um código de recuperação de senha');
    }
}

export async function validateCodeRecover(mail: string, code: string): Promise<boolean | undefined> {
    try {
        const result = await api.post('recover/validate', { email_usuario: mail, recoverCode: code });
        if (result.status === 200) {
            return true;
        }
    } catch (error: any) {
        console.log(JSON.stringify(error));
        Alert.alert('Atenção', 'Não foi possível validar o código de recuperação de senha');
    }
}

export async function changePassword(mail: string, code: string, newPassword: string): Promise<boolean | undefined> {
    try {
        const result = await api.post('recover/change', { email_usuario: mail, recoverCode: code, newPassword: newPassword });
        if (result.status === 200) {
            return true;
        }
    } catch (error: any) {
        console.log(JSON.stringify(error));
        Alert.alert('Atenção', 'Não foi possível concluir a recuperação de senha');
    }
}