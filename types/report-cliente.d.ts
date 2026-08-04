export type ReportClientePhoto = {
  uri: string;
  name?: string;
  type?: string;
};

export type ReportClienteProps = {
  uuid: string;
  tipo: 'interdição' | 'notificação';
  obra: number;
  responsavel_frente_servico: number;
  tecnico_seguranca_responsavel: number;
  observacoes: string;
  fotos: ReportClientePhoto[];
};