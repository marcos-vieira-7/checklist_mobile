import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, KeyboardAvoidingView } from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { useNetInfo } from '@react-native-community/netinfo';
import { api } from "../utils/axios";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { updateLocalDatabase } from "../services/sync";
import { changePassword, sendRecoverCode } from "../services/recover";

export default function Login() {
    const { isConnected, isInternetReachable } = useNetInfo();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [emailRecuperacao, setEmailRecuperacao] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [codeRecover, setCodeRecover] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [keyboardOpen, setKeyboardOpen] = useState<boolean>(false);

    useEffect(() => {
        if (isConnected === null || isInternetReachable === null) return;
        checkSessionOffline();
    }, [isConnected, isInternetReachable]);

    const checkSessionOffline = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const nomeUsuario = await AsyncStorage.getItem('nomeUsuario');

        const isOffline =
            isConnected === false &&
            isInternetReachable === false;

        if (accessToken && refreshToken && nomeUsuario && isOffline) {
            ToastAndroid.show("Restaurando sessão offline", ToastAndroid.SHORT);
            router.navigate('/menu-categorias');
        }
    };

    const handleLogin = async (user: string, password: string) => {
        try {
            const response = await api.post('auth/login', { login: user, senha: password });
            if (response.status == 200) {

                //Analisando se o usuário tem permissão no aplicativo
                if (response.data.profile.acesso_app) {
                    return response.data;
                }
                else {
                    Alert.alert("Acesso negado", "Você não possui permissão para acessar o aplicativo!");
                    return;
                }
            }
        } catch ({ response }: any) {
            if (response.status == 401) {
                Alert.alert("Usuário ou senha incorretos", "Verifique seu usuário e senha e tente novamente.");
                setLoading(false);
                return false;
            }
            Alert.alert("Erro desconhecido", JSON.stringify(response.data.message));
            console.log("Erro: " + JSON.stringify(response.data));
            return false;
        }
    }

    const handleForgotPassword = () => {
        if (isConnected) {
            setForgotPassword(true);
            return;
        }
        Alert.alert("Atenção", "Você precisa estar online para redefinir a senha!");
    };

    const cancelaForgotPassword = () => {
        setForgotPassword(false);
    };

    const realizarRecuperacaoSenha = async () => {
        if (!emailRecuperacao) {
            Alert.alert("Digite o usuário para realizar a recuperação de senha.");
        }
        //TODO:
        const response = await sendRecoverCode(emailRecuperacao);
        if (!response) {
            Alert.alert("Atenção", "Não foi possível enviar o código de recuperação para o seu e-mail!");
            return;
        }
        if (response) {
            Alert.alert("Sucesso!", "Código enviado para o e-mail");
            setCodeSent(true);
        }
    }

    const handleConfirmPassword = async () => {
        if (newPassword != confirmNewPassword) {
            Alert.alert("As senhas não conferem", "A nova confirmação de senha deve ser igual a nova senha");
            return;
        }
        //TODO:
        const response = await changePassword(emailRecuperacao, codeRecover, newPassword);
        if (response) {
            setCodeSent(false);
            setForgotPassword(false);
            setNewPassword("");
            setConfirmNewPassword("");
            setCodeRecover("");
            if (Platform.OS == 'android') {
                ToastAndroid.show("Senha alterada com sucesso!", ToastAndroid.LONG);
            } else {
                Alert.alert("Senha alterada com sucesso!");
            }
        }
        else {
            Alert.alert("Atenção", "Não foi possível concluir a mudança da senha");
        }
    }

    const realizarLogin = async () => {

        if (!isConnected) {
            Alert.alert("Você está offline", "É preciso estar online para fazer login");
            return;
        }
        //Validar inputs
        if ((!login) || (!password)) {
            Alert.alert("Preencha os campos login e senha para acessar o aplicativo.");
            return;
        }
        setLoading(true);
        if (Platform.OS == 'android') {
            ToastAndroid.show("Conectando ao servidor, aguarde", ToastAndroid.LONG);
        }
        //TODO:
        const response = await handleLogin(login, password);

        if (response && response.accessToken) {
            //Salvar tokens no AsyncStorage
            await AsyncStorage.setItem("accessToken", response.accessToken);
            await AsyncStorage.setItem("refreshToken", response.refreshToken);
            await AsyncStorage.setItem("nomeUsuario", login.toLowerCase());
            console.log("Atualizando banco de dados");
            // await updateDatabase({ filial, centroDeCusto, localDeEstoque, localizacao, equipamento, categoria, produto, accessToken, nomeUsuario, classificacao, funcoes });
            if (Platform.OS == 'android') {
                ToastAndroid.show("Base local atualizada", ToastAndroid.SHORT);
            }

            //Atualizando banco de dados local
            await updateLocalDatabase();

            console.log("Navegando para menu categorias");
            setLoading(false);
            try {
                router.navigate('/menu-principal');
            } catch (error) {
                console.log("Erro ao navegar para menu categorias: " + JSON.stringify(error));
            }

        } else {
            setLoading(false);
            return;
        }
        setLoading(false);
    }

    return (
        <View className="flex-1 w-screen bg-slate-100/80 p-6 justify-center items-center">
            <StatusBar
                translucent={true}
                // hidden
                barStyle={"default"}
                animated={true}
            />
            <Text className="absolute top-10 right-6 text-sm text-slate-600">Versão: {Constants?.expoConfig?.version}</Text>
            <Image
                source={require('../assets/icon.png')} // Caminho da imagem
                className="w-36 h-36 rounded-full" // Tamanho da imagem (ajuste conforme necessário)
                resizeMode="contain" // Ajusta a imagem para caber dentro do container sem cortar
            />
            <Text className="text-2xl text-slate-700 font-bold mb-6">Checklists</Text>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {codeSent ?
                    <View>
                        <Text>Informe o código recebido em seu e-mail e a nova senha:</Text>
                        <Input value={codeRecover} onChangeText={setCodeRecover} placeholder='Código' class="mt-6 mb-6" />
                        <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder='Nova senha' class="mt-6 mb-6" />
                        <Input value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry placeholder='Confirmação da nova senha' class="mt-6 mb-6" />

                        <Button onPress={handleConfirmPassword}><Text className="color-slate-50 font-bold">Alterar Senha</Text></Button>
                    </View>
                    : forgotPassword ?
                        <View>
                            <Text className="text-slate-700 text-lg">Informe o seu e-mail para enviarmos um código de recuperação de senha</Text>
                            <Input value={emailRecuperacao} onChangeText={setEmailRecuperacao} placeholder='E-mail' class="mt-6 mb-6" />

                            <Button onPress={realizarRecuperacaoSenha}><Text className="color-slate-50 font-bold">Enviar código</Text></Button>
                            <Button onPress={cancelaForgotPassword} class="mt-6 bg-red-600"><Text className="color-slate-50 font-bold">Cancelar</Text></Button>
                        </View>
                        :
                        <View className='flex flex-col items-center'>
                            <Input value={login} onChangeText={setLogin} placeholder='nome.sobrenome' class="mt-6 mb-6" autoCapitalize="none" />
                            <Input value={password} onChangeText={setPassword} placeholder='Sua senha' secureTextEntry class="mb-6" autoCapitalize="none" />

                            <Button disabled={loading} onPress={realizarLogin} class="min-w-full"><Text className="color-white font-bold text-lg">{loading ? "Conectando..." : "Acessar"}</Text></Button>

                            <Pressable onPress={handleForgotPassword}>
                                <Text className="mt-20 color-blue-600 text-lg">Esqueceu a senha?</Text>
                            </Pressable>
                        </View>
                }
            </KeyboardAvoidingView>

        </View>
    );
}