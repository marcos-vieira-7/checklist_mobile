import { useState, useEffect } from "react";
import { Text, View, Pressable, StatusBar, ScrollView } from "react-native";
import Input from "./components/Input";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryProps } from "../types/category";
import { WorkProps } from "../types/work";
import { MaterialIcons } from "@expo/vector-icons";
import { getWorksOffline } from "../database/works";
import { getCategoriesOffline } from "../database/categories";

export default function MenuCategorias() {

    const [categorias, setCategorias] = useState<CategoryProps[]>([]);
    const [obras, setObras] = useState<WorkProps[]>([]);
    const [busca, setBusca] = useState<string>("");

    useEffect(() => {
        buscarCategorias();
        buscarObras();
    }, []);

    const buscarCategorias = async () => {
        const result = await getCategoriesOffline();
        if (result) {
            setCategorias(result);
        }
    }

    const buscarObras = async () => {
        const result = await getWorksOffline();
        if (result) {
            setObras(result);
        }
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false} // 🔥 ISSO RESOLVE
            />
            <SafeAreaView className="flex-1 bg-slate-100">
                <ScrollView className="flex-1 bg-slate-100 px-4">
                    <Text className="text-2xl font-semibold text-slate-700">Categorias de Checklist</Text>
                    <Text className="text-md font-semibold mb-6 text-gray-400">Escolha uma categoria</Text>

                    <View className="gap-4">
                        <Input value={busca} onChangeText={(text) => setBusca(text)} placeholder="Procurar categoria..." />
                        {categorias.map((categoria: CategoryProps) => {
                            if (categoria.nome?.toLowerCase().includes(busca?.toLowerCase())) {
                                return (
                                    <Pressable
                                        key={categoria.id}
                                        onPress={() => router.navigate({
                                            pathname: '/menu-modelos',
                                            params: {
                                                modelosCategoria: JSON.stringify(categoria.modelos),
                                                idObra: categoria.id_obra
                                            }
                                        })
                                        }
                                        className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center"
                                    >
                                        <View className="text-white text-xl flex flex-row gap-2 font-bold">
                                            <MaterialIcons name="category" size={22} color="white" /><Text className="text-white font-bold text-xl">{categoria.nome}</Text>
                                        </View>
                                        <Text className="text-blue-100 text-sm mt-2">
                                            <Text className="font-bold text-white">Descrição:</Text> {categoria.descricao}
                                        </Text>
                                        <Text className="text-blue-100 text-sm mt-2">
                                            <Text className="font-bold text-white">Obra:</Text> {obras.find(o => o.id == categoria.id_obra)?.descricao}
                                        </Text>
                                    </Pressable>
                                )
                            }
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );

}