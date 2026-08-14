import { useState, useEffect, useCallback } from "react";
import { ScrollView, StatusBar, View, Text, Pressable, ToastAndroid, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { getUnsafeConditionOffline, deleteUnsafeConditionOffline, removeUnsafeConditionOffline } from "../database/unsafe-condition";
import { sendUnsafeCondition } from "../services/unsafe-condition";
import { UnsafeConditionProps } from "../types/unsafe-condition";
import Button from "./components/Button";

export default function ListCondicaoInsegura() {

    const [unsafeConditions, setUnsafeConditions] = useState<UnsafeConditionProps[]>([]);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const { isConnected } = useNetInfo();

    useFocusEffect(
        useCallback(() => {
            carregarUnsafeConditions();
        }, [])
    );

    const carregarUnsafeConditions = async () => {
        // Carregando os direitos de recusa salvos localmente.
        const response = await getUnsafeConditionOffline();
        setUnsafeConditions(response || []);
    }

    const handleDelete = async () => {
        // Excluindo todos os direitos de recusa salvos localmente.
        const result = await deleteUnsafeConditionOffline();
        if (result) {
            ToastAndroid.show("Form de Condição Insegura excluída com sucesso!", ToastAndroid.SHORT);
            carregarUnsafeConditions();
            return;
        }
    }

    const handleDeleteOne = async (item: UnsafeConditionProps) => {
        // Removendo um item específico do armazenamento local com base no uuid ou na comparação de objetos.
        const result = await removeUnsafeConditionOffline(item);
        if (result) {
            ToastAndroid.show("Formulário excluído com sucesso!", ToastAndroid.SHORT);
            carregarUnsafeConditions();
            return;
        }
    }

    const handleSync = async () => {
        // Sincronizando os formulários salvos localmente com o servidor.
        if (unsafeConditions.length === 0) return;

        setSincronizando(true);

        for (const item of unsafeConditions) {
            const success = await sendUnsafeCondition(item);
            if (!success) {
                setSincronizando(false);
                ToastAndroid.show("Não foi possível enviar o formulário de condição insegura!", ToastAndroid.SHORT);
                return;
            }

            // se enviado com sucesso, remover do armazenamento local
            try {
                await removeUnsafeConditionOffline(item);
            } catch (e) {
                console.log('Erro ao remover item local após envio', e);
            }
        }

        setSincronizando(false);
        ToastAndroid.show("Condições inseguras enviadas com sucesso!", ToastAndroid.SHORT);
        carregarUnsafeConditions();
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-slate-100">
                <ScrollView className="flex-1 bg-slate-100 px-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-2xl font-semibold text-slate-700">Condição Insegura</Text>
                            <Text className="text-sm text-slate-500">Visualize o formulário salvo ou crie um novo.</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-start mb-4 w-full">
                        <Button
                            onPress={() => router.navigate('/form-condicao-insegura')}
                            class="flex flex-row items-center justify-center gap-3 rounded-2xl px-5 py-3 w-full"
                        >
                            <AntDesign name="plus" size={20} color={"white"} />
                            <Text className="text-white font-bold text-lg">Novo Formulário</Text>
                        </Button>
                    </View>

                    {unsafeConditions.length > 0 && isConnected &&
                        <Pressable disabled={sincronizando} onPress={handleSync} className={`flex flex-row w-fit justify-start px-4 py-2 rounded-lg bg-blue-200 self-end ml-4 ${sincronizando ? 'opacity-50' : 'opacity-100'}`}>
                            {sincronizando ? <View className="flex flex-row items-center gap-3"><ActivityIndicator /><Text className="text-blue-600 font-semibold text-lg">Sincronizando...</Text></View> : <View className="mr-1 text-blue-600 font-medium text-lg flex flex-row items-center gap-1"><AntDesign name="sync" size={16} color="#2563eb" /><Text className="ml-2 text-lg text-blue-600 font-medium">Sincronizar tudo</Text></View>}
                        </Pressable>
                    }

                    {unsafeConditions.length > 0 &&
                        <View className="p-4 mt-4">
                            <View className="space-y-3">
                                <Text className="text-lg font-medium text-gray-600 mb-4">Formulários salvos</Text>
                                {unsafeConditions.map((item, index) => (
                                    <Pressable onPress={() =>
                                        router.navigate({
                                            pathname: '/form-condicao-insegura',
                                            params: {
                                                uuid: item.uuid,
                                                unsafeCondition: JSON.stringify(item)
                                            }
                                        })}
                                        key={item.uuid || `${index}-${item.responsavel}`}
                                        className="elevation-md bg-white rounded-xl p-6"
                                    >
                                        <Text className="text-base font-semibold text-slate-700">Formulário {index + 1}</Text>
                                        <View className="mb-2 mt-2">
                                            <Text className="text-slate-600 font-semibold">Testemunha</Text>
                                            <Text className="text-slate-800">{item.testemunha_nome}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Data</Text>
                                            <Text className="text-slate-800">{new Date(item.datetime).toLocaleString("pt-BR")}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Local</Text>
                                            <Text className="text-slate-800">{item.local}</Text>
                                        </View>
                                        <View>
                                            <Text className="text-slate-600 font-semibold">Descrição</Text>
                                            <Text className="text-slate-800">{item.descricao}</Text>
                                        </View>
                                        {
                                            item.fotos && item.fotos?.length > 0 && (
                                                <View className="mb-2 mt-2">
                                                    <Text className="text-slate-600 font-semibold">Fotos</Text>
                                                    <View className="mt-2 flex-row flex-wrap gap-2">
                                                        {item.fotos.map((photo, photoIndex) => (
                                                            <Image key={`${photo.uri}-${photoIndex}`} source={{ uri: photo.uri }} className="h-16 w-16 rounded-lg" />
                                                        ))}
                                                    </View>
                                                </View>
                                            )
                                        }
                                    </Pressable>
                                ))}
                            </View>
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
                    }
                    {unsafeConditions.length == 0 &&
                        <View className="flex flex-col justify-center items-center mt-10">
                            <Text className="text-slate-600 font-semibold">Nenhum formulário salvo localmente.</Text>
                            <Text className="text-slate-500 mt-2 text-sm">Toque em "Novo formulário" para preencher uma condição insegura.</Text>
                        </View>
                    }
                </ScrollView>
            </SafeAreaView>
        </View >
    );
}
