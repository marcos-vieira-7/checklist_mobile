
import { createAndUpdateData, deleteData, readData } from ".";
import { RightRefusalProps } from "../types/right-refusal";

const key = 'right_refusal';

export async function createOrUpdateRightRefusalOffline(right_refusal: RightRefusalProps): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(right_refusal));
    return result;
}

export async function getRightRefusalOffline(): Promise<RightRefusalProps | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if(result == null){
        return undefined
    }
}

export async function deleteRightRefusalOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}
