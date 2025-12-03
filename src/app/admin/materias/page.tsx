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

interface Materia {
    id: number;
    nome: string;
}

export default function MateriasPage() {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
    });
    const [loading, setLoading] = useState(false);

    const { data: materias = [], refetch } = useQuery({
        queryKey: ["materias"],
        queryFn: async () => {
            const response = await api.get("/materia");
            return response.data as Materia[];
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/materia", {
                nome: formData.nome,
            });

            toast({
                description: "Matéria criada com sucesso",
            });

            setFormData({ nome: "" });
            setShowForm(false);
            refetch();
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message || "Erro ao criar matéria",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar esta matéria?")) return;

        try {
            await api.delete(`/materia/${id}`);
            toast({
                description: "Matéria deletada com sucesso",
            });
            refetch();
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message || "Erro ao deletar matéria",
                variant: "destructive",
            });
        }
    };

    return (
        <Page>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Matérias</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-800 hover:bg-indigo-700"
                >
                    {showForm ? "Cancelar" : "Nova Matéria"}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Criar Nova Matéria
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                required
                                disabled={loading}
                                placeholder="Ex: Matemática, Português"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="bg-indigo-800 hover:bg-indigo-700 w-full"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Matéria"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {materias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nenhuma matéria encontrada
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {materias.map((materia) => (
                                <TableRow key={materia.id}>
                                    <TableCell className="font-medium">
                                        {materia.nome}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(materia.id)
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
