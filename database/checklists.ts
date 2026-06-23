import { createAndUpdateData, deleteData, readData } from ".";
import { ChecklistProps } from "../types/checklist";

const key = 'checklists';

//Criar ou atualizar todos
export async function createOrUpdateChecklistsOffline(checklists: ChecklistProps[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(checklists));
    return result;
}

//Criar ou atualizar apenas um
export async function createOrUpdateChecklistOffline(uuid: string | undefined, checklistsData: ChecklistProps): Promise<boolean | undefined> {
    const resultChecklists = await getChecklistsOffline();
    let checklists: ChecklistProps[] = [];
    if (resultChecklists) {
        checklists = resultChecklists;
    }

    if (uuid) { //update
        if (checklists.length == 0) {
            checklists.push(checklistsData);
        }
        else {
            const index = checklists.findIndex(c => c.uuid == uuid);
            checklists[index] = checklistsData;
        }
    }
    else { //create
        checklists.push(checklistsData);
    }

    const result = await createAndUpdateData(key, JSON.stringify(checklists));
    return result;
}

//Obter todos os checklists
export async function getChecklistsOffline(): Promise<ChecklistProps[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if (result == null) {
        return []
    }
}

//Obter apenas um
export async function getChecklistOffline(uuid: string): Promise<ChecklistProps | undefined> {
    const result = await readData(key);
    if (result) {
        const checklists: ChecklistProps[] = JSON.parse(result);
        const checklist = checklists.find(c => c.uuid == uuid);
        return checklist;
    }
}

//Deletar todos
export async function deleteChecklistsOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}

//Deletar apenas um
export async function deleteChecklistOffline(uuid: string): Promise<boolean | undefined> {
    const result = await getChecklistsOffline();
    if (result) {
        let checklists: ChecklistProps[] = result;
        checklists = checklists.filter(c => c.uuid != uuid);
        await createOrUpdateChecklistsOffline(checklists);
        return true;
    }
}