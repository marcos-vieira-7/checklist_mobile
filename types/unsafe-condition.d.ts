
export type UnsafeConditionPhoto = {
  uri: string;
  name?: string;
  type?: string;
};

export interface UnsafeConditionProps {

    uuid?: string | undefined,
    responsavel?: string | undefined;
    testemunha: number | undefined;
    testemunha_nome?: string | undefined;
    datetime: any | undefined;
    local?: string | undefined;
    descricao: string | undefined;
    fotos?: UnsafeConditionPhoto[] | undefined;

}