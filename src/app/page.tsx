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
