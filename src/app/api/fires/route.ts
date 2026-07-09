import { fetchOpenWildfires } from "@/lib/eonet/client";
import { normalizeEvents } from "@/lib/eonet/normalize";

export async function GET() {
    try {
        const raw = await fetchOpenWildfires({ days: 60 });
        const fires = normalizeEvents(raw);
        return Response.json({ fires, fetchedAt: new Date().toISOString() });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: message }, { status: 502 });
    }
}