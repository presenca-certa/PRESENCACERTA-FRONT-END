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
import pessoaService from "@/services/Pessoa";
import api from "@/api/api";

interface Pessoa {
    id: number;
    codigo: string;
    nome: string;
    cpf?: string;
    unidadeId?: number;
}

interface Unidade {
    id: number;
    nome: string;
}

export default function PessoasPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        codigo: "",
        nome: "",
        cpf: "",
        unidadeId: "",
    });
    const [loading, setLoading] = useState(false);

    const { data: pessoas = [], refetch } = useQuery({
        queryKey: ["pessoas"],
        queryFn: async () => {
            return await pessoaService.getAll();
        },
    });

    const { data: unidades = [] } = useQuery({
        queryKey: ["unidades"],
        queryFn: async () => {
            const response = await api.get("/unidade");
            return response.data as Unidade[];
        },
    });

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6)
            return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9)
            return `${numbers.slice(0, 3)}.${numbers.slice(
                3,
                6,
            )}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
            6,
            9,
        )}-${numbers.slice(9, 11)}`;
    };

    const extractCPFNumbers = (cpf: string) => {
        return cpf.replace(/\D/g, "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cpfNumbers = extractCPFNumbers(formData.cpf);

            if (formData.cpf && cpfNumbers.length !== 11) {
                toast({
                    description: "❌ CPF deve conter 11 dígitos",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            await pessoaService.create({
                codigo: formData.codigo,
                nome: formData.nome,
                cpf: cpfNumbers || undefined,
                unidadeId: formData.unidadeId
                    ? Number(formData.unidadeId)
                    : undefined,
            });

            toast({
                description: "✅ Pessoa criada com sucesso",
            });

            setFormData({ codigo: "", nome: "", cpf: "", unidadeId: "" });
            setShowForm(false);
            refetch();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao criar pessoa";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar esta pessoa?")) return;

        try {
            await pessoaService.delete(id);
            toast({
                description: "✅ Pessoa deletada com sucesso",
            });
            refetch();
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao deletar pessoa";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        }
    };

    return (
        <Page>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Pessoas</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-800 hover:bg-green-700"
                >
                    {showForm ? "Cancelar" : "Nova Pessoa"}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Criar Nova Pessoa
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Código/Matrícula
                                </label>
                                <Input
                                    type="text"
                                    value={formData.codigo}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            codigo: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={loading}
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
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    CPF
                                </label>
                                <Input
                                    type="text"
                                    value={formData.cpf}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cpf: formatCPF(e.target.value),
                                        })
                                    }
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    disabled={loading}
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
                                    disabled={loading}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="">
                                        Selecione uma unidade
                                    </option>
                                    {unidades.map((unidade) => (
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
                            className="bg-green-800 hover:bg-green-700 w-full"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Pessoa"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {pessoas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nenhuma pessoa encontrada
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>CPF</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pessoas.map((pessoa) => (
                                <TableRow key={pessoa.id}>
                                    <TableCell className="font-medium">
                                        {pessoa.codigo}
                                    </TableCell>
                                    <TableCell>{pessoa.nome}</TableCell>
                                    <TableCell>{pessoa.cpf || "-"}</TableCell>
                                    <TableCell>
                                        {pessoa.unidadeId || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                                handleDelete(pessoa.id)
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
