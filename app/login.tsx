import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button"; 
import { useNetInfo } from '@react-native-community/netinfo';
import { api } from "../utils/axios";
import { router, useLocalSearchParams } from "expo-router";


export default function Login() {

    const { isConnected } = useNetInfo();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [emailRecuperacao, setEmailRecuperacao] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [codeRecover, setCodeRecover] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (user: string, password: string) => {
        try {
            console.log("Realizando login Before");
            const response = await api.post('login', { login: user, password: password });
            console.log("Realiza login AFTER");
            if (response.status == 200) {
                return response.data;
            }
        } catch ({ response }: any) {
            if (response.status == 401) {
                Alert.alert("Senha Incorreta", response.data.message);
                return false;
            }
            Alert.alert("Erro desconhecido", JSON.stringify(response.data.message));
            console.log("Erro: " + response.data);
            return false;
        }
    }

    const handleForgotPassword = () => {
        setForgotPassword(true);
    };

    const cancelaForgotPassword = () => {
        setForgotPassword(false);
    };

    // const realizarRecuperacaoSenha = async () => {
    //     if (!emailRecuperacao) {
    //         Alert.alert("Digite o usuário para realizar a recuperação de senha.");
    //     }

    //     const response = await recoverPassword(emailRecuperacao);

    //     if (!response) {
    //         Alert.alert("Falha ao recuperar senha", "Consulte o log do aplicativo para mais informações");
    //         return;
    //     }
    //     if (response) {
    //         console.log("Código enviado para o e-mail");
    //         setCodeSent(true);
    //     }
    // }

    // const checkSession = async () => {
    //     const token = await getSession("token");

    //     //Verificando se existem atualizações disponíveis para Android
    //     if (Platform.OS == 'android') {
    //         const updateAvailable = await checkUpdates();
    //         // if (updateAvailable && sugeriuAtualizacao != 'sim') {
    //         if (updateAvailable) {
    //             router.navigate({ pathname: '/update', params: { autenticado: token } });
    //             return;
    //         }
    //     }
    //     if (token) {
    //         router.navigate("/modulos/checklist");
    //     }
    // }

    // const handleConfirmPassword = async () => {
    //     if (newPassword != confirmNewPassword) {
    //         Alert.alert("As senhas não conferem", "A nova confirmação de senha deve ser igual a nova senha");
    //         return;
    //     }
    //     const response = await resetPassword(codeRecover, newPassword, confirmNewPassword);
    //     if (response) {
    //         setCodeSent(false);
    //         setForgotPassword(false);
    //         setNewPassword("");
    //         setConfirmNewPassword("");
    //         setCodeRecover("");
    //         if (Platform.OS == 'android') {
    //             ToastAndroid.show("Senha alterada com sucesso!", ToastAndroid.LONG);
    //         }
    //     }
    // }

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
        // const { access_token } = await handleLogin(login, password);
        const access_token = "1234567890";
        if (access_token) {
            console.log("Atualizando banco de dados");
            // await updateDatabase({ filial, centroDeCusto, localDeEstoque, localizacao, equipamento, categoria, produto, access_token, nomeUsuario, classificacao, funcoes });
            if (Platform.OS == 'android') {
                ToastAndroid.show("Base local atualizada", ToastAndroid.SHORT);
            }
            console.log("Navegando para menu categorias");
            try {
                router.navigate('/menu-categorias');
            } catch (error) {
                console.log("Erro ao navegar para menu categorias: " + error);
            }
            
        } else {
            setLoading(false);
            return;
        }
        setLoading(false);
    }

    return (
        <View className="flex-1 w-screen p-6 justify-center items-center">
            <StatusBar
                translucent={true}
                // hidden
                animated={true}
            />

            <Image
                source={require('../assets/images/almox.jpeg')} // Caminho da imagem
                className="w-32 h-32 mb-5 rounded-full" // Tamanho da imagem (ajuste conforme necessário)
                resizeMode="contain" // Ajusta a imagem para caber dentro do container sem cortar
            />

        {/* {codeSent ? */}
            {/* <View>
                <Text>Informe o código recebido em seu e-mail e a nova senha:</Text>
                <Input value={codeRecover} onChangeText={setCodeRecover} placeholder='Código' class="mt-6 mb-6" />
                <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder='Nova senha' class="mt-6 mb-6" />
                <Input value={confirmNewPassword} onChangeText={setConfirmNewPassword} secureTextEntry placeholder='Confirmação da nova senha' class="mt-6 mb-6" />

                <Button onPress={handleConfirmPassword}><Text className="color-slate-50 font-bold">Alterar Senha</Text></Button>
            </View> */}
            {/* : forgotPassword ?
                <View>
                    <Text>Digite seu usuário para recuperação de senha:</Text>
                    <Input value={emailRecuperacao} onChangeText={setEmailRecuperacao} placeholder='Usuário' class="mt-6 mb-6" />

                    <Button onPress={realizarRecuperacaoSenha}><Text className="color-slate-50 font-bold">Enviar código</Text></Button>
                    <Button onPress={cancelaForgotPassword} class="mt-6 bg-red-600"><Text className="color-slate-50 font-bold">Cancelar</Text></Button>
                </View>
                : */}
                <View className='flex flex-col items-center'>
                    <Input value={login} onChangeText={setLogin} placeholder='Login' class="mt-6 mb-6" />
                    <Input value={password} onChangeText={setPassword} placeholder='Senha' secureTextEntry class="mb-6" />

                    <Button disabled={loading} onPress={realizarLogin}><Text className="color-white font-bold">{loading ? "Conectando..." : "Acessar"}</Text></Button>

                    <Pressable onPress={handleForgotPassword}>
                        <Text className="mt-20 color-blue-500">Esqueceu a senha?</Text>
                    </Pressable>
                </View>
        {/* } */}
        <Text className="absolute bottom-2">Versão: 0.00</Text>
        </View>
    );
}