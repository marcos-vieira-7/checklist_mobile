import { useState, useEffect, useCallback } from "react";
import { Text, View, Pressable, StatusBar, ScrollView, Alert, ToastAndroid, ActivityIndicator } from "react-native";
import Input from "./components/Input";
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { getModelsOffline } from "../database/models";
import { ModelProps } from "../types/model";
import Button from "./components/Button";
import { deleteChecklistOffline, getChecklistsOffline } from "../database/checklists";
import { ChecklistProps } from "../types/checklist";
import { sendRegisters } from "../services/sync";
import { useNetInfo } from "@react-native-community/netinfo";

export default function MenuModelos() {

    const { idObra } = useLocalSearchParams();
    const { isConnected } = useNetInfo();
    const [modelos, setModelos] = useState<ModelProps[]>([]);
    const [busca, setBusca] = useState<string>("");
    const [abaSelecionada, setAbaSelecionada] = useState<"novo" | "salvos">("novo");
    const [checklists, setChecklists] = useState<ChecklistProps[]>([]);
    const [sincronizando, setSincronizando] = useState<boolean>(false);

    //pegar modelos passados como parametro da tela anterior
    useEffect(() => {
        buscarModelos();
    }, []);

    useFocusEffect(
        useCallback(() => {
            buscarChecklistsSalvos();
        }, [])
    );

    const buscarModelos = async () => {
        const result = await getModelsOffline();
        if (result) {
            setModelos(result);
        }
    }

    const buscarChecklistsSalvos = async () => {
        const response = await getChecklistsOffline();
        if (response) {
            setChecklists(response);
        }
    }

    const deleteChecklist = async (uuid: string) => {
        const result = await deleteChecklistOffline(uuid);
        if (result) {
            ToastAndroid.show("Checklist excluído com sucesso", ToastAndroid.SHORT);
            buscarChecklistsSalvos();
            return;
        }
        ToastAndroid.show("Não foi possível excluir o checklist!", ToastAndroid.SHORT);
    }

    const handleSync = async () => {
        setSincronizando(true);
        const success = await sendRegisters();
        setSincronizando(false);
        if (success) {
            ToastAndroid.show("Checklists enviados com sucesso!", ToastAndroid.SHORT);
            buscarChecklistsSalvos();
            return;
        }
        ToastAndroid.show("Não foi possível enviar os checklists!", ToastAndroid.SHORT);
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <View className="flex-1 bg-slate-100">
                <View className="overflow-x-auto flex flex-row justify-between mx-3 items-center mt-3 pb-3">
                    <Button onPress={() => setAbaSelecionada("novo")} class={`flex w-[49%] rounded-2xl ${abaSelecionada == "novo" ? "bg-[#1976D2] border-2 border-[#1976D2] font-bold" : "bg-white border border-[#1976d2bd] elevation-md"}`}><Text className={`${abaSelecionada == "novo" ? "font-bold text-white" : "font-medium text-slate-600"}`}>NOVO</Text></Button>
                    <Button onPress={() => setAbaSelecionada("salvos")} class={`flex w-[49%] rounded-2xl ${abaSelecionada == "salvos" ? "bg-[#1976D2] border-2 border-[#1976D2]" : "bg-white border border-[#1976d2bd] font-bold elevation-md"}`}><Text className={`${abaSelecionada == "salvos" ? "font-bold text-white" : "font-medium text-slate-600"}`}>SALVOS {checklists.length > 0 ? "(" + checklists.length + ")" : ""}</Text></Button>
                </View>
                {abaSelecionada == 'novo' ?
                    <ScrollView className="flex-1 bg-slate-100 px-4">
                        <Text className="text-2xl font-semibold mb-0 mt-4 text-slate-700">Modelos de Checklist</Text>
                        <Text className="text-md font-semibold mb-6 text-gray-400">Escolha um modelo para começar a preencher</Text>

                        <View className="gap-4 mb-14">
                            <Input value={busca} onChangeText={(text) => setBusca(text)} placeholder="Procurar modelos de checklist..." />
                            {modelos.map((modeloChecklist: ModelProps) => {
                                if (modeloChecklist?.nome?.toLowerCase().includes(busca?.toLowerCase())) {
                                    return (
                                        <Pressable
                                            key={modeloChecklist.id}
                                            // onPress={() => router.navigate('form-checklist')}
                                            onPress={() => router.navigate({
                                                pathname: '/form-checklist',
                                                params: {
                                                    perguntasDoModelo: modeloChecklist.perguntas,
                                                    nomeModelo: modeloChecklist.nome,
                                                    objetivoModelo: modeloChecklist.objetivo,
                                                    exigeEquipamento: modeloChecklist.exige_equipamento.toString(),
                                                    idObra: idObra
                                                }
                                            })
                                            }
                                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center">
                                            <View className="text-white text-xl flex flex-row items-center font-bold gap-2">
                                                <AntDesign name="check-square" size={22} color="white" /><Text className="text-xl text-white font-bold">{modeloChecklist.nome}</Text>
                                            </View>
                                            <View className="text-blue-100 flex flex-row text-sm mt-2">
                                                <Text className="text-white font-bold">Versão: </Text><Text className="text-blue-100">{modeloChecklist.versao}</Text>
                                            </View>
                                            <View className="text-blue-100 flex flex-row text-sm mt-1">
                                                <Text className="text-white font-bold">Objetivo: </Text><Text className="text-blue-100">{modeloChecklist.objetivo}</Text>
                                            </View>
                                        </Pressable>
                                    )
                                }
                            })}
                        </View>
                    </ScrollView>
                    :
                    <ScrollView className="flex-1 bg-slate-100 px-4">
                        <Text className="text-2xl font-semibold mt-4 text-slate-700">Checklists Salvos {checklists.length > 0 ? "(" + checklists.length + ")" : ""}</Text>
                        <Text className="text-md font-semibold mb-3 text-gray-400">Clique para editar</Text>

                        <View className="gap-4 mb-14">
                            {/* <Input value={busca} onChangeText={(text) => setBusca(text)} placeholder="Procurar modelos de checklist..." /> */}
                            {checklists.length > 0 && isConnected &&
                                <Pressable disabled={sincronizando} onPress={handleSync} className={`flex flex-row w-fit justify-end px-4 py-2 rounded-lg bg-blue-200 self-end ${sincronizando ? 'opacity-50' : 'opacity-100'}`}>
                                    {sincronizando ? <View className="flex flex-row items-center gap-3"><ActivityIndicator /><Text className="text-blue-600 font-semibold text-lg">Sincronizando...</Text></View> : <View className="mr-1 text-blue-600 font-medium text-lg flex flex-row items-center gap-1"><AntDesign name="sync" size={16} color="#2563eb" /><Text className="ml-2 text-lg text-blue-600 font-medium">Sincronizar tudo</Text></View>}
                                </Pressable>
                            }
                        {checklists.map((checklist: ChecklistProps) => {
                            return (
                                <Pressable
                                    key={checklist.uuid}
                                    onPress={() => router.navigate({
                                        pathname: '/form-checklist',
                                        params: {
                                            perguntasDoModelo: JSON.stringify(checklist.respostas),
                                            nomeModelo: checklist.modelo,
                                            objetivoModelo: modelos.find(m => m.nome == checklist.modelo)?.objetivo,
                                            exigeEquipamento: modelos.find(m => m.nome == checklist.modelo)?.exige_equipamento as any,
                                            idObra: idObra,
                                            uuidChecklist: checklist.uuid,
                                            perguntasDomodelo: modelos.find(m => m.nome == checklist.modelo)?.perguntas,
                                            localizacaoChecklist: checklist.localizacao,
                                            equipamentoChecklist: checklist.equipamento
                                        }
                                    })
                                    }
                                    className="bg-slate-100 rounded-2xl elevation-md border-l-2 border-blue-500 p-6 h-32 justify-center">
                                    <View className="flex flex-row items-center justify-between">
                                        <View>
                                            <View className="text-white text-xl flex flex-row items-center font-bold gap-2">
                                                <AntDesign name="check-square" size={22} color="#333" /><Text className="text-xl text-slate-800 font-bold">{checklist.modelo}</Text>
                                            </View>
                                            <View className="text-blue-100 flex flex-row text-sm mt-2">
                                                <Text className="text-slate-800 font-bold">Localização: </Text><Text className="text-slate-800">{checklist.localizacao}</Text>
                                            </View>
                                            <View className="text-blue-100 flex flex-row text-sm mt-1">
                                                <Text className="text-slate-800 font-bold">Criado em: </Text><Text className="text-slate-800">{new Date(checklist.data_hora_criacao || "").toLocaleDateString() + " as " + new Date(checklist.data_hora_criacao || "").toLocaleTimeString()}</Text>
                                            </View>
                                        </View>
                                        <Button onPress={() => Alert.alert("Atenção", "Deseja excluir o checklist salvo?", [
                                            {
                                                text: "Não"
                                            },
                                            {
                                                text: "Sim",
                                                onPress: () => checklist.uuid ? deleteChecklist(checklist.uuid) : null
                                            }
                                        ])} class="bg-transparent pr-0">
                                            <FontAwesome name="trash-o" size={24} color={"#dc2626"} />
                                        </Button>
                                    </View>
                                </Pressable>
                            )
                        })}
                        {checklists.length == 0 &&
                            <View className="flex flex-row flex-1 mt-10 justify-center">
                                <Text className="text-slate-500 font-medium opacity-50">Nenhum checklist encontrado</Text>
                            </View>
                        }
                    </View>
                    </ScrollView>
                }
        </View>
        </View >
    );

}