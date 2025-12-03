"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PresencaService } from "@/services/Presenca";
import { useParamId } from "@/hooks/use-param-id";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/use-geolocation";
import api from "@/api/api";

interface ICheckIn {
    matricula: string;
}

interface LocalizacaoData {
    id: number;
    descricao: string;
    latitude: number;
    longitude: number;
    raio: number;
}

export default function CheckIn() {
    const form = useForm<ICheckIn>();
    const id = useParamId();
    const router = useRouter();
    const { toast } = useToast();
    const {
        location,
        loading: geoLoading,
        error: geoError,
        getLocation,
    } = useGeolocation();

    const [localizacaoValidada, setLocalizacaoValidada] = React.useState(false);
    const [distancia, setDistancia] = React.useState<number | null>(null);

    // Buscar dados do evento com useQuery
    const {
        data: evento,
        isLoading: loadingEvento,
        error: eventoError,
    } = useQuery({
        queryKey: ["evento", id],
        queryFn: async () => {
            const response = await api.get(`/evento/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    // Buscar dados da localização com useQuery
    const { data: localizacao } = useQuery({
        queryKey: ["localizacao", evento?.localId],
        queryFn: async () => {
            if (!evento?.localId) return null;
            const response = await api.get(`/localizacao/${evento.localId}`);
            return response.data as LocalizacaoData;
        },
        enabled: !!evento?.localId,
    });

    // Capturar geolocalização automaticamente quando evento carregar
    useEffect(() => {
        if (evento && !location && !geoLoading) {
            getLocation();
        }
    }, [evento, location, geoLoading, getLocation]);

    // Validar geolocalização quando a localização for capturada
    useEffect(() => {
        if (location && localizacao) {
            validarGeolocalização();
        } else if (location && !evento?.localId) {
            // Se não há localId no evento, considerar como validado
            setLocalizacaoValidada(true);
        } else if (!location) {
            setLocalizacaoValidada(false);
        }
    }, [location, localizacao]);

    const calcularDistancia = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ) => {
        const R = 6371; // Raio da Terra em km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Retorna em metros
    };

    const validarGeolocalização = async () => {
        if (!location || !localizacao) {
            setLocalizacaoValidada(false);
            return;
        }

        try {
            const dist = calcularDistancia(
                location.latitude,
                location.longitude,
                localizacao.latitude,
                localizacao.longitude,
            );

            setDistancia(dist);

            if (dist <= localizacao.raio) {
                setLocalizacaoValidada(true);
                toast({
                    description: `✓ Você está no local do evento (${dist.toFixed(
                        0,
                    )}m de distância)`,
                });
            } else {
                setLocalizacaoValidada(false);
                toast({
                    description: `✗ Você está fora do local do evento (${dist.toFixed(
                        0,
                    )}m de distância, limite: ${localizacao.raio}m)`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Erro ao validar geolocalização", error);
            setLocalizacaoValidada(false);
            toast({
                description: "Erro ao validar localização",
                variant: "destructive",
            });
        }
    };

    const { mutate, isPending } = useMutation<any, Error, ICheckIn>({
        mutationFn: async (data) => {
            // Se o evento tem localização, exigir validação
            if (evento?.localId) {
                if (!location) {
                    throw new Error(
                        "É necessário capturar sua localização antes de registrar presença",
                    );
                }

                if (!localizacaoValidada) {
                    throw new Error(
                        "Você não está no local do evento. Aproxime-se do local para registrar presença.",
                    );
                }
            }

            const now = new Date();

            const res = await PresencaService.createPresenca({
                eventoId: id,
                matricula: data.matricula,
                dataPresenca: now,
                horaPresenca: now,
            });

            return res;
        },
        onSuccess: () => {
            toast({
                description: "✓ Presença registrada com sucesso!",
            });
            setTimeout(() => {
                router.push(`/presenca/${id}/success`);
            }, 1000);
        },
        onError: (error: any) => {
            const errorMsg =
                error.message ||
                error.response?.data?.message ||
                "Erro ao registrar presença";
            toast({
                title: "Erro",
                description: errorMsg,
                variant: "destructive",
            });
        },
    });

    if (loadingEvento) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-blue-950">
                <p className="text-white">Carregando...</p>
            </div>
        );
    }

    if (eventoError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-blue-950">
                <p className="text-red-500">{eventoError.message}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen mx-auto p-4 bg-blue-950">
            <div className="flex flex-col bg-blue-950 items-center justify-center p-6 gap-6 rounded-lg w-96">
                <img
                    src="https://logo.uninassau.edu.br/img/svg/uninassau_n.svg"
                    width={240}
                    alt="logo Uninassau"
                />

                <div className="w-full">
                    <h2 className="text-white font-semibold mb-2 text-center">
                        {evento?.nome}
                    </h2>
                    <p className="text-blue-200 text-sm text-center">
                        Evento #{evento?.id}
                    </p>
                </div>

                {/* Seção de Geolocalização */}
                {evento?.localId && (
                    <div className="w-full bg-blue-900 rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-blue-100">
                            📍 Localização
                        </h3>

                        {geoError && (
                            <div className="bg-red-500/20 text-red-200 p-2 rounded text-xs">
                                Erro: {geoError}
                            </div>
                        )}

                        {location ? (
                            <div
                                className={`p-2 rounded text-xs ${
                                    localizacaoValidada
                                        ? "bg-green-500/20 text-green-200"
                                        : "bg-red-500/20 text-red-200"
                                }`}
                            >
                                <p className="font-semibold">
                                    {localizacaoValidada
                                        ? "✓ Localização válida"
                                        : "✗ Fora do local"}
                                </p>
                                {distancia && (
                                    <p className="text-xs mt-1">
                                        Distância: {distancia.toFixed(0)}m
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-yellow-500/20 text-yellow-200 p-2 rounded text-xs">
                                {geoLoading
                                    ? "📍 Capturando sua localização..."
                                    : "Toque o botão abaixo para capturar sua localização"}
                            </div>
                        )}

                        {!location && (
                            <Button
                                type="button"
                                onClick={getLocation}
                                disabled={geoLoading}
                                variant="outline"
                                className="w-full text-blue-50 border-blue-400 hover:bg-blue-900"
                            >
                                {geoLoading
                                    ? "Capturando..."
                                    : "📍 Capturar Localização"}
                            </Button>
                        )}
                    </div>
                )}

                <p className="mx-auto text-base font-medium text-white">
                    Matrícula
                </p>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((data) => mutate(data))}
                        className="w-full space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="matricula"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            className="w-full"
                                            type="text"
                                            placeholder="Insira sua matrícula"
                                            disabled={isPending}
                                            {...field}
                                            autoFocus
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-blue-800 rounded-xl text-blue-50 hover:bg-blue-700"
                            disabled={
                                isPending ||
                                (evento?.localId && !location) ||
                                (evento?.localId && !localizacaoValidada)
                            }
                        >
                            {isPending
                                ? "Registrando..."
                                : "Registrar presença"}
                        </Button>
                    </form>
                </Form>

                <p className="text-center text-blue-300 text-xs mt-4">
                    Sua localização será usada apenas para validar sua presença
                    no local do evento
                </p>
            </div>
        </div>
    );
}
