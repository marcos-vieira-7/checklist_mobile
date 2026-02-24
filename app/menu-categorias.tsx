import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";

export default function MenuCategorias() {

    return(
        <View className="flex-1 items-center justify-center bg-white p-6">
            <Text>Menu Categorias</Text>
        </View>
    )

}