import { useState, useCallback } from "react";
import { ScrollView, StatusBar, View, Text, Pressable, ToastAndroid, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import Button from "./components/Button";
import { ReportClienteProps } from "../types/report-cliente";
import { deleteReportClientOffline, getReportClientOffline, removeReportClientOffline } from "../database/report-cliente";
import { sendReportCliente } from "../services/report-cliente";
import { UserProps } from "../types/user";
import { getUsersOffline } from "../database/users";
import { WorkProps } from "../types/work";
import { getWorksOffline } from "../database/works";

export default function ListReportCliente() {

    const [reportClientes, setReportClientes] = useState<ReportClienteProps[]>([]);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const [users, setUsers] = useState<UserProps[]>([]);
    const [works, setWorks] = useState<WorkProps[]>([]);
    const { isConnected } = useNetInfo();

    useFocusEffect(
        useCallback(() => {
            carregarReportClient();
            handleGetUsers();
            handleGetWorks();
        }, [])
    );

    const carregarReportClient = async () => {
        const response = await getReportClientOffline();
        setReportClientes(response || []);
    }

    const handleDelete = async () => {
        const result = await deleteReportClientOffline();
        if (result) {
            ToastAndroid.show("Report cliente excluído com sucesso!", ToastAndroid.SHORT);
            carregarReportClient();
            return;
        }
    }

    const handleDeleteOne = async (item: ReportClienteProps) => {
        const result = await removeReportClientOffline(item);
        if (result) {
            ToastAndroid.show("Formulário excluído com sucesso!", ToastAndroid.SHORT);
            carregarReportClient();
            return;
        }
    }

    const handleSync = async () => {
        if (reportClientes.length === 0) return;

        setSincronizando(true);

        try {
            let error = false;
            const itemsToSync = [...reportClientes];

            for (const reportCliente of itemsToSync) {
                const success = await sendReportCliente(reportCliente);
                if (success) {
                    const removed = await removeReportClientOffline(reportCliente);
                    if (!removed) {
                        error = true;
                    }
                } else {
                    error = true;
                }
            }

            if (error) {
                ToastAndroid.show("Não foi possível enviar todos os reports de cliente!", ToastAndroid.SHORT);
            } else {
                ToastAndroid.show("Reports de cliente enviados com sucesso!", ToastAndroid.SHORT);
            }

            await carregarReportClient();
        } finally {
            setSincronizando(false);
        }
    }

    const handleGetUsers = async () => {
        const response = await getUsersOffline();
        if (response) {
            setUsers(response);
        }
    }

    const handleGetWorks = async () => {
        const response = await getWorksOffline();
        if (response) {
            setWorks(response);
        }
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
                            <Text className="text-2xl font-semibold text-slate-700">Report Cliente</Text>
                            <Text className="text-sm text-slate-500">Visualize o formulário salvo ou crie um novo.</Text>
                        </View>
                    </View>

                    <View className="flex-row w-full mb-4">
                        <Button
                            onPress={() => router.navigate('/form-report-cliente')}
                            class="rounded-2xl px-5 py-3 w-full flex flex-row items-center gap-3 justify-center"
                        >
                            <AntDesign name="plus" color="white" size={20} />
                            <Text className="text-white font-bold text-lg">Novo Formulário</Text>
                        </Button>
                    </View>

                    {reportClientes.length > 0 && isConnected &&
                        <Pressable disabled={sincronizando} onPress={handleSync} className={`flex flex-row w-fit justify-start px-4 py-2 rounded-lg bg-blue-200 self-end ml-4 ${sincronizando ? 'opacity-50' : 'opacity-100'}`}>
                            {sincronizando ? <View className="flex flex-row items-center gap-3"><ActivityIndicator /><Text className="text-blue-600 font-semibold text-lg">Sincronizando...</Text></View> : <View className="mr-1 text-blue-600 font-medium text-lg flex flex-row items-center gap-1"><AntDesign name="sync" size={16} color="#2563eb" /><Text className="ml-2 text-lg text-blue-600 font-medium">Sincronizar tudo</Text></View>}
                        </Pressable>
                    }

                    {reportClientes.length > 0 && (
                        <View className=" rounded-2xl p-2 mt-4">
                            <View className="space-y-3">
                                <Text className="text-lg font-medium mb-4 text-gray-600">Formulários salvos</Text>
                                {reportClientes.map((item, index) => (
                                    <Pressable onPress={() =>
                                        router.navigate({
                                            pathname: '/form-report-cliente',
                                            params: {
                                                uuid: item.uuid,
                                                reportCliente: JSON.stringify(item)
                                            }
                                        })}
                                        key={item.uuid}
                                        className="elevation-md bg-white rounded-xl p-6" >
                                        <Text className="text-base font-semibold text-slate-700">Formulário {index + 1}</Text>
                                        <View className="mb-2 mt-2">
                                            <Text className="text-slate-600 font-semibold">Tipo</Text>
                                            <Text className="text-slate-800">{item.tipo}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Obra</Text>
                                            <Text className="text-slate-800">{works.find(w => w.id == item.obra)?.descricao}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Responsável</Text>
                                            <Text className="text-slate-800">{users.find(u => u.id == item.responsavel_frente_servico)?.nome}</Text>
                                        </View>
                                        <View className="mb-2">
                                            <Text className="text-slate-600 font-semibold">Técnico de segurança</Text>
                                            <Text className="text-slate-800">{users.find(u => u.id == item.tecnico_seguranca_responsavel)?.nome}</Text>
                                        </View>
                                        {
                                            item.fotos?.length > 0 && (
                                                <View className="mb-2">
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
                        </View>
                    )}
                    {reportClientes.length == 0 &&
                        <View className="flex flex-col justify-center items-center mt-10">
                            <Text className="text-slate-600 font-semibold">Nenhum formulário salvo localmente.</Text>
                            <Text className="text-slate-500 mt-2 text-sm">Toque em "Novo formulário" para preencher um report de cliente.</Text>
                        </View>
                    }
                </ScrollView >
            </SafeAreaView >
        </View >
    );
}