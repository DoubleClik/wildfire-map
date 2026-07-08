// src/lib/eonet/client.ts
import type { EonetResponse } from "./types";

const EONET_BASE = "https://eonet.gsfc.nasa.gov/api/v3/events";
const TIMEOUT_MS = 10000;

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
    const { days = 60, bbox } = options; // default

    // Build the URL with URLSearchParams
    //    - i.e. Default URL: https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&days=60
    //    - category=wildfires, status=open, days=<days>
    const params = new URLSearchParams({
        category: "wildfires",
        status: "open",
        days: String(days),
    });
    //    - append boundingbox params only if provided
    if (bbox) {
        params.append("bbox", bbox);
    }

    const url = `${EONET_BASE}?${params.toString()}`;

    let response: Response;
    try {
        // Fetch with a timeout
        response = await fetch(url, {
            signal: AbortSignal.timeout(TIMEOUT_MS), // aborts the request automatically after TIMEOUT_MS
            next: { revalidate: 300 } // be polite to NASA, we'll just reuse the same cached fetch for up to 5 minutes
        });
    } catch (err) {
        if (err instanceof DOMException && err.name === "TimeoutError") {
            throw new Error(`EONET timed out after ${TIMEOUT_MS}ms`);
        }

        if (err instanceof Error) {
            throw new Error(`Network error reaching EONET: ${err.message}`);
        }

        throw new Error("Unknown error reaching EONET");
    }

    // Handle non-200 responses with a useful message
    if (!response.ok) {
        throw new Error(`EONET responded ${response.status} for ${url}`);
    }

    // Parse and return, typed
    const data = (await response.json()) as EonetResponse;

    // Throw an error if the shape of the data doesn't match our interfaces in types.ts
    if (!Array.isArray(data.events)) {
        throw new Error("Unexpected EONET response shape: missing events array");
    }

    return data;
}
