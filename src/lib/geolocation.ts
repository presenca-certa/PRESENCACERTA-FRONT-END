export interface GeoLocationValidation {
    isValid: boolean;
    distance: number;
    message: string;
}

export class GeolocationUtil {
    /**
     * Calcula a distância entre dois pontos usando a fórmula de Haversine
     * Distância em metros
     */
    static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371000; // Raio da Terra em metros
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
                Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Converte graus para radianos
     */
    private static toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Valida se um local está dentro do raio permitido
     */
    static validateLocation(
        userLat: number,
        userLon: number,
        eventLat: number,
        eventLon: number,
        radiusInMeters: number = 50,
    ): GeoLocationValidation {
        const distance = this.calculateDistance(
            userLat,
            userLon,
            eventLat,
            eventLon,
        );

        return {
            isValid: distance <= radiusInMeters,
            distance,
            message:
                distance <= radiusInMeters
                    ? `Localização validada. Distância: ${distance.toFixed(2)}m`
                    : `Fora do raio permitido. Distância: ${distance.toFixed(
                          2,
                      )}m (máximo: ${radiusInMeters}m)`,
        };
    }
}
