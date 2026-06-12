import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView } from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { ChecklistProps } from "../types/checklist";
import { getChecklists } from "../services/checklists";


export default function MinhasChecklists() {

    const [checklists, setChecklists] = useState<ChecklistProps[]>();

    useEffect(() => {
        handleGetChecklists();
    }, []);

    const handleGetChecklists = async () => {
        const result = await getChecklists();
        if (result) {
            setChecklists(result);
        }
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false} // 🔥 ISSO RESOLVE
            />
            <ScrollView className="flex-1 bg-white px-4">
                <Text className="text-2xl font-bold mb-6">Minhas Checklists</Text>

                <Pressable
                    onPress={() => router.navigate('/menu-categorias')}
                    className="mb-4 bg-gray-200 border border-dashed border-gray-400 rounded-lg p-4 items-center">
                    <Text className="text-black p-2 font-bold text-xl">+  Nova Checklist</Text>
                </Pressable>

                <View className="gap-4">
                    {checklists?.map((checklist) => (
                        <Pressable
                            key={checklist.uuid}
                            onPress={() => null} //router.push(`/categoria/${category.id}`)
                            className="bg-blue-500  rounded-lg p-6 h-32 justify-center"
                        >
                            <Text className="text-white text-xl font-bold">
                                {checklist.modelo}
                            </Text>
                            <Text className="text-blue-100 text-sm mt-2">
                                Atualizado em: {new Date(checklist.data_hora_edicao || "").toLocaleDateString()}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

}