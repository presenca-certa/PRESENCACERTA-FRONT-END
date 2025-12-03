"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import turmaService from "@/services/Turmas";
import pessoaService from "@/services/Pessoa";
import api from "@/api/api";

interface Turma {
    id: number;
    nome: string;
    unidadeId: number;
}

interface Unidade {
    id: number;
    nome: string;
}

interface Pessoa {
    id: number;
    codigo: string;
    nome: string;
}

export default function TurmasPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [turmaSelectedId, setTurmaSelectedId] = useState<number | null>(null);
    const [showVincularForm, setShowVincularForm] = useState(false);
    const [pessoasVinculando, setPessoasVinculando] = useState<number[]>([]);
    const [loadingVincular, setLoadingVincular] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        unidadeId: "",
    });
    const [loading, setLoading] = useState(false);

    const { data: turmas = [], refetch } = useQuery({
        queryKey: ["turmas"],
        queryFn: async () => {
            return await turmaService.getAll();
        },
    });

    const { data: unidades = [] } = useQuery({
        queryKey: ["unidades"],
        queryFn: async () => {
            const response = await api.get("/unidade");
            return response.data;
        },
    });

    const { data: pessoas = [] } = useQuery({
        queryKey: ["pessoas"],
        queryFn: async () => {
            return await pessoaService.getAll();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await turmaService.create({
                nome: formData.nome,
                unidadeId: Number(formData.unidadeId),
            });

            toast({
                description: "✅ Turma criada com sucesso",
            });

            setFormData({ nome: "", unidadeId: "" });
            setShowForm(false);
            refetch();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao criar turma";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar esta turma?")) return;

        try {
            await turmaService.delete(id);
            toast({
                description: "✅ Turma deletada com sucesso",
            });
            refetch();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao deletar turma";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        }
    };

    const getUnidadeName = (id: number) => {
        return unidades.find((u: { id: number }) => u.id === id)?.nome || "-";
    };

    const handleVincularPessoa = (pessoaId: number) => {
        setPessoasVinculando((prev) =>
            prev.includes(pessoaId)
                ? prev.filter((id) => id !== pessoaId)
                : [...prev, pessoaId],
        );
    };

    const handleSubmitVincular = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingVincular(true);

        try {
            if (!turmaSelectedId) {
                toast({
                    description: "❌ Selecione uma turma",
                    variant: "destructive",
                });
                setLoadingVincular(false);
                return;
            }

            // Vincula cada pessoa à turma
            for (const pessoaId of pessoasVinculando) {
                await turmaService.vincularPessoa(turmaSelectedId, {
                    pessoaId,
                });
            }

            toast({
                description: `✅ ${pessoasVinculando.length} pessoa(s) vinculada(s) com sucesso`,
            });

            setPessoasVinculando([]);
            setShowVincularForm(false);
            setTurmaSelectedId(null);
            refetch();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao vincular pessoa à turma";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoadingVincular(false);
        }
    };

    return (
        <Page>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Turmas</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-800 hover:bg-purple-700"
                >
                    {showForm ? "Cancelar" : "Nova Turma"}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Criar Nova Turma
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    placeholder="Ex: Turma A, 1º Ano"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Unidade
                                </label>
                                <select
                                    value={formData.unidadeId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            unidadeId: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={loading}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">
                                        Selecione uma unidade
                                    </option>
                                    {unidades.map((unidade: any) => (
                                        <option
                                            key={unidade.id}
                                            value={unidade.id}
                                        >
                                            {unidade.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="bg-purple-800 hover:bg-purple-700 w-full"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Turma"}
                        </Button>
                    </form>
                </div>
            )}

            {showVincularForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Vincular Pessoas à Turma:{" "}
                            <span className="text-purple-600">
                                {turmas.find((t) => t.id === turmaSelectedId)
                                    ?.nome || ""}
                            </span>
                        </h2>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShowVincularForm(false);
                                setTurmaSelectedId(null);
                                setPessoasVinculando([]);
                            }}
                        >
                            Fechar
                        </Button>
                    </div>
                    <form onSubmit={handleSubmitVincular} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Selecione as Pessoas
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                {pessoas.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Nenhuma pessoa disponível
                                    </p>
                                ) : (
                                    pessoas.map((pessoa) => (
                                        <label
                                            key={pessoa.id}
                                            className="flex items-center space-x-2 cursor-pointer p-3 border rounded hover:bg-purple-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={pessoasVinculando.includes(
                                                    pessoa.id,
                                                )}
                                                onChange={() =>
                                                    handleVincularPessoa(
                                                        pessoa.id,
                                                    )
                                                }
                                                disabled={loadingVincular}
                                                className="w-4 h-4"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {pessoa.nome}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {pessoa.codigo}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                className="bg-purple-800 hover:bg-purple-700 flex-1"
                                disabled={loadingVincular}
                            >
                                {loadingVincular
                                    ? "Vinculando..."
                                    : `Vincular ${pessoasVinculando.length} Pessoa(s)`}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowVincularForm(false);
                                    setTurmaSelectedId(null);
                                    setPessoasVinculando([]);
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            {turmas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Nenhuma turma encontrada
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Unidade</TableHead>
                            <TableHead>Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {turmas.map((turma) => (
                            <TableRow key={turma.id}>
                                <TableCell className="font-medium">
                                    {turma.nome}
                                </TableCell>
                                <TableCell>
                                    {getUnidadeName(turma.unidadeId)}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                        onClick={() => {
                                            setTurmaSelectedId(turma.id);
                                            setShowVincularForm(true);
                                        }}
                                    >
                                        Vincular
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(turma.id)}
                                    >
                                        Deletar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Page>
    );
}
