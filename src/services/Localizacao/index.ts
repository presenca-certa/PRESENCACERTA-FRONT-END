import api from "@/api/api";

export interface LocalizacaoResponse {
    id: number;
    descricao: string;
    latitude: number;
    longitude: number;
    raio: number;
}

const localizacaoService = {
    async getAll(): Promise<LocalizacaoResponse[]> {
        const response = await api.get("/localizacao");
        return response.data;
    },

    async getById(id: number): Promise<LocalizacaoResponse> {
        const response = await api.get(`/localizacao/${id}`);
        return response.data;
    },

    async create(
        data: Omit<LocalizacaoResponse, "id">,
    ): Promise<LocalizacaoResponse> {
        const response = await api.post("/localizacao", data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/localizacao/${id}`);
    },
};

export default localizacaoService;
