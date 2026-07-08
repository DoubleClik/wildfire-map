// src/lib/eonet/types.ts
interface EonetGeometryPoint {
  date: string;                    // ISO timestamp
  type: "Point";
  coordinates: [number, number];   // [lon, lat]
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
}

interface Fire {
  id: string;
  title: string;
  sourceId: string | null;
  sourceUrl: string | null;
  status: "open" | "closed";
  track: Observation[];      // ordered oldest to newest
  latest: Observation;       // convenience: last element of track
}

interface Observation {
  date: string;
  lon: number;
  lat: number;
  magValue: number | null;
  magUnit: string | null;
}