import api from "@/api/api";

export interface CreateTurmaRequest {
    nome: string;
    unidadeId: number;
}

export interface TurmaResponse {
    id: number;
    nome: string;
    unidadeId: number;
}

export interface VincularPessoaRequest {
    pessoaId: number;
}

const turmaService = {
    async create(data: CreateTurmaRequest): Promise<TurmaResponse> {
        const response = await api.post("/classes", data);
        return response.data;
    },

    async getAll(): Promise<TurmaResponse[]> {
        const response = await api.get("/classes");
        return response.data;
    },

    async getById(id: number): Promise<TurmaResponse> {
        const response = await api.get(`/classes/${id}`);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/classes/${id}`);
    },

    async vincularPessoa(
        turmaId: number,
        data: VincularPessoaRequest,
    ): Promise<void> {
        await api.post(`/classes/${turmaId}/vincular-pessoa`, data);
    },
};

export default turmaService;
