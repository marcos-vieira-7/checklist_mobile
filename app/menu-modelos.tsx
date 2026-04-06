import { useState, useEffect, use } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";
import { useLocalSearchParams } from "expo-router";

export default function MenuModelos() {
    //v1/model/obra/1

    // const modelos = [
    //     { id: 1, title: 'Manutenção Pneu', categoria_id: 3},
    //     { id: 2, title: 'Manutenção Motor', categoria_id: 3},
    //     { id: 3, title: 'Manutenção Suspensão', categoria_id: 3},
    // ];
    const [modelos, setModelos] = useState([]);
    const idObra = "1";
    //pegar modelos passados como parametro da tela anterior
    const { modelosCategoria } = useLocalSearchParams();
    const modelosIDs = JSON.parse(modelosCategoria as string);

    useEffect(() => {
        buscarModelos();
    }, []);

    const buscarModelos = async () => {
        try {
            const response = await api.get(`/v1/model/obra/${idObra}`);
            if(response.status == 200){
                console.log("Modelos: ", response.data);
                //filtrar modelos de acordo com os ids passados como parametro em modelosIDs
                const modelosFiltrados = response.data.filter((modelo: any) => modelosIDs.includes(modelo.id));
                console.log("Modelos filtrados: ", modelosFiltrados);

                setModelos(modelosFiltrados);
            }
        } catch (error) {
            console.log("Erro ao buscar modelos: ", error);
            Alert.alert("Erro ao buscar modelos", "Ocorreu um erro ao buscar os modelos. Por favor, tente novamente mais tarde.");
        }
    }

    return(
        <View className="flex-1">
            <StatusBar
            backgroundColor="#1976D2"
            translucent={false}
            />
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white p-4">
                <Text className="text-2xl font-bold mb-2 mt-4">Modelos</Text>
                <Text className="text-md font-bold mb-6 text-gray-400">Escolha um modelo</Text>
                
                <View className="gap-4">
                    {modelos.map((modelo: any) => (
                        <Pressable
                            key={modelo.id}
                            // onPress={() => router.navigate('form-checklist')}
                            onPress={() => router.navigate({
                                pathname:'/form-checklist', 
                                params: {
                                    perguntasDoModelo: modelo.perguntas,
                                    nomeModelo: modelo.nome,
                                    idObra: idObra,
                                }
                              })
                            }          
                            className="bg-blue-500 rounded-lg p-6 h-32 justify-center">
                            <Text className="text-white text-xl font-bold">
                                {modelo.nome}
                            </Text>
                            <Text className="text-blue-100 text-sm mt-2">
                                {modelo.versao}
                            </Text>
                            <Text className="text-blue-100 text-sm mt-2">
                                {modelo.objetivo}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
            </SafeAreaView>
        </View>
    );

}