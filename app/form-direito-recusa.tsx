import { useState, useEffect, useCallback } from "react";
import { ScrollView, StatusBar, View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ToastAndroid, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { getUsers } from "../services/users";
import { getWorksOffline } from "../database/works";
import { WorkProps } from "../types/work";
import { getUsersOffline } from "../database/users";
import { createOrUpdateRightRefusalOffline, getRightRefusalOffline } from "../database/right-refusal";
import { router, useFocusEffect } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";
import { RightRefusalProps } from "../types/right-refusal";
import { sendRegisterRightRefusal } from "../services/sync";

export default function FormDireitoRecusa() {

    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [obras, setObras] = useState<WorkProps[]>([]);
    const [supervisor, setSupervisor] = useState<any>(undefined);
    // const [contractManager, setContractManager] = useState<string>("");
    const [selectedEmployee, setSelectedEmployee] = useState<any>(undefined);
    const [employeeMatricula, setEmployeeMatricula] = useState<string>("");
    const [selectedWork, setSelectedWork] = useState<any>(undefined);
    const [description, setDescription] = useState<string>("");
    const [modalSupervisor, setModalSupervisor] = useState<boolean>(false);
    const [modalEmployee, setModalEmployee] = useState<boolean>(false);
    const [modalWork, setModalWork] = useState<boolean>(false);
    const [searchSupervisor, setSearchSupervisor] = useState<string>("");
    const [searchEmployee, setSearchEmployee] = useState<string>("");
    const [searchWork, setSearchWork] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isConnected } = useNetInfo();

    const [rightRefusal, setRightRefusal] = useState<RightRefusalProps >({} as RightRefusalProps);
    const [sincronizando, setSincronizando] = useState<boolean>(false);

    const filteredUsuarios = usuarios.filter((u) =>
        u.nome?.toLowerCase().includes(searchSupervisor.toLowerCase())
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

    useFocusEffect(
        useCallback(() => {
            buscarDireitoRecusaSalvo();
        }, [])
    );

    const buscarDireitoRecusaSalvo = async () => {
        const response = await getRightRefusalOffline();
        if (response) {
            setRightRefusal(response);
        }
    }

    const handleSync = async () => {
        setSincronizando(true);
        const success = await sendRegisterRightRefusal(rightRefusal);
        setSincronizando(false);
        if (success) {
            ToastAndroid.show("Direito de recusa enviado com sucesso!", ToastAndroid.SHORT);
            buscarDireitoRecusaSalvo();
            return;
        }
        ToastAndroid.show("Não foi possível enviar os direitos de recusa!", ToastAndroid.SHORT);
    }


    const obterObras = async () => {
        const result = await getWorksOffline();
        if (result) {
            console.log("Obras obtidas com sucesso:", result);
            setObras(result);
        }
    }

    const obterUsuarios = async () => {
        const result = await getUsersOffline();
        if (result) {
            console.log("Usuários obtidos com sucesso:", result);
            setUsuarios(result);
        }
    }

    const handleSubmit = async () => {
        // Aqui você pode adicionar a lógica para enviar os dados do formulário
        console.log("Supervisor:", supervisor.id);
        console.log("Selected Employee:", selectedEmployee.id);
        console.log("Selected Work:", selectedWork.id);
        console.log("Description:", description);

        //verificar se todos os campos obrigatórios foram preenchidos
        if (!supervisor || !selectedEmployee || !selectedWork || !description) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // abaixo montar data objeto para envio e chamar /right-refusal post
        const data = {
            supervisor: supervisor.id,
            usuario: selectedEmployee.id,
            obra: selectedWork.id,
            descricao: description
        }

        //make Post calling /right-refusal with data below
        setIsSubmitting(true);
        const success = await createOrUpdateRightRefusalOffline(data);
        setIsSubmitting(false);
        if (success) {
            ToastAndroid.show("Formulário enviado com sucesso!", ToastAndroid.SHORT);
            router.back();
        }
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
                        <Text className="text-2xl font-semibold mt-6 text-slate-700">Formulário Direito de Recusa</Text>

                        <View className="gap-4">
                            {rightRefusal && isConnected &&
                                <Pressable disabled={sincronizando} onPress={handleSync} className={`flex flex-row w-fit justify-end px-4 py-2 rounded-lg bg-blue-200 self-end ${sincronizando ? 'opacity-50' : 'opacity-100'}`}>
                                    {sincronizando ? <View className="flex flex-row items-center gap-3"><ActivityIndicator /><Text className="text-blue-600 font-semibold text-lg">Sincronizando...</Text></View> : <View className="mr-1 text-blue-600 font-medium text-lg flex flex-row items-center gap-1"><AntDesign name="sync" size={16} color="#2563eb" /><Text className="ml-2 text-lg text-blue-600 font-medium">Enviar Formulário</Text></View>}
                                </Pressable>
                            }

                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Supervisor/Líder Imediato</Text>
                                <Pressable onPress={() => setModalSupervisor(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                    <Text className={`text-gray-800 px-4 py-4 text-lg ${supervisor ? '' : 'text-gray-400'}`}>
                                        {supervisor?.nome || 'Escolha um supervisor'}
                                    </Text>
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </Pressable>
                            </View>

                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Obra do Empregado</Text>
                            <Pressable onPress={() => setModalWork(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                <Text className={`text-gray-800 px-4 py-4 text-lg ${selectedWork ? '' : 'text-gray-400'}`}>
                                    {selectedWork?.descricao || 'Escolha uma obra'}
                                </Text>
                                <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                            </Pressable>
                        </View>

                    {/*     <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Gestor do Contrato</Text>
                            <TextInput
                                placeholder="Gestor do contrato"
                                value={contractManager}
                                editable={false}
                                className="bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-800 text-lg"
                            />
                        </View> 
                    */}

                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Nome do Empregado</Text>
                            <Pressable onPress={() => setModalEmployee(true)} className="flex flex-row items-center bg-white justify-between border border-gray-300 rounded-2xl">
                                <Text className={`text-gray-800 px-4 py-4 text-lg ${selectedEmployee ? '' : 'text-gray-400'}`}>
                                    {selectedEmployee?.nome || 'Escolha um empregado'}
                                </Text>
                                <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                            </Pressable>
                        </View>

                        {/* <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Matrícula do Empregado</Text>
                            <TextInput
                                placeholder="Matrícula"
                                value={c}
                                editable={false}
                                className="bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-800 text-lg"
                            />
                        </View> */}

                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Descrição da Condição Observada</Text>
                            <TextInput
                                placeholder="Descreva a condição observada"
                                value={description}
                                onChangeText={setDescription}
                                multiline={true}
                                numberOfLines={4}
                                className="bg-white border border-gray-300 rounded-2xl px-4 py-4 text-gray-800 text-lg h-32 text-start"
                            />
                        </View>

                        <Pressable onPress={handleSubmit} className="bg-blue-600 rounded-2xl py-4 items-center justify-center mt-2 mb-6">
                            <Text className="text-white text-lg font-bold">Enviar</Text>
                        </Pressable>
                    </View>
                    </ScrollView>
                </SafeAreaView>


                <Modal
                    visible={modalSupervisor}
                    onRequestClose={() => setModalSupervisor(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha um Supervisor</Text>
                            <AntDesign onPress={() => setModalSupervisor(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput placeholder="Procurar supervisor" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchSupervisor} onChangeText={text => setSearchSupervisor(text)} />
                        <ScrollView className="mt-6 px-6">
                            {filteredUsuarios.map((u, index) => {
                                return (
                                    <Pressable onPress={() => [setSupervisor(u), setModalSupervisor(false)]} className={`py-3 px-4 rounded-lg ${index % 2 == 0 ? 'bg-slate-200' : 'bg-transparent'}`} key={index}>
                                        <Text className="text-slate-700 font-semibold">{u?.nome}</Text>
                                    </Pressable>
                                )
                            })}
                        </ScrollView>
                    </View>
                </Modal>

                <Modal
                    visible={modalEmployee}
                    onRequestClose={() => setModalEmployee(false)}
                    animationType="slide"
                    transparent={true}
                >
                    <View className="bg-slate-100 flex-1 mt-10">
                        <View className="flex flex-row items-center justify-between m-6 mb-10">
                            <Text className="text-lg font-medium">Escolha um Empregado</Text>
                            <AntDesign onPress={() => setModalEmployee(false)} name="close" size={18} color="black" />
                        </View>
                        <TextInput placeholder="Procurar empregado" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchEmployee} onChangeText={text => setSearchEmployee(text)} />
                        <ScrollView className="mt-6 px-6">
                            {filteredEmployees.map((u, index) => {
                                return (
                                    <Pressable onPress={() => {
                                        setSelectedEmployee(u);
                                        setModalEmployee(false);
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
function getRightRefusalsOffline() {
    throw new Error("Function not implemented.");
}

function setRightRefusals(response: never) {
    throw new Error("Function not implemented.");
}

