import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView, TextInput, TouchableOpacity} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import api from "../services/api";
// import { router, useLocalSearchParams } from "expo-router";
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

type Foto = {
  uri: string;
};

type Questao = { 
    id: string;
    descricao: string;
    resposta?: 'C' | 'NC' | 'NA' | '';
    observacao?: string;
    fotos?: Foto[];
    videos?: Foto[];
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

let nomeUsuario:any = '';

export default function FormChecklist() {
    
    const [questoes, setQuestoes] = useState<Questao[]>([]);

    const { perguntasDoModelo, nomeModelo, idObra } = useLocalSearchParams();
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
        console.log("Perguntas id obra: ", idObra);

        const parsedPerguntas = JSON.parse(perguntasDoModelo as string || '[]');

        const inicial = parsedPerguntas.map((p:any, index: number) => ({
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
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
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
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.7,
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

    //1: Aberta, 2: Em andamento, 3: Resolvida, 4: Fechada
    const montarPayload = () => {
        return {
            uuid: '123', // pode vir de lib depois
            modelo: nomeModelo,
            id_obra: idObra,
            usuario_criador: nomeUsuario,
            localizacao: localizacao,
            data_hora_criacao: new Date().toISOString(),
            respostas: questoes.map((q) => ({
                id: q.id,
                descricao: q.descricao,
                resposta: q.resposta,
                observacao: q.observacao
                // 👇 NÃO coloca fotos aqui
            })),
            status: 1
        };
    };

    const formularioValidoNC = () => {
        //valida se questoes com resposta 'NC' tem observação preenchida
        return questoes.every((q) => {
            if (q.resposta === 'NC') {
            return q.observacao && q.observacao.trim() !== '';
            }
            return true;
        });
    };

    async function handleSubmit() {
        console.log('Checklist a ser enviada:', questoes);
        
        //se form não é valido
        if (!formularioValidoNC()) {
            alert('Preencha a observação para itens não conformes');
            return;
        }

        const formData = new FormData();
        // const payload = montarPayload();

        // 1. manda o JSON inteiro
        // formData.append('data', JSON.stringify(payload));
        formData.append('modelo', nomeModelo as string);
        formData.append('id_obra', idObra as string);
        formData.append('usuario_criador', nomeUsuario as string);
        formData.append('localizacao', localizacao as string);
        formData.append('data_hora_criacao', new Date().toISOString());
        formData.append('status', '1');
        
        // 2. manda as fotos separadas
        questoes.forEach((q) => {
            q.fotos?.forEach((foto, i) => {
            formData.append(`fotos_${q.id}`, {
                uri: foto.uri,
                name: `foto_${i}.jpg`,
                type: 'image/jpeg'
            } as any);
            });
        });

        formData.append('respostas', JSON.stringify(questoes.map((q) => ({
                id: q.id,
                descricao: q.descricao,
                resposta: q.resposta,
                observacao: q.observacao,
                fotos: q.fotos?.map((f) => f.uri.split('/').pop() || '') || [] //guarda apenas nome arquivo.
            })))
        );
            
        console.log('FormData preparado para envio:', formData);

        setIsSubmitting(true);
        try {
            await api.post('/v1/checklist', formData);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Checklist enviada', ToastAndroid.SHORT);
            } else {
                Alert.alert('Sucesso', 'Checklist enviada');
            }
            router.navigate('/minhas-checklists');
        } catch (error) {
            console.error(error);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Erro ao enviar checklist', ToastAndroid.SHORT);
            } else {
                Alert.alert('Erro', 'Erro ao enviar checklist');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <View className="flex-1">
            <StatusBar
            backgroundColor="#1976D2"
            translucent={false}
            />
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-white p-4">
                <Text className="text-2xl font-bold mb-6 mt-2">{nomeModelo}</Text>
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
                            <TouchableOpacity className="flex-1 bg-blue-600 py-3 rounded-lg items-center"  onPress={() => selecionarImagem(questao.id)}>
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