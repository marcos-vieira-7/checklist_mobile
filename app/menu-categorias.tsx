import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";


export default function MenuCategorias() {

    const categories = [
        { id: 1, title: 'Segurança do Trabalho', description: 'Descrição da categoria 1' },
        { id: 2, title: 'Qualidade de Concreto', description: 'Descrição da categoria 2' },
        { id: 3, title: 'Manutenção Preventiva', description: 'Descrição da categoria 3' },
    ];

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
                    {categories.map((category) => (
                        <Pressable
                            key={category.id}
                            onPress={() => router.navigate('/menu-modelos')}
                            className="bg-blue-500 rounded-lg p-6 h-32 justify-center"
                        >
                            <Text className="text-white text-xl font-bold">
                                {category.title}
                            </Text>
                            <Text className="text-blue-100 text-sm mt-2">
                                {category.description}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
            </SafeAreaView>
        </View>
    );

}