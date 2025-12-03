"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page } from "@/components/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/api/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import MapSelector from "./components/MapSelector";

interface Localizacao {
    id: number;
    latitude: number;
    longitude: number;
    raio: number;
    descricao?: string;
}

export default function LocalizacoesPage() {
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [formData, setFormData] = useState({
        latitude: "",
        longitude: "",
        raio: "50",
        descricao: "",
    });
    const [loading, setLoading] = useState(false);

    const { data: localizacoes = [], refetch } = useQuery({
        queryKey: ["localizacoes"],
        queryFn: async () => {
            const response = await api.get("/localizacao");
            return response.data as Localizacao[];
        },
    });

    const handleMapSelect = (lat: number, lng: number) => {
        setFormData({
            ...formData,
            latitude: lat.toString(),
            longitude: lng.toString(),
        });
        setShowMap(false);
        toast({
            description: "Coordenadas selecionadas do mapa",
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/localizacao", {
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                raio: Number(formData.raio),
                descricao: formData.descricao || null,
            });

            toast({
                description: "Localização criada com sucesso",
            });

            setFormData({
                latitude: "",
                longitude: "",
                raio: "50",
                descricao: "",
            });
            setShowForm(false);
            refetch();
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message ||
                    "Erro ao criar localização",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja deletar esta localização?"))
            return;

        try {
            await api.delete(`/localizacao/${id}`);
            toast({
                description: "Localização deletada com sucesso",
            });
            refetch();
        } catch (error: any) {
            toast({
                description:
                    error.response?.data?.message ||
                    "Erro ao deletar localização",
                variant: "destructive",
            });
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                    });
                    setLoading(false);
                    toast({
                        description: "Localização capturada com sucesso",
                    });
                },
                (error) => {
                    setLoading(false);
                    toast({
                        description: "Erro ao capturar localização",
                        variant: "destructive",
                    });
                },
            );
        }
    };

    return (
        <Page>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Localizações</h1>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-red-800 hover:bg-red-700"
                >
                    {showForm ? "Cancelar" : "Nova Localização"}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Criar Nova Localização
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Latitude
                                </label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    value={formData.latitude}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            latitude: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={loading}
                                    placeholder="-23.5505"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Longitude
                                </label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    value={formData.longitude}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            longitude: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={loading}
                                    placeholder="-46.6333"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Raio (metros)
                                </label>
                                <Input
                                    type="number"
                                    value={formData.raio}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            raio: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                    min="10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Descrição
                                </label>
                                <Input
                                    type="text"
                                    value={formData.descricao}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            descricao: e.target.value,
                                        })
                                    }
                                    disabled={loading}
                                    placeholder="Ex: Sala de Aula 101"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={getCurrentLocation}
                                className="flex-1 bg-blue-600 hover:bg-blue-500"
                                disabled={loading}
                            >
                                📍 Usar Localização Atual
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowMap(!showMap)}
                                className="flex-1 bg-purple-600 hover:bg-purple-500"
                                disabled={loading}
                            >
                                🗺️ Selecionar no Mapa
                            </Button>
                        </div>

                        {showMap && (
                            <div className="border rounded-lg overflow-hidden">
                                <MapSelector
                                    onSelectLocation={handleMapSelect}
                                    initialLat={
                                        formData.latitude
                                            ? Number(formData.latitude)
                                            : -23.5505
                                    }
                                    initialLng={
                                        formData.longitude
                                            ? Number(formData.longitude)
                                            : -46.6333
                                    }
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="bg-red-800 hover:bg-red-700 w-full"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Localização"}
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {localizacoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Nenhuma localização encontrada
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Latitude</TableHead>
                                <TableHead>Longitude</TableHead>
                                <TableHead>Raio (m)</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localizacoes.map((loc) => (
                                <TableRow key={loc.id}>
                                    <TableCell className="font-medium">
                                        {loc.descricao || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {loc.latitude.toFixed(5)}
                                    </TableCell>
                                    <TableCell>
                                        {loc.longitude.toFixed(5)}
                                    </TableCell>
                                    <TableCell>{loc.raio}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(loc.id)}
                                        >
                                            Deletar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </Page>
    );
}
