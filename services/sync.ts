import { createOrUpdateCategoriesOffline } from "../database/categories";
import { deleteChecklistOffline, getChecklistsOffline } from "../database/checklists";
import { createOrUpdateEquipmentsOffline } from "../database/equipments";
import { createOrUpdateModelsOffline } from "../database/models";
import { createOrUpdateWorksOffline } from "../database/works";
import { getCategories } from "./categories";
import { sendChecklist } from "./checklists";
import { getEquipments } from "./equipments";
import { getModels } from "./models";
import { getAllWorks } from "./works";

export async function updateLocalDatabase() {

    //Atualizando obras
    const works = await getAllWorks();
    if (works) {
        await createOrUpdateWorksOffline(works);
    }

    //Atualizando categorias
    const categories = await getCategories();
    if (categories) {
        await createOrUpdateCategoriesOffline(categories);
    }

    //Atualizando modelos
    const models = await getModels();
    if (models) {
        await createOrUpdateModelsOffline(models);
    }

    //Atualizando equipamentos
    const equipments = await getEquipments();
    if (equipments) {
        await createOrUpdateEquipmentsOffline(equipments);
    }

}

export async function sendRegisters(): Promise<boolean> {

    //Enviando os checklists salvos localmente
    const checklists = await getChecklistsOffline();
    if (checklists) {
        for (const checklist of checklists) {
            const formData = new FormData();

            // console.log(checklist.respostas);
            // return true

            formData.append('uuid', checklist.uuid as string);
            formData.append('modelo', checklist.modelo as string);
            formData.append('id_obra', checklist.id_obra?.toString() as string);
            formData.append('usuario_criador', checklist.usuario_criador as string);
            formData.append('localizacao', checklist.localizacao as string);
            formData.append('data_hora_criacao', new Date(checklist.data_hora_criacao || "").toISOString() as string);
            formData.append('status', checklist.status?.toString() as string);
            formData.append('equipamento', checklist.equipamento as string);

            const questoes = checklist.respostas;
            console.log(questoes);
            if (questoes) {
                questoes.forEach((q) => {
                    q.fotos?.forEach((foto, i) => {
                        const fileName = `${checklist.uuid}_foto_${q.id}_${i}.jpg`;

                        formData.append(`fotos_${q.id}`, {
                            uri: foto,
                            name: fileName,
                            type: 'image/jpeg'
                        } as any);
                    });

                    q.videos?.forEach((video, i) => {
                        const fileName = `${checklist.uuid}_video_${q.id}_${i}.mp4`;

                        formData.append(`videos_${q.id}`, {
                            uri: video,
                            name: fileName,
                            type: 'video/mp4'
                        } as any);
                    });
                });

                formData.append('respostas', JSON.stringify(
                    questoes.map((q) => ({
                        id: q.id,
                        descricao: q.descricao,
                        resposta: q.resposta,
                        observacao: q.observacao,
                        fotos: q.fotos?.map((_, i) => `${checklist.uuid}_foto_${q.id}_${i}.jpg`) || [],
                        videos: q.videos?.map((_, i) => `${checklist.uuid}_video_${q.id}_${i}.mp4`) || []
                    }))
                ));
            }

            console.log(formData);

            const result = await sendChecklist(formData);
            console.log({ result });
            if (result) { //Enviou com sucesso
                console.log("Chamou deleteChecklistOffline");
                await deleteChecklistOffline(checklist.uuid as string);
                return true;
            }
            return false;
        }
    }
    return false;
}