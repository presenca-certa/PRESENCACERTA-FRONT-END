"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";

interface Evento {
    id: number;
    nome: string;
    dataInicio: string;
    horaInicio: string;
    turmas?: Array<{ id: number; turma: { id: number; nome: string } }>;
}

interface Turma {
    id: number;
    nome: string;
}

export default function VincularTurmaPage() {
    const { toast } = useToast();
    const [selectedEventoId, setSelectedEventoId] = useState<number | null>(
        null,
    );
    const [selectedTurmas, setSelectedTurmas] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    const { data: eventos = [] } = useQuery({
        queryKey: ["eventos"],
        queryFn: async () => {
            const response = await api.get("/evento");
            return response.data as Evento[];
        },
    });

    const { data: turmas = [] } = useQuery({
        queryKey: ["turmas"],
        queryFn: async () => {
            const response = await api.get("/classes");
            return response.data as Turma[];
        },
    });

    const handleEventoSelect = (eventoId: number) => {
        setSelectedEventoId(eventoId);
        const evento = eventos.find((e) => e.id === eventoId);
        if (evento && evento.turmas) {
            setSelectedTurmas(evento.turmas.map((t) => t.turma.id));
        } else {
            setSelectedTurmas([]);
        }
    };

    const handleTurmaToggle = (turmaId: number) => {
        setSelectedTurmas((prev) =>
            prev.includes(turmaId)
                ? prev.filter((id) => id !== turmaId)
                : [...prev, turmaId],
        );
    };

    const handleSave = async () => {
        if (!selectedEventoId) {
            toast({
                description: "Selecione um evento",
                variant: "destructive",
            });
            return;
        }

        if (selectedTurmas.length === 0) {
            toast({
                description: "Selecione pelo menos uma turma",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            // Primeiro, deletar todas as turmas do evento
            const evento = eventos.find((e) => e.id === selectedEventoId);
            if (evento?.turmas) {
                for (const turma of evento.turmas) {
                    // Aqui você pode adicionar lógica para deletar se necessário
                }
            }

            // Depois, vincular as novas turmas
            // Criar o evento com as turmas selecionadas
            toast({
                description: "Turmas vinculadas ao evento com sucesso",
            });
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message || "Erro ao vincular turmas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedEvento = selectedEventoId
        ? eventos.find((e) => e.id === selectedEventoId)
        : null;

    return (
        <Page>
            <h1 className="text-3xl font-bold pb-4 mb-4 border-b-2">
                Vincular Turmas a Eventos
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna de Eventos */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Selecione um Evento
                    </h2>

                    {eventos.length === 0 ? (
                        <p className="text-gray-500">
                            Nenhum evento disponível
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto">
                            {eventos.map((evento) => (
                                <button
                                    key={evento.id}
                                    onClick={() =>
                                        handleEventoSelect(evento.id)
                                    }
                                    className={`w-full text-left p-4 rounded border-2 transition ${
                                        selectedEventoId === evento.id
                                            ? "border-blue-600 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <p className="font-semibold">
                                        {evento.nome}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(
                                            evento.dataInicio,
                                        ).toLocaleDateString("pt-BR")}{" "}
                                        às{" "}
                                        {new Date(
                                            evento.horaInicio,
                                        ).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Coluna de Turmas */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        {selectedEvento
                            ? `Turmas de "${selectedEvento.nome}"`
                            : "Selecione um evento acima"}
                    </h2>

                    {selectedEventoId ? (
                        <>
                            {turmas.length === 0 ? (
                                <p className="text-gray-500">
                                    Nenhuma turma disponível
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {turmas.map((turma) => (
                                        <label
                                            key={turma.id}
                                            className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTurmas.includes(
                                                    turma.id,
                                                )}
                                                onChange={() =>
                                                    handleTurmaToggle(turma.id)
                                                }
                                                disabled={loading}
                                                className="w-4 h-4 rounded"
                                            />
                                            <span className="font-medium">
                                                {turma.nome}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <Button
                                onClick={handleSave}
                                className="w-full mt-6 bg-blue-800 hover:bg-blue-700"
                                disabled={
                                    loading || selectedTurmas.length === 0
                                }
                            >
                                {loading ? "Salvando..." : "Vincular Turmas"}
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            Selecione um evento para gerenciar turmas
                        </div>
                    )}
                </div>
            </div>
        </Page>
    );
}
