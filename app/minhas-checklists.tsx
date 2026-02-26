import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';


export default function MinhasChecklists() {

    const checklists = [
        { id: 1, data: '25/02/2026', categoria: 'Segurança do trabalho' },
        { id: 2, data: '20/02/2026', categoria: 'Qualidade' },
        { id: 3, data: '15/02/2026', categoria: 'Preventiva' },
    ]

    return(
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-6 mt-16">Minhas Checklists</Text>

            <Pressable
                onPress={() => router.navigate('/menu-categorias')}
                className="mb-4 bg-gray-200 border border-dashed border-gray-400 rounded-lg p-4 items-center">
                <Text className="text-black p-2 font-bold text-xl">+  Nova Checklist</Text>
            </Pressable>

            <View className="gap-4">
                {checklists.map((checklist) => (
                    <Pressable
                        key={checklist.id}
                        onPress={() => null} //router.push(`/categoria/${category.id}`)
                        className="bg-blue-500  rounded-lg p-6 h-32 justify-center"
                    >
                        <Text className="text-white text-xl font-bold">
                            {checklist.data}
                        </Text>
                        <Text className="text-blue-100 text-sm mt-2">
                            {checklist.categoria}
                        </Text>
                    </Pressable>
                ))}
            </View>

        </ScrollView>
    );

}