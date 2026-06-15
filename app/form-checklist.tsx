import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView, TextInput, TouchableOpacity } from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import api from "../services/api";
// import { router, useLocalSearchParams } from "expo-router";
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Feather, FontAwesome } from "@expo/vector-icons";

type Questao = {
    descricao: string,
    exige_foto: boolean,
    exige_observacao: boolean,
    exige_video: boolean,
    fotos: { uri: string }[],
    id: string,
    observacao: string,
    resposta: "C" | "NC" | "NA" | "",
    videos: { uri: string }[]
}

type Props = {
    questoesIniciais: Questao[];
}

type Checklist = {
    uuid: string;
    modelo: string;
    id_obra: string;
    usuario_criador: string;
    localizacao: string;
    data_hora_criacao: string;
    respostas: Questao[];
    status: number;
}

async function generateUUID(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

let nomeUsuario: any = '';

export default function FormChecklist() {

    const [questoes, setQuestoes] = useState<Questao[]>([]);

    const { perguntasDoModelo, nomeModelo, objetivoModelo, exigeEquipamento, idObra } = useLocalSearchParams();
    const [localizacao, setLocalizacao] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        //below get a asyncstorage var called nomeUsuario and print it in the console
        const getNomeUsuario = async () => {
            nomeUsuario = await AsyncStorage.getItem("nomeUsuario");
            console.log("Nome do usuário logado: ", nomeUsuario);
        }
        getNomeUsuario();
    }, []);

    useEffect(() => {

        console.log("modelo recebido: ", nomeModelo);
        console.log("Objetivo do modelo: ", objetivoModelo);
        console.log("Exige equipamento: ", exigeEquipamento);
        console.log("Perguntas id obra: ", idObra);

        const parsedPerguntas = JSON.parse(perguntasDoModelo as string || '[]');

        const inicial = parsedPerguntas.map((p: any, index: number) => ({
            id: index,
            descricao: p.descricao,
            resposta: '',
            observacao: '',
            fotos: [],
            videos: [],
            exige_foto: p.exige_foto,
            exige_video: p.exige_video,
            exige_observacao: p.exige_observacao,
        }));

        setQuestoes(inicial);
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
                            fotos: res.assets.map(a => ({ uri: a.uri }))
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
                            fotos: res.assets.map(a => ({ uri: a.uri }))
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
                            videos: res.assets.map(a => ({ uri: a.uri }))
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
                            videos: res.assets.map(a => ({ uri: a.uri }))
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

    //1: Aberta, 2: Em andamento, 3: Resolvida, 4: Fechada
    // const montarPayload = () => {
    //     return {
    //         uuid: '123', // pode vir de lib depois
    //         modelo: nomeModelo,
    //         id_obra: idObra,
    //         usuario_criador: nomeUsuario,
    //         localizacao: localizacao,
    //         data_hora_criacao: new Date().toISOString(),
    //         respostas: questoes.map((q) => ({
    //             id: q.id,
    //             descricao: q.descricao,
    //             resposta: q.resposta,
    //             observacao: q.observacao
    //             // 👇 NÃO coloca fotos aqui
    //         })),
    //         status: 1
    //     };¥
    // };

    const formularioValidoNC = () => {
        //valida se questoes com resposta 'NC' tem observação preenchida, 
        return questoes.every((q) => {
            if (q.resposta === 'NC') {
                return q.observacao && q.observacao.trim() !== '';
            }
            //TODO: fazer validacao exigeEquipamento.
            return true;
        });
    };

    async function handleSubmit() {

        // console.log('Checklist a ser enviada:', questoes);

        //se form não é valido
        // if (!formularioValidoNC()) {
        //     alert('Preencha a observação para itens não conformes');
        //     return;
        // }

        //Verificando se todas perguntas foram respondidas
        const perguntasNaoRespondidas = questoes.filter(q => q.resposta == "");
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

        const formData = new FormData();
        // const payload = montarPayload();

        // 1. manda o JSON inteiro
        // formData.append('data', JSON.stringify(payload));
        const uuid = await generateUUID();
        formData.append('uuid', uuid);
        formData.append('modelo', nomeModelo as string);
        formData.append('id_obra', idObra as string);
        formData.append('usuario_criador', nomeUsuario as string);
        formData.append('localizacao', localizacao as string);
        formData.append('data_hora_criacao', new Date().toISOString());
        formData.append('status', '1');

        // 2. manda as fotos e vídeos separadas
        questoes.forEach((q) => {
            q.fotos?.forEach((foto, i) => {
                const fileName = `${uuid}_foto_${q.id}_${i}.jpg`;

                formData.append(`fotos_${q.id}`, {
                    uri: foto.uri,
                    name: fileName,
                    type: 'image/jpeg'
                } as any);
            });

            q.videos?.forEach((video, i) => {
                const fileName = `${uuid}_video_${q.id}_${i}.mp4`;

                formData.append(`videos_${q.id}`, {
                    uri: video.uri,
                    name: fileName,
                    type: 'video/mp4'
                } as any);
            });
        });

        formData.append('respostas', JSON.stringify(
            questoes.map((q) => ({
                id: q.id,
                descricao: q.descricao,
                resposta: q.resposta,
                observacao: q.observacao,
                fotos: q.fotos?.map((_, i) => `${uuid}_foto_${q.id}_${i}.jpg`) || [],
                videos: q.videos?.map((_, i) => `${uuid}_video_${q.id}_${i}.mp4`) || []
            }))
        ));

        console.log('FormData preparado para envio:', formData);

        setIsSubmitting(true);
        try {
            //http://10.10.2.200:3005/api/v1/checklist/
            await api.post('checklist/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (Platform.OS === 'android') {
                ToastAndroid.show('Checklist enviada', ToastAndroid.SHORT);
            } else {
                Alert.alert('Sucesso', 'Checklist enviada');
            }
            router.back();
        } catch (error: any) {
            console.error(error.response || error);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Erro ao enviar checklist', ToastAndroid.SHORT);
            } else {
                Alert.alert('Erro', 'Erro ao enviar checklist');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="flex-1">
            <StatusBar
                backgroundColor="#1976D2"
                translucent={false}
            />
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView className="flex-1 bg-white px-4">
                    <Text className="text-2xl font-semibold mt-6">{nomeModelo}</Text>
                    {/* <Text className="text-md font-bold mb-6 text-gray-400">{objetivoModelo}</Text> */}
                    <Text className="text-md font-bold mb-6 text-gray-400">Preencha as informações</Text>

                    {/* Need a loading bar based number of questions asked to 100% */}
                    <View className="mb-4">
                        <Text className="text-right text-xs text-gray-500 mb-1">
                            {Math.round((questoes.filter(q => q.resposta).length / questoes.length * 100))}
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
                                className="border border-gray-300 rounded-lg p-3 text-gray-800"
                            />
                        </View>

                        {questoes.map((questao: any, index: any) => (
                            <View
                                key={index}
                                className="bg-white rounded-xl p-5 shadow-md border border-gray-200"
                            >
                                {/* TÍTULO */}
                                <Text className="text-lg font-bold text-gray-800 mb-4">
                                    {questao.descricao}
                                </Text>

                                {/* BOTÕES */}
                                <View className="flex-row justify-between gap-2 mb-3">

                                    <Pressable
                                        onPress={() => selecionarResposta(questao.id, 'C')}
                                        className={`flex-1 py-3 rounded-lg items-center ${questao.resposta === 'C'
                                            ? 'bg-green-600'
                                            : 'bg-green-200'
                                            }`}
                                    >
                                        <Text className="font-bold text-white">C</Text>
                                    </Pressable>


                                    <Pressable
                                        onPress={() => selecionarResposta(questao.id, 'NC')}
                                        className={`flex-1 py-3 rounded-lg items-center ${questao.resposta === 'NC'
                                            ? 'bg-red-600'
                                            : 'bg-red-200'
                                            }`}
                                    >
                                        <Text className="font-bold text-white">NC</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => selecionarResposta(questao.id, 'NA')}
                                        className={`flex-1 py-3 rounded-lg items-center ${questao.resposta === 'NA'
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

                                            {/* <Pressable
                            onPress={() => console.log('Adicionar Foto')}
                            className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                            >
                            <Text className="text-white font-semibold">
                                📷 Add Foto
                                <TextInput
                                    placeholder="URL da Foto"
                                    value={questao.foto}
                                    onChangeText={(text) =>
                                        atualizarQuestao(questao.id, { foto: text })
                                    }
                                    className="border border-gray-300 rounded-lg p-3 text-gray-800"
                                />

                            </Text>
                            </Pressable> */}
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
                                        {questao.exige_foto && <Text className="text-red-600 font-medium">Foto obrigatória*</Text>}
                                        {questao.exige_video && <Text className="text-red-600 font-medium">Vídeo obrigatório*</Text>}
                                        {questao.exige_observacao && <Text className="text-red-600 font-medium">Observação obrigatória*</Text>}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>

                    <View className="mt-6 mb-10">
                        <Button onPress={() => handleSubmit()} disabled={isSubmitting} class="bg-green-600">
                            <Text className="text-white font-bold">{isSubmitting ? 'Enviando...' : 'Enviar'}</Text>
                        </Button>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );

}