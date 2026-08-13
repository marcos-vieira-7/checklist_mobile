
import { createAndUpdateData, deleteData, readData } from ".";
import { UnsafeConditionProps } from "../types/unsafe-condition";

const key = 'unsafe_condition';

function parseUnsafeConditions(value: string | null | undefined): UnsafeConditionProps[] {
    /* essa funcao é usada para garantir que o valor lido do armazenamento local seja sempre um
       array de UnsafeConditionProps, mesmo que o valor seja nulo ou indefinido. 
       Se o valor for nulo ou indefinido, a função retorna um array vazio. 
       Se o valor for uma string JSON válida, a função tenta analisá-lo
       e retorna um array de UnsafeConditionProps. 
       Se a análise falhar, a função também retorna um array vazio.  */
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed;
        }

        return parsed ? [parsed] : [];
    } catch {
        return [];
    }
}

export async function createOrUpdateUnsafeConditionOffline(unsafe_condition: UnsafeConditionProps): Promise<boolean | undefined> {
    const existing = await readData(key);
    const currentItems = parseUnsafeConditions(existing);
    const itemToSave = {
        ...unsafe_condition,
        uuid: unsafe_condition.uuid || `unsafe_condition-${Date.now()}-${currentItems.length + 1}`,
    };

    currentItems.push(itemToSave);
    const result = await createAndUpdateData(key, JSON.stringify(currentItems));
    return result;
}

export async function getUnsafeConditionOffline(): Promise<UnsafeConditionProps[] | undefined> {
    const result = await readData(key);
    const parsed = parseUnsafeConditions(result);

    if (parsed.length > 0) {
        return parsed;
    }

    return undefined;
}

export async function deleteUnsafeConditionOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}

export async function removeUnsafeConditionOffline(unsafe_condition: UnsafeConditionProps): Promise<boolean | undefined> {
    /* Essa função remove um item específico do armazenamento local com base no uuid ou na comparação de objetos. */
    const existing = await readData(key);
    const currentItems = parseUnsafeConditions(existing);
    const filteredItems = currentItems.filter((item) => {
        if (item.uuid && unsafe_condition.uuid) {
            return item.uuid !== unsafe_condition.uuid;
        }

        return JSON.stringify(item) !== JSON.stringify(unsafe_condition);
    });

    const result = await createAndUpdateData(key, JSON.stringify(filteredItems));
    return result;
}
