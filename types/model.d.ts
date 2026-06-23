export interface ModelProps {
    id: number,
    nome: string,
    versao?: string | undefined,
    objetivo?: string | undefined,
    perguntas: string,
    id_obra: number,
    exige_equipamento: boolean
}