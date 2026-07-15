// src/lib/eonet/toGeoJSON.test.ts
import { describe, expect, it } from "vitest";
import { firesToGeoJSON } from "./toGeoJSON";
import type { Fire, Observation } from "./types";

function makeObservation(overrides: Partial<Observation> = {}): Observation {
    return {
        date: "2026-01-01T00:00:00Z",
        lon: -120.5,
        lat: 38.5,
        magValue: null,
        magUnit: null,
        ...overrides,
    };
}

function makeFire(overrides: Partial<Fire> = {}): Fire {
    const track = overrides.track ?? [makeObservation()];

    return {
        id: "EONET_1",
        title: "Test Fire",
        sourceId: "InciWeb",
        sourceUrl: "https://inciweb.nwcg.gov/incident/1234",
        status: "open",
        track,
        latest: track[track.length - 1],
        ...overrides,
    };
}

describe("firesToGeoJSON", () => {
    it("returns an empty FeatureCollection for an empty fires list", () => {
        expect(firesToGeoJSON([])).toEqual({
            type: "FeatureCollection",
            features: [],
        });
    });

    it("maps a Fire to a Point Feature using the latest observation's coordinates", () => {
        const fire = makeFire({
            latest: makeObservation({ lon: -100, lat: 40 }),
        });

        const { features } = firesToGeoJSON([fire]);

        expect(features).toHaveLength(1);
        expect(features[0]).toEqual({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [-100, 40],
            },
            properties: {
                id: "EONET_1",
                title: "Test Fire",
                status: "open",
                date: "2026-01-01T00:00:00Z",
                magValue: null,
                magUnit: null,
            },
        });
    });

    it("carries over id, title, status, date, and magnitude into properties", () => {
        const fire = makeFire({
            id: "EONET_42",
            title: "Wildfire Maze",
            status: "closed",
            latest: makeObservation({
                date: "2026-03-05T12:00:00Z",
                magValue: 12.3,
                magUnit: "acres",
            }),
        });

        const { features } = firesToGeoJSON([fire]);

        expect(features[0].properties).toEqual({
            id: "EONET_42",
            title: "Wildfire Maze",
            status: "closed",
            date: "2026-03-05T12:00:00Z",
            magValue: 12.3,
            magUnit: "acres",
        });
    });

    it("uses latest rather than earlier track entries for coordinates and date", () => {
        const track = [
            makeObservation({ date: "2026-01-01T00:00:00Z", lon: -101, lat: 41 }),
            makeObservation({ date: "2026-01-03T00:00:00Z", lon: -100, lat: 40 }),
        ];
        const fire = makeFire({ track, latest: track[1] });

        const { features } = firesToGeoJSON([fire]);

        expect(features[0].geometry.coordinates).toEqual([-100, 40]);
        expect(features[0].properties?.date).toBe("2026-01-03T00:00:00Z");
    });

    it("maps multiple fires to multiple features in order", () => {
        const fireA = makeFire({ id: "EONET_A" });
        const fireB = makeFire({ id: "EONET_B" });

        const { features } = firesToGeoJSON([fireA, fireB]);

        expect(features.map((f) => f.properties?.id)).toEqual([
            "EONET_A",
            "EONET_B",
        ]);
    });
});
