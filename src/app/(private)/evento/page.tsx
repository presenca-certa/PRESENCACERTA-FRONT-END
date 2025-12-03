"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "./adiciona-evento/components/card";
import { useQuery } from "@tanstack/react-query";
import eventoService from "@/services/Evento";
import { formatDate } from "date-fns";
import { GetEventoDto } from "@/services/Evento/dto/get-evento.dto";
import { Page } from "@/components/page";

export default function TelaAdicionarEvento() {
    const router = useRouter();
    const navigateToAdicionaEvento = () => {
        router.push("evento/adiciona-evento"); // Certifique-se de que o caminho está correto
    };

    const navigateToDetalharEvento = (eventoId: number) => {
        router.push(`/evento/${eventoId}/detalhar`);
    };

    const { data } = useQuery({
        queryKey: ["eventos"],
        queryFn: async () => await EventoService.getEventos(),
    });

    return (
        <Page>
            <h1 className="text-xl font-semibold pb-4 mb-4 border-b-2">
                Eventos
            </h1>
            <Button
                className="bg-blue-800 rounded-lg text-blue-50 hover:bg-blue-700 mb-"
                onClick={navigateToAdicionaEvento}
            >
                Adicionar
            </Button>
            {
                // Se não houver eventos
                !Array.isArray(data) ? (
                    <div className="text-center text-gray-400 py-4">
                        Nenhum evento encontrado
                    </div>
                ) : (
                    <ul>
                        {Array.isArray(data) &&
                            data?.map((evento) => (
                                <li key={evento.id}>
                                    <Card
                                        onClick={() =>
                                            navigateToDetalharEvento(evento.id)
                                        }
                                        titulo={evento.nome}
                                        items={[
                                            // {
                                            //     label: "Participantes",
                                            //     icon: "UsersRound",
                                            //     value: 100,
                                            // },
                                            {
                                                label: "Data do evento",
                                                icon: "CalendarDays",
                                                value: formatDate(
                                                    evento.dataInicio,
                                                    "dd/MM/yyyy",
                                                ),
                                            },
                                            {
                                                label: "H. do evento",
                                                icon: "Clock",
                                                value: formatDate(
                                                    evento.horaInicio,
                                                    "HH:mm",
                                                ),
                                            },
                                        ]}
                                    />
                                </li>
                            ))}
                    </ul>
                )
            }
        </Page>
    );
}
