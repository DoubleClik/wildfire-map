// src/app/api/fires/route.ts
import { fetchOpenWildfires } from "@/lib/eonet/client";
import { normalizeEvents } from "@/lib/eonet/normalize";
import { clampDays } from "@/lib/eonet/params";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const days = clampDays(searchParams.get("days"));

    try {
        const raw = await fetchOpenWildfires({ days });
        const fires = normalizeEvents(raw);

        return Response.json({
            fires,
            fetchedAt: new Date().toISOString(),
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";

        return Response.json({ error: message }, { status: 502 });
    }
}