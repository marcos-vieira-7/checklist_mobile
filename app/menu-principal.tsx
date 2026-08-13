import { useState, useEffect } from "react";
import { router } from 'expo-router';
import { ScrollView, StatusBar, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Entypo, MaterialIcons, Octicons } from "@expo/vector-icons";

export default function MenuPrincipal() {

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-slate-100">
                <ScrollView className="flex-1 bg-slate-100 px-4">
                    <View className="gap-2">
                        <Pressable
                            key={"opcao_1"}
                            onPress={() => (router.navigate({
                                pathname: '/menu-categorias',
                            }))}
                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center"
                        >
                            <View className="text-white text-xl flex flex-row gap-3 font-bold">
                                <AntDesign name="check-square" size={22} color="white" /><Text className="text-white font-bold text-xl">Checklist</Text>
                            </View>
                            <Text className="text-blue-100 text-sm mt-2">
                                <Text className="font-bold text-white">Descrição:</Text> Checklist de tarefas
                            </Text>
                        </Pressable>

                        <Pressable
                            key={"opcao_3"}
                            onPress={() => (router.navigate({
                                pathname: '/list-report-cliente',
                            }))}
                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center mt-2"
                        >
                            <View className="text-white text-xl flex flex-row gap-3 font-bold">
                                <Octicons name="report" size={22} color="white" /><Text className="text-white font-bold text-xl">Report Cliente</Text>
                            </View>
                            <Text className="text-blue-100 text-sm mt-2">
                                <Text className="font-bold text-white">Descrição:</Text> Preenchimento do formulário de report do cliente
                            </Text>
                        </Pressable>

                        <Pressable
                            key={"opcao_2"}
                            onPress={() => (router.navigate({
                                pathname: '/list-direito-recusa',
                            }))}
                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center mt-2"
                        >
                            <View className="text-white text-xl flex flex-row gap-3 font-bold">
                                <Entypo name="block" size={22} color="white" /><Text className="text-white font-bold text-xl">Direito de Recusa</Text>
                            </View>
                            <Text className="text-blue-100 text-sm mt-2">
                                <Text className="font-bold text-white">Descrição:</Text> Preenchimento do formulário de direito de recusa
                            </Text>
                        </Pressable>

                        <Pressable
                            key={"opcao_4"}
                            onPress={() => (router.navigate({
                                pathname: '/list-condicao-insegura',
                            }))}
                            className="bg-blue-500 rounded-2xl elevation-md p-6 h-32 justify-center mt-2"
                        >
                            <View className="text-white text-xl flex flex-row gap-3 font-bold">
                                <Entypo name="book" size={22} color="white" /><Text className="text-white font-bold text-xl">Condição Insegura</Text>
                            </View>
                            <Text className="text-blue-100 text-sm mt-2">
                                <Text className="font-bold text-white">Descrição:</Text> Preenchimento do formulário de Condições Inseguras
                            </Text>
                        </Pressable>

                    </View>
                </ScrollView>
            </SafeAreaView>

        </View>
    );
}