// src/lib/eonet/types.ts

// Raw EONET Shapes
interface EonetGeometryPoint {
    date: string; // ISO timestamp
    type: "Point";
    coordinates: [number, number]; // [lon, lat]
    magnitudeValue: number | null;
    magnitudeUnit: string | null;
}

export interface EonetCategory {
    id: string; // e.g. "wildfires"
    title: string;
}

export interface EonetSource {
    id: string; // e.g. "InciWeb"
    url: string;
}

export interface EonetEvent {
    id: string; // e.g. "EONET_5359"
    title: string;
    description: string | null;
    link: string;
    closed: string | null; // null = still open, else ISO date
    // TODO: categories — array of which type above?
    // TODO: sources — array of which type above?
    // TODO: geometry — array of which type above?
}

export interface EonetResponse {
    title: string;
    description: string;
    link: string;
    // TODO: events — the mess
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
