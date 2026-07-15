// src/lib/eonet/toGeoJSON.ts
import type { Fire } from "./types";

export interface FireProperties {
    id: string;
    title: string;
    status: "open" | "closed";
    date: string;
    magValue: number | null;
    magUnit: string | null;
}

/** Take Fire type and return <GeoJSON.Point data, FireProperties type> */
export function firesToGeoJSON(
    fires: Fire[],
): GeoJSON.FeatureCollection<GeoJSON.Point, FireProperties> {
    return {
        type: "FeatureCollection",
        features: fires.map((fire) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [fire.latest.lon, fire.latest.lat],
            },
            properties: {
                id: fire.id,
                title: fire.title,
                status: fire.status,
                date: fire.latest.date,
                magValue: fire.latest.magValue,
                magUnit: fire.latest.magUnit,
            },
        })),
    };
}
