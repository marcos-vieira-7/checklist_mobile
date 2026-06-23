export interface ActivityAttributes {
    uuid: string;
    usuario_criador: string;
    usuario_editor?: string | undefined;
    status: number; // 1: Aberta, 2: Em andamento, 3: Resolvida, 4: Fechada
    id_usuario_responsavel?: number | undefined; //Id do usuário que irá resolver essa não conformidade
    solucao_aplicada?: string | undefined;
    prazo_solucao: Date;
    id_obra: number;
    modelo: string;
    os?: string | undefined; //Número da ordem de serviço aberta para solucionar o problema
    descricao_pergunta: string;
    observacao_problema?: string | undefined;
    fotos?: string[] | undefined;
    videos?: string[] | undefined;
    localizacao?: string | undefined;
    data_hora_criacao: string;
    data_hora_edicao?: string | undefined;
}