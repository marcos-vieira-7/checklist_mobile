import { createAndUpdateData, deleteData, readData } from ".";
import { CategoryProps } from "../types/category";

const key = 'categories';

export async function createOrUpdateCategoriesOffline(categories: CategoryProps[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(categories));
    return result;
}

export async function getCategoriesOffline(): Promise<CategoryProps[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if(result == null){
        return []
    }
}

export async function deleteCategoriesOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}