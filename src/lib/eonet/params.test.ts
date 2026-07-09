// src/lib/eonet/params.test.ts
import { describe, expect, it } from "vitest";
import { clampDays } from "./params";

describe("clampDays", () => {
    it.each([
        [null, 60],        // default
        ["30", 30],        // normal
        ["banana", 60],    // garbage
        ["-5", 1],         // clamp low
        ["9999", 365],     // clamp high
        ["7.9", 7],        // truncate
        ["365", 365],      // upper boundary
        ["1", 1],          // lower boundary
        ["", 1],           // empty string → Number("") is 0 → clamps up to 1
        ["  42  ", 42],    // whitespace-padded numeric string
        ["0", 1],          // zero clamps up to 1
        ["-0.5", 1],       // negative fraction truncates toward 0 then clamps
    ])("clampDays(%s) → %i", (input, expected) => {
        expect(clampDays(input)).toBe(expected);
    });
});
