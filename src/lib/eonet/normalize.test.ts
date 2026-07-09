// src/lib/eonet/normalize.test.ts
import { describe, expect, it, vi } from "vitest";
import { normalizeEvents } from "./normalize";
import type { EonetEvent, EonetResponse, EonetGeometryPoint } from "./types";

function makePoint(overrides: Partial<EonetGeometryPoint> = {}): EonetGeometryPoint {
    return {
        date: "2026-01-01T00:00:00Z",
        type: "Point",
        coordinates: [-120.5, 38.5],
        magnitudeValue: null,
        magnitudeUnit: null,
        ...overrides,
    };
}

function makeEvent(overrides: Partial<EonetEvent> = {}): EonetEvent {
    return {
        id: "EONET_1",
        title: "Test Fire",
        description: null,
        link: "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_1",
        closed: null,
        categories: [{ id: "wildfires", title: "Wildfires" }],
        sources: [{ id: "InciWeb", url: "https://inciweb.nwcg.gov/incident/1234" }],
        geometry: [makePoint()],
        ...overrides,
    };
}

function makeResponse(events: EonetEvent[]): EonetResponse {
    return {
        title: "EONET Events",
        description: "Natural events",
        link: "https://eonet.gsfc.nasa.gov/api/v3/events",
        events,
    };
}

describe("normalizeEvents", () => {
    it("maps a well-formed event to a Fire", () => {
        const raw = makeResponse([makeEvent()]);

        const [fire] = normalizeEvents(raw);

        expect(fire).toEqual({
            id: "EONET_1",
            title: "Test Fire",
            sourceId: "InciWeb",
            sourceUrl: "https://inciweb.nwcg.gov/incident/1234",
            status: "open",
            track: [
                {
                    date: "2026-01-01T00:00:00Z",
                    lon: -120.5,
                    lat: 38.5,
                    magValue: null,
                    magUnit: null,
                },
            ],
            latest: {
                date: "2026-01-01T00:00:00Z",
                lon: -120.5,
                lat: 38.5,
                magValue: null,
                magUnit: null,
            },
        });
    });

    it("marks status closed when the event has a closed date", () => {
        const raw = makeResponse([makeEvent({ closed: "2026-02-01T00:00:00Z" })]);

        const [fire] = normalizeEvents(raw);

        expect(fire.status).toBe("closed");
    });

    it("marks status open when closed is null", () => {
        const raw = makeResponse([makeEvent({ closed: null })]);

        const [fire] = normalizeEvents(raw);

        expect(fire.status).toBe("open");
    });

    it("sorts the track ascending by date regardless of input order", () => {
        const raw = makeResponse([
            makeEvent({
                geometry: [
                    makePoint({ date: "2026-01-03T00:00:00Z" }),
                    makePoint({ date: "2026-01-01T00:00:00Z" }),
                    makePoint({ date: "2026-01-02T00:00:00Z" }),
                ],
            }),
        ]);

        const [fire] = normalizeEvents(raw);

        expect(fire.track.map((o) => o.date)).toEqual([
            "2026-01-01T00:00:00Z",
            "2026-01-02T00:00:00Z",
            "2026-01-03T00:00:00Z",
        ]);
    });

    it("sets latest to the most recent observation after sorting", () => {
        const raw = makeResponse([
            makeEvent({
                geometry: [
                    makePoint({ date: "2026-01-03T00:00:00Z", coordinates: [-100, 40] }),
                    makePoint({ date: "2026-01-01T00:00:00Z", coordinates: [-101, 41] }),
                ],
            }),
        ]);

        const [fire] = normalizeEvents(raw);

        expect(fire.latest.date).toBe("2026-01-03T00:00:00Z");
        expect(fire.latest.lon).toBe(-100);
        expect(fire.latest.lat).toBe(40);
    });

    it("passes through magnitude value and unit when present", () => {
        const raw = makeResponse([
            makeEvent({
                geometry: [makePoint({ magnitudeValue: 12.3, magnitudeUnit: "acres" })],
            }),
        ]);

        const [fire] = normalizeEvents(raw);

        expect(fire.latest.magValue).toBe(12.3);
        expect(fire.latest.magUnit).toBe("acres");
    });

    it("defaults magnitude value and unit to null when missing", () => {
        const raw = makeResponse([
            makeEvent({
                geometry: [makePoint({ magnitudeValue: null, magnitudeUnit: null })],
            }),
        ]);

        const [fire] = normalizeEvents(raw);

        expect(fire.latest.magValue).toBeNull();
        expect(fire.latest.magUnit).toBeNull();
    });

    it("sets sourceId and sourceUrl to null when there are no sources", () => {
        const raw = makeResponse([makeEvent({ sources: [] })]);

        const [fire] = normalizeEvents(raw);

        expect(fire.sourceId).toBeNull();
        expect(fire.sourceUrl).toBeNull();
    });

    it("uses only the first source when multiple are present", () => {
        const raw = makeResponse([
            makeEvent({
                sources: [
                    { id: "InciWeb", url: "https://inciweb.nwcg.gov/incident/1234" },
                    { id: "GeoMAC", url: "https://geomac.gov/incident/1234" },
                ],
            }),
        ]);

        const [fire] = normalizeEvents(raw);

        expect(fire.sourceId).toBe("InciWeb");
        expect(fire.sourceUrl).toBe("https://inciweb.nwcg.gov/incident/1234");
    });

    it("skips events with an empty geometry array and warns", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const raw = makeResponse([makeEvent({ id: "EONET_BAD", geometry: [] })]);

        const fires = normalizeEvents(raw);

        expect(fires).toEqual([]);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining("EONET_BAD"),
        );

        warnSpy.mockRestore();
    });

    it("skips events with non-array geometry and warns", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const raw = makeResponse([
            makeEvent({
                id: "EONET_BAD2",
                geometry: undefined,
            }),
        ]);

        const fires = normalizeEvents(raw);

        expect(fires).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("keeps well-formed events while skipping malformed ones in the same response", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const raw = makeResponse([
            makeEvent({ id: "EONET_GOOD_1" }),
            makeEvent({ id: "EONET_BAD", geometry: [] }),
            makeEvent({ id: "EONET_GOOD_2" }),
        ]);

        const fires = normalizeEvents(raw);

        expect(fires.map((f) => f.id)).toEqual(["EONET_GOOD_1", "EONET_GOOD_2"]);

        warnSpy.mockRestore();
    });

    it("returns an empty array for an empty events list", () => {
        const raw = makeResponse([]);

        expect(normalizeEvents(raw)).toEqual([]);
    });
});
