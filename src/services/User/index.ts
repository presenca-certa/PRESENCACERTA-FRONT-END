import api from "@/api/api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    email: string;
    nome?: string;
    role?: string;
    message: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    nome?: string;
    role?: string;
}

export class UserService {
    static async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>("/user/login", data);
        return response.data;
    }

    static async createUser(data: CreateUserRequest) {
        const response = await api.post("/user", data);
        return response.data;
    }

    static async getUsers() {
        const response = await api.get("/user");
        return response.data;
    }

    static async getUserById(id: number) {
        const response = await api.get(`/user/${id}`);
        return response.data;
    }

    static async deleteUser(id: number) {
        const response = await api.delete(`/user/${id}`);
        return response.data;
    }
}
