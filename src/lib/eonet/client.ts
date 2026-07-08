// src/lib/eonet/client.ts
import type { EonetResponse } from "./types";

const EONET_BASE = "https://eonet.gsfc.nasa.gov/api/v3/events";
const TIMEOUT_MS = 10_000;

interface FetchWildfiresOptions {
    days?: number; // how far back to look (default 60)
    bbox?: string; // optional "minLon,maxLat,maxLon,minLat"
}

/**
 * Fetch open wildfire events from EONET.
 * Throws on network failure, timeout, or non-200 response.
 */
export async function fetchOpenWildfires(
    options: FetchWildfiresOptions = {},
): Promise<EonetResponse> {
    const { days = 60, bbox } = options;

    // 1. Build the URL with URLSearchParams
    //    - category=wildfires, status=open, days=<days>
    //    - append bbox only if provided
    const params = new URLSearchParams({
        // TODO: fill in the query params
    });
    const url = `${EONET_BASE}?${params.toString()}`;

    let response: Response;
    try {
        // 2. Fetch with a timeout so a slow EONET can't hang your route.
        //    AbortSignal.timeout(TIMEOUT_MS) aborts the request automatically.
        response = await fetch(url, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
            // TODO (optional): Next.js caching behavior, e.g.
            // next: { revalidate: 300 }  — or leave default for now
        });
    } catch (err) {
        // 3. Distinguish timeout from other network failures.
        //    A timeout surfaces as an error named "TimeoutError" (a DOMException).
        // TODO: if (err instanceof DOMException && err.name === "TimeoutError") -> throw a clear "EONET timed out" error
        // TODO: otherwise → rethrow with a useful "network error reaching EONET" message
        throw err; // replace with your wrapped errors
    }

    // 4. Handle non-200 responses with a useful message
    if (!response.ok) {
        // TODO: throw an Error including response.status and url
        //       e.g. `EONET responded ${response.status} for ${url}`
    }

    // 5. Parse and return, typed
    // TODO: const data = await response.json(); return it as EonetResponse
    //       (Optionally sanity-check that data.events is an array before returning.)

    return undefined as never; // replace with your return
}
