import { createAndUpdateData, deleteData, readData } from ".";
import { ActivityAttributes } from "../types/activity";

const key = 'activities';

//Criar ou atualizar todas atividades
export async function createOrUpdateActivitiesOffline(activities: ActivityAttributes[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(activities));
    return result;
}

//Criar ou atualizar apenas uma atividade
export async function createOrUpdateActivityOffline(uuid: string | undefined, activityData: ActivityAttributes): Promise<boolean | undefined> {
    const resultActivities = await getActivitiesOffline();
    let activities: ActivityAttributes[] = [];
    if (resultActivities) {
        activities = resultActivities;
    }

    if (uuid) { //update
        if (activities.length == 0) {
            activities.push(activityData);
        }
        else {
            const index = activities.findIndex(c => c.uuid == uuid);
            activities[index] = activityData;
        }
    }
    else { //create
        activities.push(activityData);
    }

    const result = await createAndUpdateData(key, JSON.stringify(activities));
    return result;
}

//Obter todos as atividades
export async function getActivitiesOffline(): Promise<ActivityAttributes[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if (result == null) {
        return []
    }
}

//Obter apenas uma atividade
export async function getActivityOffline(uuid: string): Promise<ActivityAttributes | undefined> {
    const result = await readData(key);
    if (result) {
        const activities: ActivityAttributes[] = JSON.parse(result);
        const checklist = activities.find(c => c.uuid == uuid);
        return checklist;
    }
}

//Deletar todas atividade
export async function deleteActivitiesOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}

//Deletar apenas uma atividade
export async function deleteActivityOffline(uuid: string): Promise<boolean | undefined> {
    const result = await getActivitiesOffline();
    if (result) {
        let activities: ActivityAttributes[] = result;
        activities = activities.filter(c => c.uuid != uuid);
        await createOrUpdateActivitiesOffline(activities);
        return true;
    }
}