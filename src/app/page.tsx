"use client";

import { useEffect, useMemo, useState } from "react";
import type { Fire } from "@/lib/eonet/types";
import { firesToGeoJSON, type FireProperties } from "@/lib/eonet/toGeoJSON";
import { Map, MapClusterLayer, MapPopup } from "@/components/ui/map";

export default function Home() {
    const [fires, setFires] = useState<Fire[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(60);
    const [selectedFire, setSelectedFire] = useState<Fire | null>(null);

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

    const firesGeoJSON = useMemo(() => firesToGeoJSON(fires), [fires]);

    return (
        <main className="h-dvh w-full">
            {(loading || error) && (
                <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-md bg-white px-3 py-1.5 text-sm shadow-md">
                    {error ? (
                        <span className="text-red-600">{error}</span>
                    ) : (
                        <span className="text-gray-600">Loading fires…</span>
                    )}
                </div>
            )}
            <Map center={[-122.398, 37.785]} zoom={10}>
                <MapClusterLayer<FireProperties>
                    data={firesGeoJSON}
                    onPointClick={(feature) => {
                        const fire = fires.find(
                            (f) => f.id === feature.properties?.id,
                        );
                        if (fire) setSelectedFire(fire);
                    }}
                />
                {selectedFire && (
                    <MapPopup
                        longitude={selectedFire.latest.lon}
                        latitude={selectedFire.latest.lat}
                        closeButton
                        onClose={() => setSelectedFire(null)}
                    >
                        <div className="space-y-1">
                            <p className="font-semibold">{selectedFire.title}</p>
                            <p className="text-muted-foreground text-sm capitalize">
                                {selectedFire.status}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {new Date(selectedFire.latest.date).toLocaleString()}
                            </p>
                            {selectedFire.latest.magValue != null && (
                                <p className="text-muted-foreground text-sm">
                                    {selectedFire.latest.magValue}{" "}
                                    {selectedFire.latest.magUnit ?? ""}
                                </p>
                            )}
                        </div>
                    </MapPopup>
                )}
            </Map>
        </main>
    );
}
