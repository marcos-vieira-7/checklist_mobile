import { useState, useEffect, useCallback } from "react";
import { ScrollView, StatusBar, View, Text, Pressable, ToastAndroid, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { getRightRefusalOffline, deleteRightRefusalOffline, removeRightRefusalOffline } from "../database/right-refusal";
import { sendRegisterRightRefusal } from "../services/sync";
import { RightRefusalProps } from "../types/right-refusal";
import Button from "./components/Button";

export default function ListDireitoRecusa() {

    const [rightRefusals, setRightRefusals] = useState<RightRefusalProps[]>([]);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const { isConnected } = useNetInfo();
    const novoFormularioDesabilitado = rightRefusals.length > 0 || sincronizando;

    useEffect(() => {
        carregarRightRefusal();
    }, []);

    useFocusEffect(
        useCallback(() => {
            carregarRightRefusal();
        }, [])
    );

    const carregarRightRefusal = async () => {
        // Carregando os direitos de recusa salvos localmente.
        const response = await getRightRefusalOffline();
        setRightRefusals(response || []);
    }

    const handleDelete = async () => {
        // Excluindo todos os direitos de recusa salvos localmente.
        const result = await deleteRightRefusalOffline();
        if (result) {
            ToastAndroid.show("Direito de recusa excluído com sucesso!", ToastAndroid.SHORT);
            carregarRightRefusal();
            return;
        }
    }

    const handleDeleteOne = async (item: RightRefusalProps) => {
        // Removendo um item específico do armazenamento local com base no uuid ou na comparação de objetos.
        const result = await removeRightRefusalOffline(item);
        if (result) {
            ToastAndroid.show("Formulário excluído com sucesso!", ToastAndroid.SHORT);
            carregarRightRefusal();
            return;
        }
    }

    const handleSync = async () => {
        // Sincronizando os direitos de recusa salvos localmente com o servidor. */
        if (rightRefusals.length === 0) return;

        setSincronizando(true);
        const success = await sendRegisterRightRefusal(rightRefusals);
        setSincronizando(false);

        if (success) {
            ToastAndroid.show("Direitos de recusa enviados com sucesso!", ToastAndroid.SHORT);
            carregarRightRefusal();
            return;
        }

        ToastAndroid.show("Não foi possível enviar os direitos de recusa!", ToastAndroid.SHORT);
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-slate-100">
                <ScrollView className="flex-1 bg-slate-100 px-4">
                    <View className="flex-row justify-between items-center mt-6 mb-4">
                        <View>
                            <Text className="text-2xl font-semibold text-slate-700">Direito de Recusa</Text>
                            <Text className="text-sm text-slate-500">Visualize o formulário salvo ou crie um novo.</Text>
                        </View>
                    </View>
                    
                    <View className="flex-row justify-start mb-4 ml-4">
                        <Button
                            onPress={() => router.navigate('/form-direito-recusa')}
                            class="rounded-2xl px-5 py-3"
                        >
                            <Text className="text-white font-bold text-base">Novo Formulário</Text>
                        </Button>
                    </View>

                    {rightRefusals.length > 0 && isConnected &&
                        <Pressable disabled={sincronizando} onPress={handleSync} className={`flex flex-row w-fit justify-start px-4 py-2 rounded-lg bg-blue-200 self-end ml-4 ${sincronizando ? 'opacity-50' : 'opacity-100'}`}>
                            {sincronizando ?
                                <View className="flex flex-row items-center gap-3">
                                    <ActivityIndicator />
                                    <Text className="text-blue-600 font-semibold text-sm">Sincronizando...</Text>
                                </View>
                                :
                                <View className="mr-1 text-blue-600 font-medium text-lg flex flex-row items-center gap-1">
                                    <AntDesign name="sync" size={16} color="#2563eb" />
                                    <Text className="ml-2 text-blue-600 font-medium text-sm">Sincronizar</Text>
                                </View>
                            }
                        </Pressable>
                    }

                    <View className="bg-white border border-gray-200 rounded-2xl p-6 mt-4">
                        {rightRefusals.length > 0 ? (
                            <View className="space-y-3">
                                <Text className="text-lg font-bold text-gray-800">Formulários salvos</Text>
                                {rightRefusals.map((item, index) => (
                                    <View key={item.uuid || `${index}-${item.usuario_nome}`} className="border border-slate-200 rounded-xl p-3">
                                        <Text className="text-base font-semibold text-slate-700">Formulário {index + 1}</Text>
                                        <View className="mb-2 mt-2">
                                            <Text className="text-slate-600 font-semibold">Supervisor</Text>
                                            <Text className="text-slate-800">{item.supervisor_nome}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Empregado</Text>
                                            <Text className="text-slate-800">{item.usuario_nome}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Obra</Text>
                                            <Text className="text-slate-800">{item.obra_descricao}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-slate-600 font-semibold">Descrição</Text>
                                            <Text className="text-slate-800">{item.descricao}</Text>
                                        </View>
                                        <Pressable onPress={() => handleDeleteOne(item)} className="mt-3 self-start">
                                            <Text className="text-red-600 font-semibold">Excluir</Text>
                                        </Pressable>
                                    </View>
                                ))}
                                <Button onPress={() => Alert.alert("Atenção", "Deseja excluir os formulários sem enviar?", [
                                    {
                                        text: "Não"
                                    },
                                    {
                                        text: "Sim",
                                        onPress: () => handleDelete()
                                    }
                                ])} class="bg-transparent pr-0">
                                    <FontAwesome name="trash-o" size={24} color={"#dc2626"} />
                                </Button>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-slate-600 font-semibold">Nenhum formulário salvo localmente.</Text>
                                <Text className="text-slate-500 mt-2">Toque em "Novo formulário" para preencher um direito de recusa.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
