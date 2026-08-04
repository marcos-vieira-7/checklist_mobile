
import { createAndUpdateData, deleteData, readData } from ".";
import { ReportClientePhoto, ReportClienteProps } from "../types/report-cliente";

const key = 'report_cliente';

function normalizePhotos(fotos: unknown): ReportClientePhoto[] {
    if (!Array.isArray(fotos)) {
        return [];
    }

    return fotos.map((foto) => {
        if (typeof foto === 'string') {
            return { uri: foto };
        }

        if (foto && typeof foto === 'object') {
            const item = foto as Record<string, unknown>;
            return {
                uri: typeof item.uri === 'string' ? item.uri : '',
                name: typeof item.name === 'string' ? item.name : undefined,
                type: typeof item.type === 'string' ? item.type : undefined,
            };
        }

        return { uri: '' };
    }).filter((foto) => foto.uri);
}

function parseReportClientes(value: string | null | undefined): ReportClienteProps[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        const list = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];

        return list.map((item: any) => ({
            ...item,
            fotos: normalizePhotos(item?.fotos),
        }));
    } catch {
        return [];
    }
}

export async function createOrUpdateReportClientOffline(reportClient: ReportClienteProps): Promise<boolean | undefined> {
    const existing = await readData(key);
    const currentItems = parseReportClientes(existing);
    const itemToSave = {
        ...reportClient,
        fotos: normalizePhotos(reportClient.fotos),
        uuid: reportClient.uuid || `report-cliente-${Date.now()}-${currentItems.length + 1}`,
    };

    const existingIndex = currentItems.findIndex((item) => item.uuid === itemToSave.uuid);

    const updatedItems = existingIndex >= 0
        ? currentItems.map((item, index) => index === existingIndex ? itemToSave : item)
        : [...currentItems, itemToSave];

    const result = await createAndUpdateData(key, JSON.stringify(updatedItems));
    return result;
}

export async function getReportClientOffline(): Promise<ReportClienteProps[] | undefined> {
    const result = await readData(key);
    const parsed = parseReportClientes(result);

    if (parsed.length > 0) {
        return parsed;
    }

    return undefined;
}

export async function deleteReportClientOffline(): Promise<boolean | undefined> {
    const result = await deleteData(key);
    return result;
}

export async function removeReportClientOffline(reportClient: ReportClienteProps): Promise<boolean | undefined> {
    const existing = await readData(key);
    const currentItems = parseReportClientes(existing);
    const filteredItems = currentItems.filter((item) => {
        if (item.uuid && reportClient.uuid) {
            return item.uuid !== reportClient.uuid;
        }

        return JSON.stringify(item) !== JSON.stringify(reportClient);
    });

    const result = await createAndUpdateData(key, JSON.stringify(filteredItems));
    return result;
}
