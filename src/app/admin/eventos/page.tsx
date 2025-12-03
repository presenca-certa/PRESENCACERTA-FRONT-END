"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import eventoService from "@/services/Evento";
import turmaService from "@/services/Turmas";
import localizacaoService from "@/services/Localizacao";

interface Turma {
    id: number;
    nome: string;
}

interface Localizacao {
    id: number;
    descricao: string;
    latitude: number;
    longitude: number;
    raio: number;
}

// Funções de formatação de data e hora
function formatarData(data: string | Date): string {
    try {
        let dataObj: Date;
        if (typeof data === "string") {
            dataObj = new Date(data);
        } else {
            dataObj = new Date(data);
        }

        if (isNaN(dataObj.getTime())) {
            return "Data inválida";
        }

        return dataObj.toLocaleDateString("pt-BR");
    } catch {
        return "Data inválida";
    }
}

function formatarHora(horario: string | Date): string {
    try {
        let data: Date;
        if (typeof horario === "string") {
            if (horario.includes("T")) {
                data = new Date(horario);
            } else {
                const [horas, minutos] = horario.split(":");
                data = new Date();
                data.setHours(parseInt(horas), parseInt(minutos), 0);
            }
        } else {
            data = new Date(horario);
        }

        return data.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "--:--";
    }
}

const WEEKDAYS = [
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
];

export default function EventosEmLotePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [tabAtivo, setTabAtivo] = useState<"lote" | "avulso" | "listar">(
        "lote",
    );
    const [formDataLote, setFormDataLote] = useState({
        nome: "",
        dataInicio: "",
        dataFim: "",
        dayOfWeek: "2",
        horaInicio: "",
        horaFim: "",
        turmas: [] as number[],
        localizacaoId: "",
    });
    const [formDataAvulso, setFormDataAvulso] = useState({
        nome: "",
        dataInicio: "",
        horaInicio: "",
        horaFim: "",
        turmas: [] as number[],
        localizacaoId: "",
    });
    const [loading, setLoading] = useState(false);

    const { data: turmas = [] } = useQuery({
        queryKey: ["turmas"],
        queryFn: async () => {
            return await turmaService.getAll();
        },
    });

    const { data: localizacoes = [], isLoading: localizacoesLoading } =
        useQuery({
            queryKey: ["localizacoes"],
            queryFn: async () => {
                return await localizacaoService.getAll();
            },
        });

    const { data: eventos = [] } = useQuery({
        queryKey: ["eventos"],
        queryFn: async () => {
            return await eventoService.getAll();
        },
    });

    const handleTurmaToggleLote = (turmaId: number) => {
        setFormDataLote((prev) => ({
            ...prev,
            turmas: prev.turmas.includes(turmaId)
                ? prev.turmas.filter((id: number) => id !== turmaId)
                : [...prev.turmas, turmaId],
        }));
    };

    const handleTurmaToggleAvulso = (turmaId: number) => {
        setFormDataAvulso((prev) => ({
            ...prev,
            turmas: prev.turmas.includes(turmaId)
                ? prev.turmas.filter((id: number) => id !== turmaId)
                : [...prev.turmas, turmaId],
        }));
    };

    const handleSubmitLote = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const horaInicio = new Date(
                `2000-01-01T${formDataLote.horaInicio}:00`,
            );
            const horaFim = new Date(`2000-01-01T${formDataLote.horaFim}:00`);

            const response = await eventoService.createBatch({
                nome: formDataLote.nome,
                dataInicio: new Date(formDataLote.dataInicio),
                dataFim: new Date(formDataLote.dataFim),
                dayOfWeek: Number(formDataLote.dayOfWeek),
                horaInicio,
                horaFim,
                turmas: formDataLote.turmas,
                localId: formDataLote.localizacaoId
                    ? Number(formDataLote.localizacaoId)
                    : undefined,
            });

            toast({
                description: `✅ ${response.eventosCount} eventos criados com sucesso!`,
            });

            setFormDataLote({
                nome: "",
                dataInicio: "",
                dataFim: "",
                dayOfWeek: "2",
                horaInicio: "",
                horaFim: "",
                turmas: [],
                localizacaoId: "",
            });

            // Aguarda um pouco e redireciona
            setTimeout(() => {
                router.push("/admin/dashboard");
            }, 1500);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao criar eventos em lote";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAvulso = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const horaInicio = new Date(
                `2000-01-01T${formDataAvulso.horaInicio}:00`,
            );
            const horaFim = new Date(`2000-01-01T${formDataAvulso.horaFim}:00`);

            await eventoService.create({
                nome: formDataAvulso.nome,
                dataInicio: new Date(formDataAvulso.dataInicio),
                horaInicio,
                horaFim,
                turmas: formDataAvulso.turmas,
                localId: formDataAvulso.localizacaoId
                    ? Number(formDataAvulso.localizacaoId)
                    : undefined,
            });

            toast({
                description: "✅ Evento criado com sucesso!",
            });

            setFormDataAvulso({
                nome: "",
                dataInicio: "",
                horaInicio: "",
                horaFim: "",
                turmas: [],
                localizacaoId: "",
            });

            // Aguarda um pouco e redireciona
            setTimeout(() => {
                router.push("/admin/dashboard");
            }, 1500);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Erro ao criar evento";
            toast({
                description: `❌ ${errorMessage}`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page>
            <h1 className="text-3xl font-bold pb-4 mb-4 border-b-2">
                Gerenciar Eventos
            </h1>

            {/* Abas */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setTabAtivo("lote")}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                        tabAtivo === "lote"
                            ? "border-yellow-600 text-yellow-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    Eventos em Lote
                </button>
                <button
                    onClick={() => setTabAtivo("avulso")}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                        tabAtivo === "avulso"
                            ? "border-orange-600 text-orange-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    Evento Avulso
                </button>
                <button
                    onClick={() => setTabAtivo("listar")}
                    className={`px-4 py-2 font-medium border-b-2 transition ${
                        tabAtivo === "listar"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                    Listar Eventos
                </button>
            </div>

            {/* TAB: Eventos em Lote */}
            {tabAtivo === "lote" && (
                <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            Informações:
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>
                                • Os eventos serão criados para o dia da semana
                                selecionado
                            </li>
                            <li>
                                • Apenas dias úteis (segunda a sexta) serão
                                considerados
                            </li>
                            <li>
                                • O intervalo respeitará a data de início e fim
                                selecionadas
                            </li>
                            <li>
                                • Exemplo: Terça de 17/08/2025 a 15/12/2025 cria
                                eventos em todas as terças do período que são
                                dias úteis
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form onSubmit={handleSubmitLote} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Nome do Evento
                                    </label>
                                    <Input
                                        type="text"
                                        value={formDataLote.nome}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                nome: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                        placeholder="Ex: Aula de Matemática"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Dia da Semana
                                    </label>
                                    <select
                                        value={formDataLote.dayOfWeek}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                dayOfWeek: e.target.value,
                                            })
                                        }
                                        disabled={loading}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        {WEEKDAYS.map((day) => (
                                            <option
                                                key={day.value}
                                                value={day.value}
                                            >
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Localização (Opcional)
                                    </label>
                                    <select
                                        value={formDataLote.localizacaoId}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                localizacaoId: e.target.value,
                                            })
                                        }
                                        disabled={
                                            loading || localizacoesLoading
                                        }
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="">
                                            Selecione uma localização
                                        </option>
                                        {localizacoes?.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.descricao}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Data de Início
                                    </label>
                                    <Input
                                        type="date"
                                        value={formDataLote.dataInicio}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                dataInicio: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Data de Término
                                    </label>
                                    <Input
                                        type="date"
                                        value={formDataLote.dataFim}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                dataFim: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hora de Início
                                    </label>
                                    <Input
                                        type="time"
                                        value={formDataLote.horaInicio}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                horaInicio: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hora de Término
                                    </label>
                                    <Input
                                        type="time"
                                        value={formDataLote.horaFim}
                                        onChange={(e) =>
                                            setFormDataLote({
                                                ...formDataLote,
                                                horaFim: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">
                                    Selecione as Turmas
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {turmas.length === 0 ? (
                                        <p className="text-gray-500 text-sm">
                                            Nenhuma turma disponível
                                        </p>
                                    ) : (
                                        turmas.map((turma) => (
                                            <label
                                                key={turma.id}
                                                className="flex items-center space-x-2 cursor-pointer p-3 border rounded hover:bg-gray-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formDataLote.turmas.includes(
                                                        turma.id,
                                                    )}
                                                    onChange={() =>
                                                        handleTurmaToggleLote(
                                                            turma.id,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-4 h-4"
                                                />
                                                <span>{turma.nome}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-yellow-800 hover:bg-yellow-700 text-white font-medium py-2 rounded-lg"
                                disabled={loading}
                            >
                                {loading
                                    ? "Criando eventos..."
                                    : "Criar Eventos em Lote"}
                            </Button>
                        </form>
                    </div>
                </>
            )}

            {/* TAB: Evento Avulso */}
            {tabAtivo === "avulso" && (
                <>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-orange-900 mb-2">
                            Informações:
                        </h3>
                        <ul className="text-sm text-orange-800 space-y-1">
                            <li>
                                • Crie um evento único para uma data específica
                            </li>
                            <li>
                                • Selecione todas as turmas que participarão do
                                evento
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <form
                            onSubmit={handleSubmitAvulso}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Nome do Evento
                                    </label>
                                    <Input
                                        type="text"
                                        value={formDataAvulso.nome}
                                        onChange={(e) =>
                                            setFormDataAvulso({
                                                ...formDataAvulso,
                                                nome: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                        placeholder="Ex: Prova de Matemática"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Localização (Opcional)
                                    </label>
                                    <select
                                        value={formDataAvulso.localizacaoId}
                                        onChange={(e) =>
                                            setFormDataAvulso({
                                                ...formDataAvulso,
                                                localizacaoId: e.target.value,
                                            })
                                        }
                                        disabled={
                                            loading || localizacoesLoading
                                        }
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="">
                                            Selecione uma localização
                                        </option>
                                        {localizacoes?.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.descricao}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Data
                                    </label>
                                    <Input
                                        type="date"
                                        value={formDataAvulso.dataInicio}
                                        onChange={(e) =>
                                            setFormDataAvulso({
                                                ...formDataAvulso,
                                                dataInicio: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hora de Início
                                    </label>
                                    <Input
                                        type="time"
                                        value={formDataAvulso.horaInicio}
                                        onChange={(e) =>
                                            setFormDataAvulso({
                                                ...formDataAvulso,
                                                horaInicio: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Hora de Término
                                    </label>
                                    <Input
                                        type="time"
                                        value={formDataAvulso.horaFim}
                                        onChange={(e) =>
                                            setFormDataAvulso({
                                                ...formDataAvulso,
                                                horaFim: e.target.value,
                                            })
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">
                                    Selecione as Turmas
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {turmas.length === 0 ? (
                                        <p className="text-gray-500 text-sm">
                                            Nenhuma turma disponível
                                        </p>
                                    ) : (
                                        turmas.map((turma) => (
                                            <label
                                                key={turma.id}
                                                className="flex items-center space-x-2 cursor-pointer p-3 border rounded hover:bg-gray-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formDataAvulso.turmas.includes(
                                                        turma.id,
                                                    )}
                                                    onChange={() =>
                                                        handleTurmaToggleAvulso(
                                                            turma.id,
                                                        )
                                                    }
                                                    disabled={loading}
                                                    className="w-4 h-4"
                                                />
                                                <span>{turma.nome}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-800 hover:bg-orange-700 text-white font-medium py-2 rounded-lg"
                                disabled={loading}
                            >
                                {loading ? "Criando evento..." : "Criar Evento"}
                            </Button>
                        </form>
                    </div>
                </>
            )}

            {/* TAB: Listar Eventos */}
            {tabAtivo === "listar" && (
                <>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-6">
                            Eventos Criados
                        </h2>

                        {eventos.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">
                                Nenhum evento criado ainda
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold">
                                                Nome
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold">
                                                Data
                                            </th>
                                            <th className="text-left py-3 px-4 font-semibold">
                                                Hora
                                            </th>
                                            <th className="text-center py-3 px-4 font-semibold">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventos.map((evento: any) => (
                                            <tr
                                                key={evento.id}
                                                className="border-b border-gray-200 hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4">
                                                    {evento.nome}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatarData(
                                                        evento.dataInicio,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatarHora(
                                                        evento.horaInicio,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded"
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/eventos/${evento.id}/detalhes`,
                                                            )
                                                        }
                                                    >
                                                        Detalhar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Page>
    );
}
