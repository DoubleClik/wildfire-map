// src/lib/eonet/params.ts

/** Parse and clamp the ?days= query param. Defaults to 60; clamps to 1–365. */
export function clampDays(input: string | null): number {
    const parsed = Number(input ?? 60);

    if (!Number.isFinite(parsed)) {
        return 60;
    }

    return Math.min(Math.max(Math.trunc(parsed), 1), 365);
}