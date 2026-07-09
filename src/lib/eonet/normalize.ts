// src/lib/eonet/normalize.ts
import type {
    EonetEvent,
    EonetGeometryPoint,
    EonetResponse,
    Fire,
    Observation,
} from "./types";

/**
 * Convert a raw EONET response into clean internal Fire objects.
 * Skips malformed events (no usable geometry) rather than throwing.
 */
export function normalizeEvents(raw: EonetResponse): Fire[] {
    const fires: Fire[] = [];

    for (const event of raw.events) {
        const fire = normalizeEvent(event);

        if (fire) {
            fires.push(fire);
        } else {
            console.warn(`Skipping malformed EONET event: ${event.id}`);
        }
    }

    return fires;
}

/** Returns null if the event has no usable geometry. */
function normalizeEvent(event: EonetEvent): Fire | null {
    // Return null if Empty or EonetGeometryPoint is missing
    if (!Array.isArray(event.geometry) || event.geometry.length === 0) {
        return null;
    }

    // Map each geometry point to an Observation
    const track: Observation[] = event.geometry.map(toObservation);

    // Sort ascending by date
    track.sort((a, b) => a.date.localeCompare(b.date));

    // Assemble pieces, build, and return Fire
    const latest = track[track.length - 1];
    const status = event.closed ? "closed" : "open";
    const firstSource = event.sources[0];

    return {
        id: event.id,
        title: event.title,
        sourceId: firstSource?.id ?? null,
        sourceUrl: firstSource?.url ?? null,
        status,
        track,
        latest,
    };
}

/** Convert raw EonetGeometryPoint to clean Observation */
function toObservation(point: EonetGeometryPoint): Observation {
    return {
        date: point.date,
        lon: point.coordinates[0],
        lat: point.coordinates[1],
        magValue: point.magnitudeValue ?? null,
        magUnit: point.magnitudeUnit ?? null
    };
}