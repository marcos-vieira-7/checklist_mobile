import { useState, useEffect } from "react";
import { ScrollView, StatusBar, View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ToastAndroid, ActivityIndicator, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { getWorksOffline } from "../database/works";
import { WorkProps } from "../types/work";
import { getUsersOffline } from "../database/users";
import { createOrUpdateReportClientOffline } from "../database/report-cliente";
import { router, useLocalSearchParams } from "expo-router";
import { ReportClientePhoto, ReportClienteProps } from "../types/report-cliente";
import type { UserProps } from "../types/user";

export default function FormReportCliente() {

    const { uuid, reportCliente } = useLocalSearchParams();

    const [usuarios, setUsuarios] = useState<UserProps[]>([]);
    const [obras, setObras] = useState<WorkProps[]>([]);
    const [tipo, setTipo] = useState<string>();
    const [responsibleFrontService, setResponsibleFrontService] = useState<UserProps | undefined>();
    const [safetyTechnician, setSafetyTechnician] = useState<UserProps | undefined>();
    const [selectedWork, setSelectedWork] = useState<WorkProps | undefined>();
    const [observations, setObservations] = useState<string>("");
    const [photos, setPhotos] = useState<ReportClientePhoto[]>([]);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [modalTipo, setModalTipo] = useState<boolean>(false);
    const [modalResponsibleFrontService, setModalResponsibleFrontService] = useState<boolean>(false);
    const [modalSafetyTechnician, setModalSafetyTechnician] = useState<boolean>(false);
    const [modalWork, setModalWork] = useState<boolean>(false);
    const [searchSupervisor, setSearchSupervisor] = useState<string>("");
    const [searchResponsibleFrontService, setSearchResponsibleFrontService] = useState<string>("");
    const [searchEmployee, setSearchEmployee] = useState<string>("");
    const [searchWork, setSearchWork] = useState<string>("");

    const filteredResponsibleFrontService = usuarios.filter((u) =>
        u.nome?.toLowerCase().includes(searchResponsibleFrontService.toLowerCase())
    );

    const filteredEmployees = usuarios.filter((u) =>
        u.nome?.toLowerCase().includes(searchEmployee.toLowerCase())
    );

    const filteredObras = obras.filter((obra) =>
        obra.descricao?.toLowerCase().includes(searchWork.toLowerCase())
    );

    useEffect(() => {
        obterUsuarios();
        obterObras();
    }, []);

    useEffect(() => {
        if (uuid && reportCliente) {
            if (usuarios.length > 0 && obras.length > 0) {
                obterDadosFormulario();
            }
            return;
        }

        resetarFormulario();
    }, [usuarios, obras, uuid, reportCliente]);

    const resetarFormulario = () => {
        setTipo(undefined);
        setSelectedWork(undefined);
        setResponsibleFrontService(undefined);
        setSafetyTechnician(undefined);
        setObservations("");
        setPhotos([]);
    }

    const obterDadosFormulario = async () => {
        if (!reportCliente) {
            return;
        }

        const data: ReportClienteProps = JSON.parse(reportCliente.toString());

        setTipo(data.tipo);
        setSelectedWork(obras.find(o => o.id == data.obra));
        setResponsibleFrontService(usuarios.find(u => u.id == data.responsavel_frente_servico));
        setSafetyTechnician(usuarios.find(u => u.id == data.tecnico_seguranca_responsavel));
        setObservations(data.observacoes || "");
        setPhotos(data.fotos || []);
    }

    const obterObras = async () => {
        const result = await getWorksOffline();
        if (result) {
            setObras(result);
        }
    }

    const obterUsuarios = async () => {
        const result = await getUsersOffline();
        if (result) {
            setUsuarios(result);
        }
    }

    const handleAddPhotos = async () => {
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
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsMultipleSelection: true,
                        selectionLimit: remaining,
                        quality: 0.7,
                    });

                    if (!result.canceled) {
                        const newPhotos = result.assets.map((asset) => ({
                            uri: asset.uri,
                            name: asset.fileName || `report-cliente-${Date.now()}.jpg`,
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
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 0.7,
                    });

                    if (!result.canceled) {
                        const newPhotos = result.assets.map((asset) => ({
                            uri: asset.uri,
                            name: asset.fileName || `report-cliente-${Date.now()}.jpg`,
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

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, photoIndex) => photoIndex !== index));
    };

    const handleSubmit = async () => {
        if (!tipo || !selectedWork || !responsibleFrontService || !safetyTechnician || observations.trim() === "") {
            Alert.alert("Atenção", "Preencha o tipo, a obra, os responsáveis e as observações antes de salvar.");
            return;
        }

        setIsSaving(true);

        const data: ReportClienteProps = {
            uuid: typeof uuid === "string" && uuid ? uuid : `report-cliente-${Date.now()}`,
            tipo: tipo as ReportClienteProps["tipo"],
            obra: selectedWork.id || 0,
            responsavel_frente_servico: responsibleFrontService.id || 0,
            tecnico_seguranca_responsavel: safetyTechnician.id || 0,
            observacoes: observations.trim(),
            fotos: photos,
        };

        const success = await createOrUpdateReportClientOffline(data);
        setIsSaving(false);

        if (success) {
            ToastAndroid.show("Formulário salvo localmente com sucesso!", ToastAndroid.SHORT);
            router.back();
            return;
        }

        Alert.alert("Erro", "Não foi possível salvar o formulário offline.");
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={60}>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <StatusBar
                    backgroundColor="#1976D2"
                    translucent={false}
                />
                <SafeAreaView className="flex-1 bg-slate-100">

                    <ScrollView className="flex-1 bg-slate-100 px-4">
                        <Text className="text-2xl font-semibold text-slate-700">Formulário Report do Cliente</Text>

                        <View className="gap-4">

                            <View className="mb-4 mt-6">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Tipo</Text>
                                <Pressable onPress={() => setModalTipo(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                    <Text className={`text-gray-800 px-4 py-4 text-lg ${tipo ? '' : 'text-gray-400'}`}>
                                        {tipo || 'Escolha um tipo'}
                                    </Text>
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </Pressable>
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Obra</Text>
                                <Pressable onPress={() => setModalWork(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                    <Text className={`text-gray-800 px-4 py-4 text-lg ${selectedWork ? '' : 'text-gray-400'}`}>
                                        {selectedWork?.descricao || 'Escolha uma obra'}
                                    </Text>
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </Pressable>
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Responsável frente de serviço</Text>
                                <Pressable onPress={() => setModalResponsibleFrontService(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                    <Text className={`text-gray-800 px-4 py-4 text-lg`}>
                                        {responsibleFrontService?.nome || 'Informe o responsável'}
                                    </Text>
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </Pressable>
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Técnico de segurança responsável</Text>
                                <Pressable onPress={() => setModalSafetyTechnician(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                    <Text className={`text-gray-800 px-4 py-4 text-lg`}>
                                        {safetyTechnician?.nome || 'Informe o técnico de segurança'}
                                    </Text>
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </Pressable>
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Fotos</Text>
                                <Pressable onPress={handleAddPhotos} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl px-4 py-4">
                                    <Text className="text-gray-800 text-lg">Adicionar fotos ({photos.length}/5)</Text>
                                    <Entypo name="camera" size={18} color="#333" />
                                </Pressable>
                                {photos.length > 0 && (
                                    <View className="mt-3 flex-row flex-wrap gap-2">
                                        {photos.map((photo, index) => (
                                            <View key={`${photo.uri}-${index}`} className="relative">
                                                <Image source={{ uri: photo.uri }} className="h-20 w-20 rounded-xl" />
                                                <Pressable onPress={() => removePhoto(index)} className="absolute -right-1 -top-1 bg-white rounded-full">
                                                    <AntDesign name="close" size={16} color="#ef4444" />
                                                </Pressable>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Observações</Text>
                                <TextInput
                                    placeholder="Descreva a condição observada"
                                    value={observations}
                                    onChangeText={setObservations}
                                    multiline={true}
                                    numberOfLines={4}
                                    className="bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-800 text-lg h-32 align-top text-start"
                                />
                            </View>

                            <Pressable disabled={isSaving} onPress={handleSubmit} className="bg-blue-600 rounded-2xl py-4 items-center justify-center mt-2 mb-6">
                                {isSaving ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-lg font-bold">Salvar</Text>}
                            </Pressable>
                        </View>
                    </ScrollView>
                </SafeAreaView>

                <Modal
                    visible={modalTipo}
                    onRequestClose={() => setModalTipo(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha um tipo</Text>
                            <AntDesign onPress={() => setModalTipo(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput placeholder="Procurar supervisor" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchSupervisor} onChangeText={text => setSearchSupervisor(text)} />
                        <ScrollView className="mt-6 px-6">
                            <Pressable onPress={() => [setTipo('interdição'), setModalTipo(false)]} className="py-3 px-4 rounded-lg bg-slate-200">
                                <Text className="text-slate-700 font-semibold">Interdição</Text>
                            </Pressable>
                            <Pressable onPress={() => [setTipo('notificação'), setModalTipo(false)]} className="py-3 px-4 rounded-lg bg-slate-200 mt-2">
                                <Text className="text-slate-700 font-semibold">Notificação</Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    visible={modalResponsibleFrontService}
                    onRequestClose={() => setModalResponsibleFrontService(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha um responsável</Text>
                            <AntDesign onPress={() => setModalResponsibleFrontService(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput placeholder="Procurar responsável" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchResponsibleFrontService} onChangeText={text => setSearchResponsibleFrontService(text)} />
                        <ScrollView className="mt-6 px-6">
                            {filteredResponsibleFrontService.map((u, index) => (
                                <Pressable onPress={() => {
                                    setResponsibleFrontService(u);
                                    setModalResponsibleFrontService(false);
                                }} className={`py-3 px-4 rounded-lg ${index % 2 == 0 ? 'bg-slate-200' : 'bg-transparent'}`} key={index}>
                                    <Text className="text-slate-700 font-semibold">{u?.nome}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    visible={modalSafetyTechnician}
                    onRequestClose={() => setModalSafetyTechnician(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha um Empregado</Text>
                            <AntDesign onPress={() => setModalSafetyTechnician(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput placeholder="Procurar empregado" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchEmployee} onChangeText={text => setSearchEmployee(text)} />
                        <ScrollView className="mt-6 px-6">
                            {filteredEmployees.map((u, index) => {
                                return (
                                    <Pressable onPress={() => {
                                        setSafetyTechnician(u);
                                        setModalSafetyTechnician(false);
                                    }} className={`py-3 px-4 rounded-lg ${index % 2 == 0 ? 'bg-slate-200' : 'bg-transparent'}`} key={index}>
                                        <Text className="text-slate-700 font-semibold">{u?.nome}</Text>
                                    </Pressable>
                                )
                            })}
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    visible={modalWork}
                    onRequestClose={() => setModalWork(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha uma Obra</Text>
                            <AntDesign onPress={() => setModalWork(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput placeholder="Procurar obra" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchWork} onChangeText={text => setSearchWork(text)} />
                        <ScrollView className="mt-6 px-6">
                            {filteredObras.map((obra, index) => {
                                return (
                                    <Pressable onPress={() => {
                                        setSelectedWork(obra);
                                        setModalWork(false);
                                    }} className={`py-3 px-4 rounded-lg ${index % 2 == 0 ? 'bg-slate-200' : 'bg-transparent'}`} key={index}>
                                        <Text className="text-slate-700 font-semibold">{obra?.descricao}</Text>
                                    </Pressable>
                                )
                            })}
                        </ScrollView>
                    </View>
                </Modal>
            </ScrollView>

        </KeyboardAvoidingView>
    );

}