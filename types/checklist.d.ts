export interface ChecklistProps {
    uuid?: string | null,
    modelo?: string | null,
    id_obra?: number | null,
    usuario_criador?: string | null,
    usuario_editor?: string | null,
    localizacao?: string | null,
    data_hora_criacao?: string | null,
    data_hora_edicao?: string | null,
    respostas?: ChecklistAnswersProps[] | null,
    status?: number | null,
    createdAt?: string | null,
    updatedAt?: string | null
}

export interface ChecklistAnswersProps {
    descricao: string | null,
    resposta: "C" | "NC" | "NA" | null,
    observacao?: string | null,
    fotos: string[] | null,
    videos: string[] | null
}