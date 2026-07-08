// src/lib/eonet/types.ts

// Raw EONET Shapes
export interface EonetCategory {
    id: string; // i.e. "wildfires"
    title: string;
}

export interface EonetSource {
    id: string; // i.e. "InciWeb"
    url: string;
}

export interface EonetGeometryPoint {
    date: string; // ISO timestamp
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
    magnitudeValue: number | null;
    magnitudeUnit: string | null;
}

export interface EonetEvent {
    id: string; // i.e. "EONET_5359"
    title: string; // i.e. "Wildfire Maze, Madison, Idaho"
    description: string | null;
    link: string;
    closed: string | null; // null = still open, else ISO date
    categories: EonetCategory[];
    sources: EonetSource[];
    geometry: EonetGeometryPoint[];
}

export interface EonetResponse {
    title: string;
    description: string;
    link: string;
    events: EonetEvent[];
}

// Cleaned Internal Types
interface Fire {
    id: string;
    title: string;
    sourceId: string | null;
    sourceUrl: string | null;
    status: "open" | "closed";
    track: Observation[]; // ordered oldest to newest
    latest: Observation; // convenience: last element of track
}

interface Observation {
    date: string;
    lon: number;
    lat: number;
    magValue: number | null;
    magUnit: string | null;
}
