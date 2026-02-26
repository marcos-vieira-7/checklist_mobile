import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';


export default function MenuModelos() {

    const modelos = [
        { id: 1, title: 'Manutenção Pneu', categoria_id: 3},
        { id: 2, title: 'Manutenção Motor', categoria_id: 3},
        { id: 3, title: 'Manutenção Suspensão', categoria_id: 3},
    ];

    return(
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-6 mt-16">Modelos</Text>
            <Text className="text-md font-bold mb-6 text-gray-400">Escolha um modelo</Text>
            
            <View className="gap-4">
                {modelos.map((modelo) => (
                    <Pressable
                        key={modelo.id}
                        onPress={() => router.navigate('form-checklist')} //router.push(`/categoria/${category.id}`)
                        className="bg-blue-500 rounded-lg p-6 h-32 justify-center">
                        <Text className="text-white text-xl font-bold">
                            {modelo.title}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );

}