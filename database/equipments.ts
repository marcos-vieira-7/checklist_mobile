import { createAndUpdateData, readData } from ".";
import { EquipmentProps } from "../types/equipment";

const key = 'equipments';

export async function createOrUpdateEquipmentsOffline(equipments: EquipmentProps[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(equipments));
    return result;
}

export async function getEquipmentsOffline(): Promise<EquipmentProps[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if(result == null){
        return []
    }
}