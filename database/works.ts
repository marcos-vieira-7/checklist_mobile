import { createAndUpdateData, readData } from ".";
import { WorkProps } from "../types/work";

const key = 'works';

//Criar ou atualizar todas obras
export async function createOrUpdateWorksOffline(works: WorkProps[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(works));
    return result;
}

//Obter todos as obras
export async function getWorksOffline(): Promise<WorkProps[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if (result == null) {
        return []
    }
}
