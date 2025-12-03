import { useState, useCallback } from "react";

export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface UseGeolocationReturn {
    location: GeoLocation | null;
    loading: boolean;
    error: string | null;
    getLocation: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocalização não é suportada pelo seu navegador");
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
        );
    }, []);

    return { location, loading, error, getLocation };
}
