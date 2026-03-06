import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
// import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../services/api";

// http://10.10.2.200:3005/api/v1/category/obra/1
export default function MenuCategorias() {

    const [categorias, setCategorias] = useState([]);
    const idObra = "1"; //TODO: pegar id da obra selecionada

    useEffect(() => {
        buscarCategorias();
    }, []);

    const buscarCategorias = async () => {
        try {
            const response = await api.get(`/v1/category/obra/${idObra}`);
            console.log("Categorias: ", response.data);
            setCategorias(response.data);

        } catch (error) {
            console.log("Erro ao buscar categorias: ", error);
            Alert.alert("Erro ao buscar categorias", "Ocorreu um erro ao buscar as categorias. Por favor, tente novamente mais tarde.");
        }
    }


    return(
        <View className="flex-1">
            <StatusBar
            backgroundColor="#1976D2"
            translucent={false} // 🔥 ISSO RESOLVE
            />
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white p-4">
                <Text className="text-2xl font-bold mb-2 mt-4">Categorias</Text>
                <Text className="text-md font-bold mb-6 text-gray-400">Escolha uma categoria</Text>
                
                <View className="gap-4">
                    {categorias.map((categoria:any) => (
                        <Pressable
                            key={categoria.id}
                            onPress={() => router.navigate({
                                pathname:'/menu-modelos', 
                                params: {
                                    modelosCategoria: JSON.stringify(categoria.modelos)
                                }
                              })
                            }
                            className="bg-blue-500 rounded-lg p-6 h-32 justify-center"
                        >
                            <Text className="text-white text-xl font-bold">
                                {categoria.nome}
                            </Text>
                            <Text className="text-blue-100 text-sm mt-2">
                                {categoria.descricao}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
            </SafeAreaView>
        </View>
    );

}