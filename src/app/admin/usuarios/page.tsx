"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Usuario {
    id: number;
    email: string;
    nome?: string;
    role?: string;
    ativo?: boolean;
}

export default function UsuariosPage() {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        nome: "",
        role: "user",
    });
    const [loading, setLoading] = useState(false);

    const { data: usuarios = [], refetch } = useQuery({
        queryKey: ["usuarios"],
        queryFn: async () => {
            const response = await api.get("/user");
            return response.data as Usuario[];
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/user", {
                email: formData.email,
                password: formData.password,
                nome: formData.nome,
                role: formData.role,
            });

            toast({
                description: "Usuário criado com sucesso",
            });

            setFormData({ email: "", password: "", nome: "", role: "user" });
            setShowForm(false);
            refetch();
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message || "Erro ao criar usuário",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

        try {
            await api.delete(`/user/${id}`);
            toast({
                description: "Usuário deletado com sucesso",
            });
            refetch();
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message || "Erro ao deletar usuário",
                variant: "destructive",
            });
        }
    };

    return (
        <Page>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Usuários</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-800 hover:bg-blue-700"
                >
                    {showForm ? "Cancelar" : "Novo Usuário"}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Criar Novo Usuário
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Senha
                                </label>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nome
                                </label>
                                <Input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            nome: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Role
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            role: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                    <option value="professor">Professor</option>
                                </select>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="bg-green-800 hover:bg-green-700 w-full"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Usuário"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {usuarios.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nenhum usuário encontrado
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell>{usuario.email}</TableCell>
                                    <TableCell>{usuario.nome || "-"}</TableCell>
                                    <TableCell className="capitalize">
                                        {usuario.role || "user"}
                                    </TableCell>
                                    <TableCell>
                                        {usuario.ativo ? (
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                Ativo
                                            </span>
                                        ) : (
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                                Inativo
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(usuario.id)
                                            }
                                        >
                                            Deletar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </Page>
    );
}
