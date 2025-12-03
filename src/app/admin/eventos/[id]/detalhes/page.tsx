"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { QRCode } from "antd";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import eventoService from "@/services/Evento";
import { Download, ArrowLeft } from "lucide-react";

function formatarHora(horario: string | Date): string {
    try {
        let data: Date;
        if (typeof horario === "string") {
            // Se for "HH:mm" ou ISO datetime
            if (horario.includes("T")) {
                data = new Date(horario);
            } else {
                // Assumir formato HH:mm
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

        // Verifica se a data é válida
        if (isNaN(dataObj.getTime())) {
            return "Data inválida";
        }

        return dataObj.toLocaleDateString("pt-BR");
    } catch {
        return "Data inválida";
    }
}

export default function DetalharEventoPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const eventoId = Number(params.id);
    const qrRef = React.useRef<HTMLDivElement>(null);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const urlCheckIn = `${origin}/presenca/${eventoId}/check-in`;

    const { data: evento, isLoading } = useQuery({
        queryKey: ["evento", eventoId],
        queryFn: async () => {
            return await eventoService.getById(eventoId);
        },
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
        const printWindow = window.open("", "", "height=400,width=400");
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
                                }
                                h1 {
                                    margin-bottom: 20px;
                                    text-align: center;
                                }
                                img {
                                    max-width: 100%;
                                    height: auto;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>${evento?.nome}</h1>
                            <img src="${image}" />
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    if (isLoading) {
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações do Evento */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold mb-6">{evento.nome}</h1>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                ID do Evento
                            </label>
                            <p className="text-lg font-semibold">{evento.id}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Data
                            </label>
                            <p className="text-lg font-semibold">
                                {formatarData(evento.dataInicio)}
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

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                            <p className="text-sm text-blue-800">
                                <strong>💡 Dica:</strong> Use o QR code ao lado
                                para registrar presenças. Os alunos podem
                                escanear para validar sua presença no evento.
                            </p>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-6">QR Code</h2>

                    <div
                        ref={qrRef}
                        className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-6"
                    >
                        <QRCode size={300} value={urlCheckIn} />
                    </div>

                    <p className="text-sm text-gray-600 text-center mb-6">
                        Escaneie o código para registrar presença no evento
                    </p>

                    <div className="flex gap-3 w-full flex-col sm:flex-row">
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={handleDownloadQR}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Baixar QR Code
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handlePrintQR}
                        >
                            🖨️ Imprimir
                        </Button>
                    </div>
                </div>
            </div>
        </Page>
    );
}
