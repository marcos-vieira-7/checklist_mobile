import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView, TextInput, TouchableOpacity} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'; 

type Foto = {
  uri: string;
};

type Questao = {
    id: string;
    descricao: string;
    resposta?: 'C' | 'NC' | 'NA' | '';
    observacao?: string;
    fotos?: Foto[];
    videos?: string[];
}

type Props = {
    questoesIniciais: Questao[];
}

export default function FormChecklist() {

    const [questoes, setQuestoes] = useState<Questao[]>([]);

    const { perguntasDoModelo } = useLocalSearchParams();
    // const perguntas = JSON.parse(perguntasDoModelo as string);
    // const perguntas = JSON.parse(perguntasDoModelo as string || '[]');

    useEffect(() => {
        const parsed = JSON.parse(perguntasDoModelo as string || '[]');

        const inicial = parsed.map((p:any, index: number) => ({
            id: index,
            descricao: p.descricao,
            resposta: '',
            observacao: '',
            fotos: [],
            videos: []
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit() {

        console.log('Checklist a ser enviada:', questoes);
        // setIsSubmitting(true);
        // try {
        //     const payload = { questoes };
        //     await api.post('/checklists', payload);
        //     if (Platform.OS === 'android') {
        //         ToastAndroid.show('Checklist enviada', ToastAndroid.SHORT);
        //     } else {
        //         Alert.alert('Sucesso', 'Checklist enviada');
        //     }
        //     router.navigate('/minhas-checklists');
        // } catch (error) {
        //     console.error(error);
        //     if (Platform.OS === 'android') {
        //         ToastAndroid.show('Erro ao enviar checklist', ToastAndroid.SHORT);
        //     } else {
        //         Alert.alert('Erro', 'Erro ao enviar checklist');
        //     }
        // } finally {
        //     setIsSubmitting(false);
        // }
    }

    const tirarFoto = async (id: string) => {
        const res = await ImagePicker.launchCameraAsync();

        if (!res.canceled) {
            atualizarQuestao(id, {
            fotos: [
                {
                uri: res.assets[0].uri
                }
            ]
            });
        }
    };


    return(
        <View className="flex-1">
            <StatusBar
            backgroundColor="#1976D2"
            translucent={false}
            />
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white p-4">
                <Text className="text-2xl font-bold mb-6 mt-2">CheckList</Text>
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
                        className={`flex-1 py-3 rounded-lg items-center ${
                            questao.resposta === 'C'
                            ? 'bg-green-600'
                            : 'bg-green-200'
                        }`}
                        >
                        <Text className="font-bold text-white">C</Text>
                        </Pressable>


                        <Pressable
                        onPress={() => selecionarResposta(questao.id, 'NC')}
                        className={`flex-1 py-3 rounded-lg items-center ${
                            questao.resposta === 'NC'
                            ? 'bg-red-600'
                            : 'bg-red-200'
                        }`}
                        >
                        <Text className="font-bold text-white">NC</Text>
                        </Pressable>

                        <Pressable
                        onPress={() => selecionarResposta(questao.id, 'NA')}
                        className={`flex-1 py-3 rounded-lg items-center ${
                            questao.resposta === 'NA'
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
                            className="border border-gray-300 rounded-lg p-3 min-h-[80px] text-gray-800"
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
                            <TouchableOpacity onPress={() => tirarFoto(questao.id)}>
                            <Text>📸 Foto</Text>
                            </TouchableOpacity>

                            <Pressable
                            onPress={() => console.log('Adicionar Vídeo')}
                            className="flex-1 bg-purple-600 py-3 rounded-lg items-center"
                            >
                            <Text className="text-white font-semibold">
                                🎥 Add Vídeo
                            </Text>
                            </Pressable>

                        </View>

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