import { useState, useEffect } from "react";
import { router } from 'expo-router';
import { ScrollView, StatusBar, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function MenuPrincipal() {
    
    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-slate-100">

                <ScrollView className="flex-1 bg-slate-100 px-4">
                    <Text className="text-2xl font-semibold mt-6 text-slate-700">Menu principal</Text>

                    <View className="gap-4">
                        <Pressable
                            key={"opcao_1"}
                            onPress={() => (router.navigate({
                                        pathname: '/menu-categorias',
                                    }))}
                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center mt-4"
                        >
                            <View className="text-white text-xl flex flex-row gap-2 font-bold">
                                <MaterialIcons name="category" size={22} color="white" /><Text className="text-white font-bold text-xl">Checklist</Text>
                            </View>
                            <Text className="text-blue-100 text-sm mt-2">
                                <Text className="font-bold text-white">Descrição:</Text> Checklist de tarefas
                            </Text>
                        </Pressable>

                        <Pressable
                            key={"opcao_2"}
                            onPress={() => (router.navigate({
                                        pathname: '/list-direito-recusa',
                                    }))}
                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center mt-2"
                        >
                            <View className="text-white text-xl flex flex-row gap-2 font-bold">
                                <MaterialIcons name="category" size={22} color="white" /><Text className="text-white font-bold text-xl">Direito de Recusa</Text>
                            </View>
                            <Text className="text-blue-100 text-sm mt-2">
                                <Text className="font-bold text-white">Descrição:</Text> Direito de recusa
                            </Text>
                        </Pressable>
                    </View>

                </ScrollView>

            </SafeAreaView>

        </View>
    );
}