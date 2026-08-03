
import { createAndUpdateData, deleteData, readData } from ".";
import { RightRefusalProps } from "../types/right-refusal";

const key = 'right_refusal';

function parseRightRefusals(value: string | null | undefined): RightRefusalProps[] {
    /* essa funcao é usada para garantir que o valor lido do armazenamento local seja sempre um
       array de RightRefusalProps, mesmo que o valor seja nulo ou indefinido. 
       Se o valor for nulo ou indefinido, a função retorna um array vazio. 
       Se o valor for uma string JSON válida, a função tenta analisá-lo
       e retorna um array de RightRefusalProps. 
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

export async function createOrUpdateRightRefusalOffline(right_refusal: RightRefusalProps): Promise<boolean | undefined> {
    const existing = await readData(key);
    const currentItems = parseRightRefusals(existing);
    const itemToSave = {
        ...right_refusal,
        uuid: right_refusal.uuid || `right-refusal-${Date.now()}-${currentItems.length + 1}`,
    };

    currentItems.push(itemToSave);
    const result = await createAndUpdateData(key, JSON.stringify(currentItems));
    return result;
}

export async function getRightRefusalOffline(): Promise<RightRefusalProps[] | undefined> {
    const result = await readData(key);
    const parsed = parseRightRefusals(result);

    if (parsed.length > 0) {
        return parsed;
    }

    return undefined;
}

export async function deleteRightRefusalOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}

export async function removeRightRefusalOffline(right_refusal: RightRefusalProps): Promise<boolean | undefined> {
    /* Essa função remove um item específico do armazenamento local com base no uuid ou na comparação de objetos. */
    const existing = await readData(key);
    const currentItems = parseRightRefusals(existing);
    const filteredItems = currentItems.filter((item) => {
        if (item.uuid && right_refusal.uuid) {
            return item.uuid !== right_refusal.uuid;
        }

        return JSON.stringify(item) !== JSON.stringify(right_refusal);
    });

    const result = await createAndUpdateData(key, JSON.stringify(filteredItems));
    return result;
}
