import { useState, useEffect } from "react";
import { Alert, Text, View, Image, Pressable, ToastAndroid, Platform, StatusBar, ScrollView, TextInput} from "react-native";
import Input from "./components/Input";
import Button from "./components/Button";
import { api } from "../utils/axios";
// import { router, useLocalSearchParams } from "expo-router";
import { router } from 'expo-router';

type Questao = {
    id: string;
    titulo: string;
    resposta?: 'C' | 'NC' | 'NA' | '';
    observacao?: string;
    fotos?: string[];
    videos?: string[];
}

type Props = {
    questoesIniciais: Questao[];
}

export default function FormChecklist() {

    const [questoes, setQuestoes] = useState<Questao[]>([
        { id: '1', titulo: 'O colaborador está usando EPI?', resposta: ''},
        { id: '2', titulo: 'O extintor está dentro da validade?', resposta: ''},
        { id: '3', titulo: 'A sinalização de segurança está visível?', resposta: ''},
    ]);

    // const questoes = [
    //     { id: 1, titulo: 'O colaborador está usando EPI?', resposta: ''},
    //     { id: 2, titulo: 'O extintor está dentro da validade?', resposta: ''},
    //     { id: 3, titulo: 'A sinalização de segurança está visível?', resposta: ''},
    // ]

    function atualizarQuestao(id: string, dados: Partial<Questao>) {
        setQuestoes((prev) =>
        prev.map((q) =>
            q.id === id ? { ...q, ...dados } : q
        )
        );
    }

    function selecionarResposta(id: string, valor: 'C' | 'NC' | 'NA') {
        atualizarQuestao(id, {
        resposta: valor,
        ...(valor !== 'NC' && {
            observacao: undefined,
            fotos: [],
            videos: [],
        }),
        });
    }

    return(
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-6 mt-16">CheckList</Text>
            <Text className="text-md font-bold mb-6 text-gray-400">Preencha as informações</Text>
            
            <View className="gap-4">
            {questoes.map((questao) => (
                <View
                key={questao.id}
                className="bg-white rounded-xl p-5 shadow-md border border-gray-200"
                >
                {/* TÍTULO */}
                <Text className="text-lg font-bold text-gray-800 mb-4">
                    {questao.titulo}
                </Text>

                {/* BOTÕES */}
                <View className="flex-row justify-between gap-2 mb-3">

                    {/* C */}
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

                    {/* NC */}
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

                    {/* NA */}
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

                    {/* Campo Observação */}
                    <TextInput
                        placeholder="Descreva o problema..."
                        multiline
                        value={questao.observacao}
                        onChangeText={(text) =>
                        atualizarQuestao(questao.id, { observacao: text })
                        }
                        className="border border-gray-300 rounded-lg p-3 min-h-[80px] text-gray-800"
                    />

                    {/* Botões Foto e Vídeo */}
                    <View className="flex-row gap-3">

                        <Pressable
                        onPress={() => console.log('Adicionar Foto')}
                        className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                        >
                        <Text className="text-white font-semibold">
                            📷 Add Foto
                        </Text>
                        </Pressable>

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
        </ScrollView>
    );

}