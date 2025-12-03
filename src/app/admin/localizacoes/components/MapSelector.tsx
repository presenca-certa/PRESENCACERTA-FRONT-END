"use client";

import { useState, useEffect, useRef } from "react";

interface MapSelectorProps {
    onSelectLocation: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function MapSelector({
    onSelectLocation,
    initialLat = -23.5505,
    initialLng = -46.6333,
}: MapSelectorProps) {
    const [markerPosition, setMarkerPosition] = useState<[number, number]>([
        initialLat,
        initialLng,
    ]);
    const [isClient, setIsClient] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    // Detectar localização atual
    useEffect(() => {
        if (
            navigator.geolocation &&
            initialLat === -23.5505 &&
            initialLng === -46.6333
        ) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setMarkerPosition([latitude, longitude]);
                onSelectLocation(latitude, longitude);
            });
        }
    }, []);

    // Inicializar mapa Leaflet
    useEffect(() => {
        setIsClient(true);

        // Apenas depois que estamos no cliente
        if (!isClient || !mapRef.current) return;

        const loadMap = async () => {
            const L = (await import("leaflet")).default;

            // Carregar CSS do Leaflet
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href =
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
            document.head.appendChild(link);

            // Criar mapa
            const map = L.map(mapRef.current!).setView(markerPosition, 15);

            // Adicionar tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19,
            }).addTo(map);

            // Adicionar marcador
            const marker = L.marker(markerPosition, {
                draggable: true,
            }).addTo(map);

            // Marcador clicável
            map.on("click", (e: any) => {
                const { lat, lng } = e.latlng;
                setMarkerPosition([lat, lng]);
                marker.setLatLng([lat, lng]);
                onSelectLocation(lat, lng);
            });

            // Arrastar marcador
            marker.on("dragend", () => {
                const position = marker.getLatLng();
                setMarkerPosition([position.lat, position.lng]);
                onSelectLocation(position.lat, position.lng);
            });

            mapInstanceRef.current = map;
        };

        loadMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, [isClient]);

    if (!isClient) {
        return (
            <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                Carregando mapa...
            </div>
        );
    }

    return (
        <div className="w-full">
            <div
                ref={mapRef}
                className="w-full h-96 border rounded-lg overflow-hidden relative"
                style={{ minHeight: "400px" }}
            />
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800 mb-2">
                    ✓ Coordenadas Selecionadas:
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-600">Latitude</p>
                        <p className="text-lg font-mono text-gray-800">
                            {markerPosition[0].toFixed(6)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Longitude</p>
                        <p className="text-lg font-mono text-gray-800">
                            {markerPosition[1].toFixed(6)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold mb-2">
                    💡 Como usar:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Clique no mapa para selecionar uma localização</li>
                    <li>Ou arraste o marcador para reposicionar</li>
                    <li>As coordenadas são atualizadas automaticamente</li>
                </ul>
            </div>
        </div>
    );
}
