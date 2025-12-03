import api from "@/api/api";
import { CreatePresencaDto } from "./dto/create-presenca.dto";

export interface PresencaResponse {
    id: number;
    eventoId: number;
    pessoaId: number;
    pessoa: {
        id: number;
        nome: string;
        codigo: string;
    };
    dataCriacao: Date;
    latitude?: number;
    longitude?: number;
}

async function createPresenca(presenca: CreatePresencaDto) {
    const res = await api.post("/presenca", presenca);

    return res.data;
}

async function getPresencasByEvento(
    eventoId: number,
): Promise<PresencaResponse[]> {
    const res = await api.get(`/presenca?eventoId=${eventoId}`);
    return res.data;
}

export const PresencaService = {
    createPresenca,
    getPresencasByEvento,
};
