"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { QRCode } from "antd";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import eventoService from "@/services/Evento";
import { PresencaService } from "@/services/Presenca";
import turmaService from "@/services/Turmas";
import { Download, ArrowLeft, QrCode } from "lucide-react";

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

interface EventoComTurmas {
    id: number;
    nome: string;
    dataInicio: Date;
    dataFim: Date;
    horaInicio: Date;
    horaFim: Date;
    localId?: number;
    turmas?: Array<{
        id: number;
        turma: {
            id: number;
            nome: string;
        };
    }>;
}

export default function DetalharEventoPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const eventoId = Number(params.id);
    const [showQRModal, setShowQRModal] = useState(false);
    const qrRef = React.useRef<HTMLDivElement>(null);
    const [expandedTurma, setExpandedTurma] = useState<number | null>(null);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const urlCheckIn = `${origin}/presenca/${eventoId}/check-in`;

    const { data: evento, isLoading: loadingEvento } = useQuery({
        queryKey: ["evento", eventoId],
        queryFn: async () => {
            return await eventoService.getById(eventoId);
        },
    });

    const { data: presenças = [] } = useQuery({
        queryKey: ["presenças", eventoId],
        queryFn: async () => {
            return await PresencaService.getPresencasByEvento(eventoId);
        },
        enabled: !!evento,
    });

    const handleDownloadQR = () => {
        if (qrRef.current) {
            const canvas = qrRef.current.querySelector("canvas");
            if (canvas) {
                const image = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = image;
                link.download = `qrcode-evento-${eventoId}.png`;
                link.click();
                toast({
                    description: "✅ QR code baixado com sucesso!",
                });
            }
        }
    };

    const handlePrintQR = () => {
        const printWindow = window.open("", "", "height=600,width=600");
        if (printWindow && qrRef.current) {
            const canvas = qrRef.current.querySelector("canvas");
            if (canvas) {
                const image = canvas.toDataURL("image/png");
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>QR Code - ${evento?.nome}</title>
                            <style>
                                body {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                    font-family: Arial, sans-serif;
                                    padding: 20px;
                                    background-color: #f5f5f5;
                                }
                                .container {
                                    background: white;
                                    padding: 40px;
                                    border-radius: 10px;
                                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    text-align: center;
                                }
                                h1 {
                                    margin-bottom: 30px;
                                    color: #333;
                                }
                                img {
                                    max-width: 100%;
                                    height: auto;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 12px;
                                    color: #666;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>${evento?.nome}</h1>
                                <img src="${image}" />
                                <div class="footer">
                                    <p>Escaneie o código QR para registrar presença</p>
                                </div>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    if (loadingEvento) {
        return (
            <Page>
                <div className="flex items-center justify-center h-screen">
                    <p className="text-lg text-gray-600">Carregando...</p>
                </div>
            </Page>
        );
    }

    if (!evento) {
        return (
            <Page>
                <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <p className="text-lg text-gray-600">
                        Evento não encontrado
                    </p>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                </div>
            </Page>
        );
    }

    const eventoComTurmas = evento as EventoComTurmas;

    return (
        <Page>
            <div className="mb-6">
                <Button
                    variant="ghost"
                    className="hover:bg-gray-100"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            </div>

            {/* Informações Principais do Evento */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {evento.nome}
                        </h1>
                        <p className="text-gray-600">ID: {evento.id}</p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowQRModal(!showQRModal)}
                    >
                        <QrCode className="mr-2 h-4 w-4" />
                        QR Code
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Data de Início
                        </label>
                        <p className="text-lg font-semibold">
                            {formatarData(evento.dataInicio)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Data de Término
                        </label>
                        <p className="text-lg font-semibold">
                            {formatarData(evento.dataFim)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Horário
                        </label>
                        <p className="text-lg font-semibold">
                            {formatarHora(evento.horaInicio)} às{" "}
                            {formatarHora(evento.horaFim)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">
                            Total de Presenças
                        </label>
                        <p className="text-lg font-semibold text-blue-600">
                            {presenças.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal QR Code */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            QR Code do Evento
                        </h2>

                        <div
                            ref={qrRef}
                            className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4 flex justify-center"
                        >
                            <QRCode size={250} value={urlCheckIn} />
                        </div>

                        <p className="text-sm text-gray-600 text-center mb-4">
                            Escaneie para registrar presença
                        </p>

                        <div className="flex gap-3 flex-col">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleDownloadQR}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Baixar QR Code
                            </Button>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handlePrintQR}
                            >
                                🖨️ Imprimir
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => setShowQRModal(false)}
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Turmas e Presenças */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                    Turmas do Evento ({eventoComTurmas.turmas?.length || 0})
                </h2>

                {eventoComTurmas.turmas && eventoComTurmas.turmas.length > 0 ? (
                    eventoComTurmas.turmas.map((eventoTurma) => {
                        const presençasDaTurma = presenças;

                        const isExpanded =
                            expandedTurma === eventoTurma.turma.id;

                        return (
                            <div
                                key={eventoTurma.turma.id}
                                className="bg-white rounded-lg shadow-md p-4"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedTurma(
                                            isExpanded
                                                ? null
                                                : eventoTurma.turma.id,
                                        )
                                    }
                                    className="w-full text-left flex justify-between items-center hover:bg-gray-50 p-2 rounded"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            {eventoTurma.turma.nome}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {presençasDaTurma.length} alunos
                                            presentes
                                        </p>
                                    </div>
                                    <span
                                        className={`transform transition-transform ${
                                            isExpanded ? "rotate-180" : ""
                                        }`}
                                    >
                                        ▼
                                    </span>
                                </button>

                                {isExpanded && (
                                    <div className="mt-4 pt-4 border-t">
                                        {presençasDaTurma.length > 0 ? (
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-gray-700">
                                                    Alunos Presentes:
                                                </h4>
                                                <ul className="space-y-2">
                                                    {presençasDaTurma.map(
                                                        (presença) => (
                                                            <li
                                                                key={
                                                                    presença.id
                                                                }
                                                                className="bg-green-50 rounded p-3 flex justify-between items-center"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {
                                                                            presença
                                                                                .pessoa
                                                                                .nome
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-gray-600">
                                                                        {
                                                                            presença
                                                                                .pessoa
                                                                                .codigo
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <span className="text-green-600 font-semibold">
                                                                    ✓
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-center py-4">
                                                Nenhum aluno registrou presença
                                                ainda
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">
                            Nenhuma turma vinculada a este evento
                        </p>
                    </div>
                )}
            </div>
        </Page>
    );
}
