import { useState, useEffect } from "react";
import { Alert, ScrollView, StatusBar, View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ToastAndroid, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getUsersOffline } from "../database/users";
import { UnsafeConditionProps, UnsafeConditionPhoto } from "../types/unsafe-condition";
import { createOrUpdateUnsafeConditionOffline } from "../database/unsafe-condition";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker, { DateTimePickerChangeEvent, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { UserProps } from "../types/user";

export default function FormCondicaoInsegura() {

    const { uuid, unsafeCondition } = useLocalSearchParams();
    const [usuarios, setUsuarios] = useState<UserProps[]>([]);
    const [selectedWitness, setSelectedWitness] = useState<UserProps>();
    const [searchWitness, setSearchWitness] = useState<string>("");
    const [modalWitness, setModalWitness] = useState<boolean>(false);
    const [local, setLocal] = useState<string>("");
    const [dateTime, setDateTime] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [description, setDescription] = useState<string>("");
    const [photos, setPhotos] = useState<UnsafeConditionPhoto[]>([]);
    const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

    useEffect(() => {
        obterUsuarios();
    }, []);

    useEffect(() => {
        if (uuid && unsafeCondition) {
            if (usuarios.length > 0) {
                obterDadosFormulario();
            }
            return;
        }

        resetarFormulario();
    }, [usuarios, uuid, unsafeCondition]);


    const resetarFormulario = () => {
        setSelectedWitness(undefined);
        setLocal("");
        setDateTime(new Date());
        setDescription("");
        setPhotos([]);
    }

    const obterDadosFormulario = async () => {
        if (!unsafeCondition) {
            return;
        }
        const data: UnsafeConditionProps = JSON.parse(unsafeCondition.toString());

        setSelectedWitness(usuarios.find(o => o.id == data.testemunha));
        setLocal(data.local || "");

        // ✅ Sempre reconstrua um Date de verdade a partir da string salva
        setDateTime(data.datetime ? new Date(data.datetime) : new Date());

        setDescription(data.descricao || "")
        setPhotos(data.fotos || []);
    }

    const obterUsuarios = async () => {
        const result = await getUsersOffline();
        if (result) {
            setUsuarios(result);
        }
    }

    const filteredWitnesses = usuarios.filter((u) =>
        u.nome?.toLowerCase().includes(searchWitness.toLowerCase())
    );

    const handleAddPhoto = async () => {
        const remaining = 5 - photos.length;
        if (remaining <= 0) {
            Alert.alert("Limite atingido", "Você pode adicionar até 5 fotos.");
            return;
        }

        Alert.alert("Adicionar fotos", "", [
            {
                text: "Galeria",
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== "granted") {
                        Alert.alert("Permissão necessária", "É preciso liberar o acesso à galeria para adicionar fotos.");
                        return;
                    }

                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        allowsMultipleSelection: true,
                        selectionLimit: remaining,
                        quality: 0.7,
                    });

                    if (!result.canceled) {
                        const newPhotos = result.assets.map((asset) => ({
                            uri: asset.uri,
                            name: asset.fileName || `unsafe-condition-${Date.now()}.jpg`,
                            type: asset.mimeType || "image/jpeg",
                        }));

                        setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
                    }
                }
            },
            {
                text: "Câmera",
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== "granted") {
                        Alert.alert("Permissão necessária", "É preciso liberar o acesso à câmera para tirar fotos.");
                        return;
                    }

                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: "images",
                        quality: 0.7,
                    });

                    if (!result.canceled) {
                        const newPhotos = result.assets.map((asset) => ({
                            uri: asset.uri,
                            name: asset.fileName || `unsafe-condition-${Date.now()}.jpg`,
                            type: asset.mimeType || "image/jpeg",
                        }));

                        setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
                    }
                }
            },
            {
                text: "Cancelar",
                style: "cancel"
            }
        ]);
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
    };

    const handleSubmit = async () => {
        let usuarioID = await AsyncStorage.getItem("usuarioID") || undefined;

        if (!selectedWitness || !local || !dateTime || !description) {
            Alert.alert('Atenção', 'Preencha testemunha, local, data/hora e descrição.');
            return;
        }

        const payload: UnsafeConditionProps = {
            uuid: typeof uuid === "string" && uuid ? uuid : `condicao-insegura-${Date.now()}`,
            responsavel: usuarioID,
            testemunha: selectedWitness.id,
            testemunha_nome: selectedWitness.nome,
            // ✅ Envie sempre como string ISO (UTC) — nunca o objeto Date cru
            datetime: dateTime.toISOString(),
            local: local,
            descricao: description,
            fotos: photos,
        };

        const success = await createOrUpdateUnsafeConditionOffline(payload);

        if (success) {
            ToastAndroid.show('Condição insegura salva localmente.', ToastAndroid.SHORT);
            router.back();
            return;
        }

        Alert.alert("Erro", "Não foi possível salvar o formulário offline.");

    }

    const onChangeDatetimePicker = (event: DateTimePickerChangeEvent, selectedDate: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);

            // selectedDate agora sempre vem preenchido quando o usuário confirma
            setDateTime(selectedDate);

            if (pickerMode === 'date') {
                setPickerMode('time');
                setShowPicker(true);
            } else {
                setPickerMode('date');
            }
        } else {
            // iOS
            setDateTime(selectedDate);
        }
    };

    const onDismissDatetimePicker = () => {
        // substitui o antigo `if (event.type === 'dismissed')`
        setShowPicker(false);
        setPickerMode('date');
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={60}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <StatusBar backgroundColor="#1976D2" translucent={false} />
                <SafeAreaView className="flex-1 bg-slate-100">
                    <ScrollView className="flex-1 bg-slate-100 px-4 py-4">
                        <Text className="text-2xl font-semibold text-slate-700 mb-6">Condição Insegura</Text>

                        <View className="gap-4">
                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Testemunha</Text>
                                <Pressable onPress={() => setModalWitness(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                    <Text className={`text-gray-800 px-4 py-4 text-lg ${selectedWitness ? '' : 'text-gray-400'}`}>
                                        {selectedWitness?.nome || 'Escolha uma testemunha'}
                                    </Text>
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </Pressable>
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Local</Text>
                                <TextInput
                                    placeholder="Digite o local"
                                    value={local}
                                    onChangeText={setLocal}
                                    className="bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-800 text-lg"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Data / Hora</Text>

                                <Pressable
                                    onPress={() => setShowPicker(true)}
                                    className="bg-white border border-gray-300 rounded-2xl px-4 py-4"
                                >
                                    <Text className="text-gray-800 text-lg">
                                        {dateTime.toLocaleString("pt-BR", {
                                            timeZone: "America/Sao_Paulo",
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </Pressable>

                                {showPicker && (
                                    <DateTimePicker
                                        value={dateTime}
                                        mode={Platform.OS === 'android' ? pickerMode : 'datetime'}
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        timeZoneName="America/Sao_Paulo"
                                        onValueChange={onChangeDatetimePicker}
                                        onDismiss={onDismissDatetimePicker}
                                    />
                                )}
                                <Text className="text-sm text-gray-500 mt-2">Use o formato brasileiro para data e hora.</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Descrição</Text>
                                <TextInput
                                    placeholder="Descreva a condição observada"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={5}
                                    className="bg-white align-top border justify-start border-gray-300 rounded-2xl px-4 py-4 text-gray-800 text-lg h-32 text-start"
                                />
                            </View>

                            <View className="mb-4">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-lg font-bold text-gray-800">Fotos (opcional)</Text>
                                    <Pressable onPress={handleAddPhoto} className="bg-blue-600 rounded-full px-4 py-2">
                                        <Text className="text-white font-semibold">Adicionar</Text>
                                    </Pressable>
                                </View>
                                <View className="flex-row flex-wrap gap-3">
                                    {photos.map((photo, index) => {
                                        return (
                                            <View key={`${photo.uri}-${index}`} className="relative">
                                                <Image source={{ uri: photo.uri }} className="h-20 w-20 rounded-xl" />
                                                <Pressable onPress={() => handleRemovePhoto(index)} className="absolute -right-1 -top-1 bg-white rounded-full">
                                                    <AntDesign name="close" size={16} color="#ef4444" />
                                                </Pressable>
                                            </View>
                                        )
                                    })}
                                </View>
                            </View>

                            <Pressable onPress={handleSubmit} className="bg-blue-600 rounded-2xl py-4 items-center justify-center mt-2 mb-8">
                                <Text className="text-white text-lg font-bold">Salvar</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>

                <Modal visible={modalWitness} onRequestClose={() => setModalWitness(false)} animationType="slide" transparent={true}>
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha uma testemunha</Text>
                            <AntDesign onPress={() => setModalWitness(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput
                            placeholder="Procurar funcionário"
                            className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800"
                            value={searchWitness}
                            onChangeText={setSearchWitness}
                        />
                        <ScrollView className="mt-6 px-6">
                            {filteredWitnesses.map((u, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => {
                                        setSelectedWitness(u);
                                        setModalWitness(false);
                                    }}
                                    className={`py-3 px-4 rounded-lg ${index % 2 === 0 ? 'bg-slate-200' : 'bg-transparent'}`}
                                >
                                    <Text className="text-slate-700 font-semibold">{u?.nome}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}