import { useState, useEffect } from "react";
import { Alert, Text, View, Pressable, ToastAndroid, StatusBar, ScrollView, TextInput, TouchableOpacity, Image, Modal } from "react-native";
import Button from "./components/Button";
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, Entypo, Feather, FontAwesome } from "@expo/vector-icons";
import { generateUUID } from "../utils/uuid";
import { createOrUpdateChecklistOffline } from "../database/checklists";
import { ChecklistAnswersProps, ChecklistProps } from "../types/checklist";
import { VideoView, useVideoPlayer } from 'expo-video';
import { EquipmentProps } from "../types/equipment";
import { getEquipmentsOffline } from "../database/equipments";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Questao = {
    descricao: string,
    exige_foto: boolean,
    exige_observacao: boolean,
    exige_video: boolean,
    fotos: string[],
    id: string,
    observacao: string,
    resposta: "C" | "NC" | "NA" | null,
    videos: string[],
    localizacao: string,
    motivo: string
}

export default function FormChecklist() {

    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [questaoSelecionada, setQuestaoSelecionada] = useState<Questao>();
    const { perguntasDoModelo, nomeModelo, objetivoModelo, exigeEquipamento, idObra, uuidChecklist, localizacaoChecklist, equipamentoChecklist, perguntasDomodelo } = useLocalSearchParams();
    const [localizacao, setLocalizacao] = useState(localizacaoChecklist?.toString() || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [equipment, setEquipment] = useState<string>(equipamentoChecklist?.toString() || "");
    const [equipments, setEquipments] = useState<EquipmentProps[]>();
    const [modalEquipaments, setModalEquipaments] = useState<boolean>(false);
    const [modalMotivoNC, setModalMotivoNC] = useState<boolean>(false);
    const [searchEquipment, setSearchEquipment] = useState<string>("");

    useEffect(() => {
        obterEquipamentos();
        const parsedPerguntas = JSON.parse(perguntasDoModelo as string || '[]');

        if (uuidChecklist) {
            const perguntasDoModeloParseado = JSON.parse(perguntasDomodelo.toString());
            const inicial = parsedPerguntas.map((p: ChecklistAnswersProps, index: number) => ({
                id: index,
                descricao: p.descricao,
                resposta: p.resposta,
                observacao: p.observacao,
                fotos: p.fotos,
                videos: p.videos,
                motivo: p.motivo,
                exige_foto: perguntasDoModeloParseado.exige_foto,
                exige_video: perguntasDoModeloParseado.exige_video,
                exige_observacao: perguntasDoModeloParseado.exige_observacao,
            }));

            setQuestoes(inicial);
        }
        else {
            const inicial = parsedPerguntas.map((p: Questao, index: number) => ({
                id: index,
                descricao: p.descricao,
                resposta: '',
                observacao: '',
                fotos: [],
                videos: [],
                motivo: p.motivo,
                exige_foto: p.exige_foto,
                exige_video: p.exige_video,
                exige_observacao: p.exige_observacao,
            }));

            setQuestoes(inicial);
        }
    }, [perguntasDoModelo]);

    function atualizarQuestao(id: string, dados: Partial<Questao>) {
        setQuestoes((prev) =>
            prev.map((q) => {
                if (q.id !== id) return q;

                return {
                    ...q,
                    ...dados,
                    fotos: [
                        ...(q.fotos || []),
                        ...(dados.fotos || [])
                    ],
                    videos: [
                        ...(q.videos || []),
                        ...(dados.videos || [])
                    ]
                };
            })
        );
    }

    function selecionarResposta(id: string, valor: 'C' | 'NC' | 'NA') {
        atualizarQuestao(id, {
            resposta: valor,
            ...(valor !== 'NC' && {
                observacao: '',
                fotos: [],
                videos: [],
            }),
        });
    }

    // const tirarFoto = async (id: string) => {
    //     const { status } = await ImagePicker.requestCameraPermissionsAsync();
    //     if (status !== 'granted') {
    //         alert('Permissão da câmera é necessária');
    //         return;
    //     }

    //     const res = await ImagePicker.launchCameraAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsMultipleSelection: true,
    //         quality: 0.7,
    //     });

    //     if (!res.canceled) {
    //         atualizarQuestao(id, {
    //         fotos: res.assets.map(a => ({ uri: a.uri }))
    //         });
    //     }

    // };

    const selecionarImagem = async (id: string) => {
        Alert.alert('Selecionar imagem', '', [
            {
                text: 'Câmera',
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') return;

                    const res = await ImagePicker.launchCameraAsync({
                        mediaTypes: "images",
                        quality: 0.3,
                    });

                    if (!res.canceled) {
                        atualizarQuestao(id, {
                            fotos: res.assets.map(a => (a.uri))
                        });
                    }
                }
            },
            {
                text: 'Galeria',
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') return;

                    const res = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: 'images',
                        allowsMultipleSelection: false,
                        quality: 0.3,
                    });

                    if (!res.canceled) {
                        atualizarQuestao(id, {
                            fotos: res.assets.map(a => (a.uri))
                        });
                    }
                }
            },
            {
                text: 'Cancelar',
                style: 'cancel'
            }
        ]);
    };

    const selecionarVideo = async (id: string) => {
        Alert.alert('Selecionar vídeo', '', [
            {
                text: 'Câmera',
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') return;

                    const res = await ImagePicker.launchCameraAsync({
                        mediaTypes: "videos",
                        quality: 0.3,
                    });

                    if (!res.canceled) {
                        atualizarQuestao(id, {
                            videos: res.assets.map(a => (a.uri))
                        });
                    }
                }
            },
            {
                text: 'Galeria',
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') return;

                    const res = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: "videos",
                        allowsMultipleSelection: false,
                        quality: 0.3,
                    });

                    if (!res.canceled) {
                        atualizarQuestao(id, {
                            videos: res.assets.map(a => (a.uri))
                        });
                    }
                }
            },
            {
                text: 'Cancelar',
                style: 'cancel'
            }
        ]);
    };

    async function handleSubmit() {

        //Verificando se todas perguntas foram respondidas
        const perguntasNaoRespondidas = questoes.filter(q => !q.resposta);
        if (perguntasNaoRespondidas.length > 0) {
            Alert.alert("Atenção", "Responda todas as perguntas do checklist.");
            return;
        }

        //Validando se campos obrigatórios foram preenchidos
        const perguntasSemCamposObrigatorios = questoes.filter(q => (q.exige_foto && q.resposta == 'NC' && q.fotos.length == 0) || (q.exige_video && q.resposta == 'NC' && q.videos.length == 0) || (q.exige_observacao && q.resposta == 'NC' && q.observacao == ""));

        if (perguntasSemCamposObrigatorios.length > 0) {
            Alert.alert("Atenção", "Informe todos os campos obrigatórios das perguntas respondidas com NC (não conforme)");
            return;
        }

        //Verificando se o equipamento é obrigatório e não foi preenchido
        if (JSON.parse(exigeEquipamento?.toString()) && !equipment) {
            Alert.alert("Atenção", "Selecione o equipamento!");
            return;
        }

        const nomeUsuario = await AsyncStorage.getItem('nomeUsuario');

        if (uuidChecklist) { //Update
            const uuid = uuidChecklist.toString();
            const data: ChecklistProps = {
                uuid: uuid,
                modelo: nomeModelo as string,
                id_obra: parseInt(idObra.toString()),
                usuario_criador: nomeUsuario,
                localizacao: localizacao,
                data_hora_criacao: new Date().toISOString(),
                respostas: questoes.map((q) => ({
                    id: q.id,
                    descricao: q.descricao,
                    resposta: q.resposta,
                    observacao: q.observacao,
                    fotos: q.fotos,
                    videos: q.videos,
                    motivo: q.motivo
                })),
                status: 1,
                equipamento: equipment
            }

            setIsSubmitting(true);
            const success = await createOrUpdateChecklistOffline(uuid, data);
            setIsSubmitting(false);
            if (success) {
                ToastAndroid.show("Checklist salvo com sucesso!", ToastAndroid.SHORT);
                router.back();
            }
        }
        else { // Create
            const uuid = await generateUUID();

            const data: ChecklistProps = {
                uuid: uuid,
                modelo: nomeModelo as string,
                id_obra: parseInt(idObra.toString()),
                usuario_criador: nomeUsuario,
                localizacao: localizacao,
                data_hora_criacao: new Date().toISOString(),
                respostas: questoes.map((q) => ({
                    id: q.id,
                    descricao: q.descricao,
                    resposta: q.resposta,
                    observacao: q.observacao,
                    fotos: q.fotos,
                    videos: q.videos,
                    motivo: q.motivo
                })),
                status: 1,
                equipamento: equipment
            }

            setIsSubmitting(true);
            const success = await createOrUpdateChecklistOffline(undefined, data);
            setIsSubmitting(false);
            if (success) {
                ToastAndroid.show("Checklist salvo com sucesso!", ToastAndroid.SHORT);
                router.back();
            }
        }
    }

    const removeFile = (indexQuestao: number, indexFoto: number, type: "foto" | "video") => {
        const questoesCopy = [...questoes];
        if (type == "foto") {
            let fotos = questoesCopy[indexQuestao].fotos;
            fotos.splice(indexFoto, 1);
            questoesCopy[indexQuestao].fotos = fotos;
            setQuestoes(questoesCopy);
            ToastAndroid.show("Image removida com sucesso!", ToastAndroid.SHORT);
        }
        else if (type == "video") {
            let videos = questoesCopy[indexQuestao].videos;
            videos.splice(indexFoto, 1);
            questoesCopy[indexQuestao].videos = videos;
            setQuestoes(questoesCopy);
            ToastAndroid.show("Video removido com sucesso!", ToastAndroid.SHORT);
        }
    }

    const VideoItem = ({ uri }: { uri: string; }) => {
        const player = useVideoPlayer(uri);

        return (
            <View>
                <VideoView
                    player={player}
                    style={{ width: 300, height: 200 }}
                />
            </View>
        );
    }

    const obterEquipamentos = async () => {
        const result = await getEquipmentsOffline();
        if (result) {
            setEquipments(result);
        }
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-slate-100">
                <ScrollView className="flex-1 bg-slate-100 px-4">
                    <Text className="text-2xl font-semibold mt-6">{nomeModelo}</Text>
                    {/* <Text className="text-md font-bold mb-6 text-gray-400">{objetivoModelo}</Text> */}
                    <Text className="text-md font-bold mb-6 text-gray-400">Preencha as informações</Text>

                    {/* Need a loading bar based number of questions asked to 100% */}
                    <View className="mb-4">
                        <Text className="text-right text-xs text-gray-500 mb-1">
                            {Math.round((questoes.filter(q => q.resposta).length / questoes.length * 100))}%
                        </Text>
                        <View className="w-full bg-gray-200 rounded-full h-2.5">
                            <View
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${(questoes.filter(q => q.resposta).length / questoes.length * 100)}%` }}
                            />
                        </View>
                    </View>

                    <View className="gap-4">

                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-800 mb-2">Localização</Text>
                            <TextInput
                                placeholder="Digite a localização..."
                                value={localizacao}
                                onChangeText={setLocalizacao}
                                className="border border-gray-300 bg-white text-lg align-top text-slate-900 rounded-2xl px-4 py-4 focus:border focus:border-blue-400"
                            />
                        </View>

                        {JSON.parse(exigeEquipamento?.toString()) &&
                            <View className="mb-4">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Equipamento</Text>
                                <View className="flex flex-row items-center focus:border focus:border-blue-400 bg-white justify-between border border-gray-300 rounded-2xl">
                                    <TextInput
                                        onPress={() => setModalEquipaments(true)}
                                        placeholder="Escolha um equipamento"
                                        value={equipment}
                                        className=" text-gray-800 px-4 py-4 text-lg align-center"
                                    />
                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                </View>
                            </View>
                        }

                        {questoes.map((questao: Questao, index: number) => {
                            return (
                                <View
                                    key={index}
                                    className="bg-white rounded-2xl p-5 shadow-md border border-gray-200"
                                >
                                    {/* TÍTULO */}
                                    <Text className="text-lg font-bold text-gray-800 mb-4">
                                        {questao.descricao}
                                    </Text>

                                    {/* BOTÕES */}
                                    <View className="flex-row justify-between gap-2">

                                        <Pressable
                                            onPress={() => selecionarResposta(questao.id, 'C')}
                                            className={`flex-1 py-3 rounded-2xl items-center ${questao.resposta === 'C'
                                                ? 'bg-green-600'
                                                : 'bg-green-200'
                                                }`}
                                        >
                                            <Text className="font-bold text-white">C</Text>
                                        </Pressable>


                                        <Pressable
                                            onPress={() => selecionarResposta(questao.id, 'NC')}
                                            className={`flex-1 py-3 rounded-2xl items-center ${questao.resposta === 'NC'
                                                ? 'bg-red-600'
                                                : 'bg-red-200'
                                                }`}
                                        >
                                            <Text className="font-bold text-white">NC</Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => selecionarResposta(questao.id, 'NA')}
                                            className={`flex-1 py-3 rounded-2xl items-center ${questao.resposta === 'NA'
                                                ? 'bg-gray-700'
                                                : 'bg-gray-300'
                                                }`}
                                        >
                                            <Text className="font-bold text-white">NA</Text>
                                        </Pressable>
                                    </View>

                                    {/* SE FOR NÃO CONFORME */}
                                    {questao.resposta === 'NC' && (
                                        <View className="mt-2 gap-3">

                                            <View className="">
                                                <Text className="text-lg font-medium text-gray-800 mb-2">Motivo</Text>
                                                <Pressable onPress={() => [setQuestaoSelecionada(questao), setModalMotivoNC(true)]} className="flex flex-row items-center focus:border focus:border-blue-400 bg-white justify-between border border-gray-300 rounded-2xl">
                                                    <TextInput
                                                        onPress={() => [setQuestaoSelecionada(questao), setModalMotivoNC(true)]}
                                                        placeholder="Motivo da não conformidade"
                                                        value={questao.motivo}
                                                        className=" text-gray-800 px-4 py-4 text-md align-center flex flex-1"
                                                    />
                                                    <Entypo name="chevron-down" className="mr-3" size={18} color="#333" />
                                                </Pressable>
                                            </View>

                                            <TextInput
                                                placeholder="Descreva o problema..."
                                                multiline
                                                value={questao.observacao}
                                                onChangeText={(text) =>
                                                    atualizarQuestao(questao.id, { observacao: text })
                                                }
                                                className="border border-gray-300 align-top rounded-lg p-3 min-h-[80px] text-gray-800"
                                            />

                                            <View className="flex-row gap-3">
                                                <TouchableOpacity className="flex-1 bg-slate-800 py-3 rounded-lg items-center" onPress={() => selecionarImagem(questao.id)}>
                                                    <Text className="text-white font-semibold gap-1"><FontAwesome name="picture-o" size={16} color="white" /> Foto</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => selecionarVideo(questao.id)}
                                                    className="flex-1 bg-slate-800 py-3 rounded-lg items-center"
                                                >
                                                    <Text className="text-white font-semibold gap-1">
                                                        <Feather name="video" size={16} color="white" /> Vídeo
                                                    </Text>
                                                </TouchableOpacity>

                                            </View>
                                            {questao.exige_foto && questao.fotos.length == 0 && <Text className="text-red-600 font-medium">Foto obrigatória*</Text>}
                                            {questao.exige_video && <Text className="text-red-600 font-medium">Vídeo obrigatório*</Text>}
                                            {questao.exige_observacao && <Text className="text-red-600 font-medium">Observação obrigatória*</Text>}
                                        </View>
                                    )}
                                    {(questao.fotos.length > 0 || questao.videos.length > 0) &&
                                        <View className="mt-6 flex flex-row flex-wrap gap-6">
                                            {questao.fotos.map((uri: string, indexFoto: number) => {
                                                return (
                                                    <View key={indexFoto}>
                                                        <Pressable onPress={() => removeFile(index, indexFoto, "foto")} className="bg-red-600 w-8 h-8 rounded-full relative top-4 flex flex-row justify-center items-center left-8 z-10 self-center border-2 border-white"><Text className="text-white">X</Text></Pressable>
                                                        <Image className="w-28 h-28 rounded-lg" source={{ uri: uri }} key={indexFoto} />
                                                    </View>
                                                )
                                            })}
                                            {questao.videos.map((uri: string, indexVideo: number) => {
                                                return (
                                                    <View key={indexVideo}>
                                                        <Pressable onPress={() => removeFile(index, indexVideo, "video")} className="bg-red-600 w-8 h-8 rounded-full relative  flex flex-row justify-center items-center top-0 left-0 z-10 self-center border-2 border-white"><Text className="text-white">X</Text></Pressable>
                                                        <VideoItem
                                                            key={uri}
                                                            uri={uri}
                                                        />
                                                    </View>
                                                )
                                            })}
                                        </View>
                                    }
                                </View>
                            )
                        })}
                    </View>

                    <View className="mt-6 mb-10">
                        <Button onPress={() => handleSubmit()} disabled={isSubmitting} class="bg-blue-600 rounded-2xl">
                            <Text className="text-white font-bold text-lg">{isSubmitting ? 'ENVIANDO...' : 'ENVIAR'}</Text>
                        </Button>
                    </View>
                </ScrollView>
            </SafeAreaView>
            <Modal
                visible={modalEquipaments}
                onRequestClose={() => setModalEquipaments(false)}
                animationType="slide"
                transparent={true}
            >
                <View className="bg-slate-100 flex-1">
                    <View className="flex flex-row items-center justify-between m-6 mb-10">
                        <Text className="text-lg font-medium">Escolha um equipamento abaixo</Text>
                        <AntDesign onPress={() => setModalEquipaments(false)} name="close" size={18} color="black" />
                    </View>
                    <TextInput placeholder="Procurar equipamento" className="border border-gray-400 rounded-lg p-3 mx-6 text-gray-800" value={searchEquipment} onChangeText={text => setSearchEquipment(text)} />
                    <ScrollView className="mt-6 px-6">
                        {equipments?.map((e, index) => {
                            return (
                                <Pressable onPress={() => [setEquipment(e.descricao), setModalEquipaments(false)]} className={`py-3 px-4 rounded-lg ${index % 2 == 0 ? 'bg-slate-200' : 'bg-transparent'}`} key={index}>
                                    <Text className="text-slate-700 font-semibold">{e.descricao}</Text>
                                </Pressable>
                            )
                        })}
                    </ScrollView>
                </View>
            </Modal>
            <Modal
                visible={modalMotivoNC}
                onRequestClose={() => setModalMotivoNC(false)}
                animationType="slide"
                transparent={true}
            >
                <View className="bg-slate-100 flex-1">
                    <View className="flex flex-row items-center justify-between m-6 mb-10">
                        <Text className="text-lg font-medium">Motivo da não conformidade</Text>
                        <AntDesign onPress={() => setModalMotivoNC(false)} name="close" size={18} color="black" />
                    </View>
                    <View className="flex flex-col px-6 py-2">
                        <Pressable onPress={() => !questaoSelecionada ? null : [atualizarQuestao(questaoSelecionada.id, { motivo: 'Desvio' }), setModalMotivoNC(false)]} className="bg-slate-200 py-2 px-4 rounded-lg">
                            <Text className="text-slate-700 font-medium text-md">Desvio</Text>
                        </Pressable>
                        <Pressable onPress={() => !questaoSelecionada ? null : [atualizarQuestao(questaoSelecionada.id, { motivo: 'Interdição' }), setModalMotivoNC(false)]} className="py-2 px-4 rounded-lg">
                            <Text className="text-slate-700 font-medium text-md">Interdição</Text>
                        </Pressable>
                        <Pressable onPress={() => !questaoSelecionada ? null : [atualizarQuestao(questaoSelecionada.id, { motivo: 'Notificação' }), setModalMotivoNC(false)]} className="bg-slate-200 py-2 px-4 rounded-lg">
                            <Text className="text-slate-700 font-medium text-md">Notificação</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );

}