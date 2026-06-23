export interface EquipmentProps {
    id: number,
    descricao: string,
    codigo: string,
    id_obra: number,
    status: boolean,
    createdAt?: string | undefined,
    updatedAt?: string | undefined
}