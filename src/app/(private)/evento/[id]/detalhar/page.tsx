"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { Card } from "../../adiciona-evento/components/card";
import { useParamId } from "@/hooks/use-param-id";
import { useQuery } from "@tanstack/react-query";
import eventoService from "@/services/Evento";
import { Page } from "@/components/page";
import { BreadCrumb } from "@/components/bread-crumb";

export default function DetalharEvento() {
    const router = useRouter();
    const id = useParamId();

    const navigateToEvento = () => {
        router.push("/evento");
    };

    const navigateToDetalharTurma = (turmaId: number) => {
        router.push(`/evento/${id}/detalhar/turma/${turmaId}`);
    };

    const navigeteToQrCode = () => {
        router.push(`/presenca/${id}/qr-code`);
    };

    const { data } = useQuery({
        queryKey: ["eventos", id],
        queryFn: async () => await EventoService.getEventoById(id),
    });

    const breadcrumbItems = [
        { label: "Evento", href: "/evento" },
        { label: `Detalhar Evento -  ${data?.nome}`, isCurrentPage: true },
    ];

    return (
        <Page>
            <BreadCrumb items={breadcrumbItems} />

            <Button
                variant="ghost"
                className=" rounded-xl  hover:bg-blue-50 my-4"
                onClick={navigateToEvento}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <div>
                <h1 className="text-lg  md:text-xl  text-gray-700 font-medium mb-6">
                    Turmas do evento - {data?.nome}
                </h1>
                <div className=" block  md:flex gap-4">
                    <Button
                        className="w-full  md:w-auto bg-blue-800 rounded-xl text-blue-50 hover:bg-blue-700 mb-3"
                        onClick={navigeteToQrCode}
                    >
                        Gerar Chamada
                    </Button>
                    <Button
                        disabled
                        className="w-full md:w-auto gap-2 bg-gray-300 rounded-xl text-gray-500 mb-3"
                    >
                        <Lock size={20} />
                        Adicionar Turma
                    </Button>
                </div>
                <ul>
                    {data?.turmas.map((eventoTurma) => (
                        <li key={eventoTurma.turma.id}>
                            <Card
                                onClick={() =>
                                    navigateToDetalharTurma(
                                        eventoTurma.turma.id,
                                    )
                                }
                                titulo={eventoTurma.turma.nome}
                                items={[]}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </Page>
    );
}
