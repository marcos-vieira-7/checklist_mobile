import { createAndUpdateData, deleteData, readData } from ".";
import { ModelProps } from "../types/model";

const key = 'models';

export async function createOrUpdateModelsOffline(models: ModelProps[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(models));
    return result;
}

export async function getModelsOffline(): Promise<ModelProps[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if (result == null) {
        return [];
    }
}

export async function deleteModelsOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}