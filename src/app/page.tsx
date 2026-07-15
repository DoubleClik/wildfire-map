"use client";

import { useEffect, useState } from "react";
import type { Fire } from "@/lib/eonet/types";
import { Map, MapGeoJSON } from "@/components/ui/map";

// Inline GeoJSON polygon covering a downtown area.
const area: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-122.42, 37.78],
            [-122.398, 37.785],
            [-122.392, 37.768],
            [-122.412, 37.758],
            [-122.43, 37.77],
            [-122.42, 37.78],
          ],
        ],
      },
    },
  ],
};

export default function Home() {
    const [fires, setFires] = useState<Fire[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(60);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/api/fires?days=${days}`);
                const data = await res.json();

                if (cancelled) return;

                if (!res.ok) {
                    setError(data.error ?? "Failed to load fires");
                    return;
                }

                setFires(data.fires);
            } catch {
                if (!cancelled) setError("Network error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
        
    }, [days]);

    return (
        <main className="h-dvh w-full">
            <Map center={[-122.398, 37.785]} zoom={10}>
                <MapGeoJSON
                    data={area}
                    fillPaint={{ "fill-color": "#3b82f6", "fill-opacity": 0.25 }}
                    linePaint={{ "line-color": "#2563eb", "line-width": 2 }}
                />
            </Map>
        </main>
    );
}
