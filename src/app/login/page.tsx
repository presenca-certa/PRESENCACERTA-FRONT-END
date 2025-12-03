"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/user/login", {
                email,
                password,
            });

            toast({
                description:
                    response.data.message || "Login realizado com sucesso",
            });

            localStorage.setItem("user", JSON.stringify(response.data));
            router.push("/admin/dashboard");
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message || "Erro ao fazer login",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-2 text-blue-900">
                    UNICHAMADA
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Sistema de Gestão de Frequência
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Senha
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-blue-800 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                        disabled={loading}
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </Button>
                </form>

                <p className="text-center text-gray-600 text-sm mt-6">
                    Não tem uma conta? Contate o administrador
                </p>
            </div>
        </div>
    );
}
