"use client";

import { useParamId } from "@/hooks/use-param-id";
import { QRCode } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import api from "@/api/api";

interface EventoData {
    id: number;
    nome: string;
}

export default function QrCodePage() {
    const id = useParamId();
    const [evento, setEvento] = useState<EventoData | null>(null);
    const [loading, setLoading] = useState(true);

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const urlCheckIn = `${origin}/presenca/${id}/check-in`;
    const tamanhoDaLogo = 300;

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const response = await api.get(`/evento/${id}`);
                setEvento(response.data);
            } catch (error) {
                console.error("Erro ao buscar evento", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvento();
        }
    }, [id]);

    return (
        <div className="text-white flex items-center justify-center min-h-screen mx-auto p-4 bg-blue-950">
            <div className="flex flex-col items-center justify-center p-6 gap-8 rounded-lg w-full max-w-md">
                <Image
                    src="https://logo.uninassau.edu.br/img/svg/uninassau_n.svg"
                    width={tamanhoDaLogo}
                    height={tamanhoDaLogo}
                    alt="logo Uninassau"
                />

                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold mb-2">
                                {evento?.nome || "Evento"}
                            </h1>
                            <p className="text-blue-200 text-sm">
                                Escaneie o QR Code para registrar sua presença
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow-xl">
                            <QRCode
                                size={300}
                                value={urlCheckIn}
                                level="H"
                                includeMargin
                            />
                        </div>

                        <div className="bg-blue-900 rounded-lg p-4 w-full text-center">
                            <p className="text-blue-100 text-sm">
                                ✓ Aponte a câmera do seu celular para o QR Code
                            </p>
                            <p className="text-blue-200 text-xs mt-2">
                                Ou acesse:{" "}
                                <span className="font-mono text-blue-100">
                                    {urlCheckIn.replace(`${origin}/`, "")}
                                </span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
