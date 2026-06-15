import { useState, useEffect, use } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView } from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function MenuModelos() {

    const { modelosCategoria, idObra } = useLocalSearchParams();

    const modelosIDs = JSON.parse(modelosCategoria as string);

    const [modelos, setModelos] = useState([]);
    const [busca, setBusca] = useState<string>("");

    //pegar modelos passados como parametro da tela anterior
    useEffect(() => {
        buscarModelos();
    }, []);

    const buscarModelos = async () => {
        try {
            const response = await api.get(`model/obra/${idObra}`);
            if (response.status == 200) {
                const modelosFiltrados = response.data.filter((modelo: any) => modelosIDs.includes(modelo.id));
                setModelos(modelosFiltrados);
            }
        } catch (error) {
            console.log("Erro ao buscar modelos: ", error);
            Alert.alert("Erro ao buscar modelos", "Ocorreu um erro ao buscar os modelos. Por favor, tente novamente mais tarde.");
        }
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView className="flex-1 bg-white px-4">
                    <Text className="text-2xl font-semibold mb-0 mt-6 text-slate-700">Modelos de Checklist</Text>
                    <Text className="text-md font-semibold mb-6 text-gray-400">Escolha um modelo para começar a preencher</Text>

                    <View className="gap-4">
                        <Input value={busca} onChangeText={(text) => setBusca(text)} placeholder="Procurar modelos de checklist..." />
                        {modelos.map((modelo: any) => {
                            if (modelo.nome?.toLowerCase().includes(busca?.toLowerCase())) {
                                return (
                                    <Pressable
                                        key={modelo.id}
                                        // onPress={() => router.navigate('form-checklist')}
                                        onPress={() => router.navigate({
                                            pathname: '/form-checklist',
                                            params: {
                                                perguntasDoModelo: modelo.perguntas,
                                                nomeModelo: modelo.nome,
                                                objetivoModelo: modelo.objetivo,
                                                exigeEquipamento: modelo.exige_equipamento,
                                                idObra: idObra
                                            }
                                        })
                                        }
                                        className="bg-blue-500 rounded-lg p-6 h-32 justify-center">
                                        <View className="text-white text-xl flex flex-row items-center font-bold gap-2">
                                            <Feather name="check-square" size={22} color="white" /><Text className="text-xl text-white font-bold">{modelo.nome}</Text>
                                        </View>
                                        <View className="text-blue-100 flex flex-row text-sm mt-2">
                                            <Text className="text-white font-bold">Versão: </Text><Text className="text-blue-100">{modelo.versao}</Text>
                                        </View>
                                        <View className="text-blue-100 flex flex-row text-sm mt-1">
                                            <Text className="text-white font-bold">Objetivo: </Text><Text className="text-blue-100">{modelo.objetivo}</Text>
                                        </View>
                                    </Pressable>
                                )}
                            })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );

}