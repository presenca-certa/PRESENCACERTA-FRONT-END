import api from "@/api/api";

export interface CreatePessoaRequest {
    codigo: string;
    nome: string;
    cpf?: string;
    unidadeId?: number;
}

export interface PessoaResponse {
    id: number;
    codigo: string;
    nome: string;
    cpf?: string;
    unidadeId?: number;
}

const pessoaService = {
    async create(data: CreatePessoaRequest): Promise<PessoaResponse> {
        const response = await api.post("/people", data);
        return response.data;
    },

    async getAll(): Promise<PessoaResponse[]> {
        const response = await api.get("/people");
        return response.data;
    },

    async getById(id: number): Promise<PessoaResponse> {
        const response = await api.get(`/people/${id}`);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/people/${id}`);
    },
};

export default pessoaService;
