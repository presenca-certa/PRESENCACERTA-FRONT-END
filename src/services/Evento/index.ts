import api from "@/api/api";

export interface CreateEventoRequest {
    nome: string;
    dataInicio: Date;
    horaInicio: Date;
    horaFim: Date;
    turmas: number[];
    localizacaoId?: number;
}

export interface CreateBatchEventoRequest {
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    dayOfWeek: number;
    horaInicio: Date;
    horaFim: Date;
    turmas: number[];
    localizacaoId?: number;
}

export interface EventoResponse {
    id: number;
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    horaInicio: Date;
    horaFim: Date;
    localId?: number;
}

export interface BatchEventoResponse {
    message: string;
    eventosCount: number;
    datesGenerated: number;
    eventos: EventoResponse[];
}

const eventoService = {
    async create(data: CreateEventoRequest): Promise<EventoResponse> {
        const response = await api.post("/evento", data);
        return response.data;
    },

    async createBatch(
        data: CreateBatchEventoRequest,
    ): Promise<BatchEventoResponse> {
        const response = await api.post("/evento/batch", data);
        return response.data;
    },

    async getAll(): Promise<EventoResponse[]> {
        const response = await api.get("/evento");
        return response.data;
    },

    async getById(id: number): Promise<EventoResponse> {
        const response = await api.get(`/evento/${id}`);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/evento/${id}`);
    },
};

export default eventoService;
