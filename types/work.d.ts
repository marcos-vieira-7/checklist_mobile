export interface WorkProps {
    id?: number | undefined;
    descricao: string;
    centros_custo?: string | undefined;
    locais_estoque?: string | undefined;
    filial_id?: number | undefined;
    coligada_id?: number | undefined;
    endereco?: string | undefined;
    responsavel?: number | undefined;
    status: boolean;
}

export interface WorkFileProps {
    id: number;
    obra_id: number;
    descricao: string;
    categoria: 'geral' | 'art';
    versao: string;
    uri: string;
    createdAt: string;
    updatedAt: string;
}