import { createAndUpdateData, readData } from ".";
import { UserProps } from "../types/user";

const key = 'users';

export async function createOrUpdateUsersOffline(users: UserProps[]): Promise<boolean | undefined> {
    const result = await createAndUpdateData(key, JSON.stringify(users));
    return result;
}

export async function getUsersOffline(): Promise<UserProps[] | undefined> {
    const result = await readData(key);
    if (result) {
        return JSON.parse(result);
    }
    if(result == null){
        return []
    }
}