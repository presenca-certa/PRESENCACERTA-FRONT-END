"use client";

import React, { useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { GeolocationUtil } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import { useToast } from "@/hooks/use-toast";

interface EventoData {
    id: number;
    nome: string;
    local?: {
        id: number;
        latitude: number;
        longitude: number;
        raio: number;
    };
}

export default function ValidarPresencaPage() {
    const {
        location,
        loading: geoLoading,
        error: geoError,
        getLocation,
    } = useGeolocation();
    const { toast } = useToast();
    const [qrCode, setQrCode] = useState("");
    const [eventoId, setEventoId] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState<any>(null);

    const handleValidatePresenca = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!location) {
            toast({
                description: "É necessário capturar sua localização",
                variant: "destructive",
            });
            return;
        }

        if (!eventoId) {
            toast({
                description: "ID do evento é obrigatório",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/presenca", {
                matricula: qrCode,
                eventoId: Number(eventoId),
                latitude: location.latitude,
                longitude: location.longitude,
                dataPresenca: new Date(),
                horaPresenca: new Date(),
            });

            setValidationResult({
                success: true,
                message: "Presença registrada com sucesso!",
                data: response.data,
            });

            toast({
                description: "Presença validada e registrada com sucesso!",
            });

            setQrCode("");
            setEventoId("");
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message || "Erro ao registrar presença";

            setValidationResult({
                success: false,
                message: errorMsg,
                error: error.response?.data,
            });

            toast({
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-center mb-2 text-green-900">
                        UNICHAMADA
                    </h1>
                    <p className="text-center text-gray-600 mb-8">
                        Validação de Frequência
                    </p>

                    <form
                        onSubmit={handleValidatePresenca}
                        className="space-y-6"
                    >
                        {/* Seção de Geolocalização */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-3">
                                Localização
                            </h3>

                            {geoError && (
                                <div className="bg-red-100 text-red-800 p-3 rounded mb-3 text-sm">
                                    Erro: {geoError}
                                </div>
                            )}

                            {location ? (
                                <div className="bg-green-100 text-green-800 p-3 rounded mb-3 text-sm">
                                    <p className="font-semibold">
                                        ✓ Localização capturada
                                    </p>
                                    <p>Lat: {location.latitude.toFixed(5)}</p>
                                    <p>Lon: {location.longitude.toFixed(5)}</p>
                                </div>
                            ) : (
                                <div className="bg-yellow-100 text-yellow-800 p-3 rounded text-sm">
                                    Toque o botão abaixo para capturar sua
                                    localização
                                </div>
                            )}

                            <Button
                                type="button"
                                onClick={getLocation}
                                disabled={geoLoading || loading}
                                className="w-full bg-blue-600 hover:bg-blue-500"
                            >
                                {geoLoading
                                    ? "Capturando..."
                                    : "📍 Capturar Localização"}
                            </Button>
                        </div>

                        {/* Seção de Evento */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID do Evento
                            </label>
                            <Input
                                type="number"
                                value={eventoId}
                                onChange={(e) => setEventoId(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Ex: 1"
                            />
                        </div>

                        {/* Seção de QR Code */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Matrícula / QR Code
                            </label>
                            <Input
                                type="text"
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                required
                                disabled={loading}
                                placeholder="Escaneie o QR code ou digite a matrícula"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-green-800 hover:bg-green-700 text-white font-medium py-2 rounded-lg"
                            disabled={loading || !location}
                        >
                            {loading ? "Validando..." : "Validar Presença"}
                        </Button>
                    </form>

                    {/* Resultado da Validação */}
                    {validationResult && (
                        <div
                            className={`mt-6 p-4 rounded-lg ${
                                validationResult.success
                                    ? "bg-green-100 border border-green-300"
                                    : "bg-red-100 border border-red-300"
                            }`}
                        >
                            <p
                                className={`font-semibold ${
                                    validationResult.success
                                        ? "text-green-800"
                                        : "text-red-800"
                                }`}
                            >
                                {validationResult.success ? "✓" : "✗"}{" "}
                                {validationResult.message}
                            </p>
                            {validationResult.data && (
                                <p className="text-sm mt-2 text-gray-700">
                                    Hora:{" "}
                                    {new Date(
                                        validationResult.data.dataPresenca,
                                    ).toLocaleTimeString("pt-BR")}
                                </p>
                            )}
                        </div>
                    )}

                    <p className="text-center text-gray-500 text-xs mt-6">
                        Sua localização será usada apenas para validar sua
                        presença no local do evento
                    </p>
                </div>
            </div>
        </div>
    );
}
