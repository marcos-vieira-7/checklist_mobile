import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';


export default function MenuModelos() {

    const categories = [
        { id: 1, title: 'Categoria 1', description: 'Descrição da categoria 1' },
        { id: 2, title: 'Categoria 2', description: 'Descrição da categoria 2' },
        { id: 3, title: 'Categoria 3', description: 'Descrição da categoria 3' },
    ];

    return(
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-6 mt-16">Categorias</Text>
            
            <View className="gap-4">
                {categories.map((category) => (
                    <Pressable
                        key={category.id}
                        onPress={() => null} //router.push(`/categoria/${category.id}`)
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
    );

}