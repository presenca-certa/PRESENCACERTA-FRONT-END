"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileUp, Lock } from "lucide-react";
import { Breadcrumb } from "antd";
import { BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import BreadcrumbItem from "antd/es/breadcrumb/BreadcrumbItem";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParamId } from "@/hooks/use-param-id";
import eventoService from "@/services/Evento";
import { TablePresenca } from "./components/table-presenca-component";
import { Page } from "@/components/page";
import { BreadCrumb } from "@/components/bread-crumb";
import { BotaoExportaTabela } from "./components/button-export-table";

export default function DetalharTurma() {
    const params = useParams();
    const id = useParamId();
    const turmaId = Number(params.turmaId);
    const router = useRouter();
    const navigateToDetalharEvento = () => {
        router.push(`/evento/${id}/detalhar`);
    };
    const navigateToImportarAluno = () => {
        router.push(`/evento/${id}/detalhar/turma/importar-aluno`);
    };

    const { data } = useQuery({
        queryKey: ["turma-evento-presenca", id, turmaId],
        queryFn: async () =>
            await EventoService.getPresencaByTurma(id, turmaId),
    });

    const breadcrumbItems = [
        {
            label: "Evento",
            href: "/evento",
        },
        {
            label: "Alunos presentes",
            isCurrentPage: true,
        },
    ];
    const tabelaID = "tabela-presenca";
    return (
        <Page>
            <BreadCrumb items={breadcrumbItems} />

            <Button
                variant="ghost"
                className=" rounded-md  hover:bg-blue-50 my-4"
                onClick={navigateToDetalharEvento}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>
            <div>
                <h1 className="text-xl text-gray-700 font-medium mb-6">
                    Alunos presentes: {data?.length}
                </h1>
                <div className="flex gap-4">
                    <Button
                        onClick={navigateToImportarAluno}
                        className="w-full md:w-auto gap-2 bg-gray-300 rounded-xl text-gray-500 mb-3 hover:bg-gray-300  hover:text-gray-500 mb-3"
                    >
                        <Lock size={20} />
                        Importar Alunos
                    </Button>
                    <BotaoExportaTabela tabelaID={tabelaID} />
                </div>
            </div>
            <TablePresenca tabelaID={tabelaID} data={data} />
        </Page>
    );
}
