// src/lib/wfigs/types.ts

// Raw Shapes from WFIGS Current Interagency Fire Perimeters API

export type WfigsGeometry =
    | { type: "Polygon"; coordinates: number[][][] }
    | { type: "MultiPolygon"; coordinates: number[][][][] };

export interface WfigsCrsProperties {
    name: string; // "EPSG:4326"
}

export interface WfigsCrs {
    type: string; // "name"
    properties: WfigsCrsProperties;
}

export interface WfigsProperties {
    // ---- Identity ----
    /** IRWIN GUID, e.g. "{2E75C8B2-EC28-...}". Stable primary key across all WFIGS datasets. */
    attr_IrwinID: string;
    /** Fire name as reported, e.g. "El Rito Creek". */
    attr_IncidentName: string;
    /** Human-readable unique id: year-unit-number, e.g. "2026-NMN4S-000063". */
    attr_UniqueFireIdentifier: string | null;
    /** ArcGIS internal row id for this feature. Not stable across refreshes — don't key on it. */
    OBJECTID: number;

    // ---- Size & status ----
    /** Acreage measured from the perimeter polygon (GIS-calculated). */
    poly_GISAcres: number | null;
    /** Incident-reported acreage. Can differ from poly_GISAcres — reported vs. mapped. */
    attr_IncidentSize: number | null;
    /** Containment percentage, 0–100. Frequently null on new or small fires. */
    attr_PercentContained: number | null;
    /** Cause, e.g. "Undetermined", "Human", "Natural". */
    attr_FireCause: string | null;

    // ---- Location (POO = Point Of Origin) ----
    /** State where the fire started, e.g. "US-NM". Note the "US-" prefix. */
    attr_POOState: string | null;
    /** County of origin, e.g. "Guadalupe". */
    attr_POOCounty: string | null;

    // ---- Classification ----
    /** "WF" = wildfire, "RX" = prescribed burn, "CX" = incident complex. Filter on this. */
    attr_IncidentTypeCategory: string;

    // ---- Timestamps (ALL epoch milliseconds, not ISO strings) ----
    /** When the fire was first discovered/reported. */
    attr_FireDiscoveryDateTime: number | null;
    /** When declared contained. Null while still active. */
    attr_ContainmentDateTime: number | null;
    /** When declared out. Null while still burning. */
    attr_FireOutDateTime: number | null;
    /** When this perimeter record was last current — your freshness indicator. */
    poly_DateCurrent: number | null;
    /** When the polygon itself was captured/mapped. */
    poly_PolygonDateTime: number | null;

    // ---- Record validity flags ----
    /** "Yes" / "No" — whether the source marks this perimeter as publicly displayable. */
    poly_IsVisible: string | null;
    /** Review state, e.g. "Approved". */
    poly_FeatureStatus: string | null;
}

export interface WfigsFeature {
    type: "Feature";
    id: number;
    geometry: WfigsGeometry;
    properties: WfigsProperties;
}

export interface WfigsFeatureCollection {
    type: "FeatureCollection";
    crs: WfigsCrs;
    features: WfigsFeature[];
}

// Cleaned Internal Types holding GeoJSON Fire Perimeter shapes and Supplementary Data