export type PartsInfo = {
  number: string;
  name: string;
  type?: string;
  dimensions?: string;
};

function n(value: number) {
  return `( ${String(value).padStart(2, "0")}. )`;
}

// /caption's info layer wants every "a. .../b. .../c. ..." unit of a
// multi-part dimension string on its own line ("모든 글은 단위로 줄바꿈") —
// stricter than the hover text layers' single forced break (see
// PartsGallery.tsx/FurnitureGallery.tsx, which keep their own `\n` in
// rectangle 27's dimensions for a narrower-width break). This re-derives the
// full per-unit split from the same source string without touching that
// existing `\n`, so it works for both: strings with no lettered units come
// back as a single-element array.
export function splitDimensionUnits(dimensions: string): string[] {
  const normalized = dimensions.replace(/\n/g, " ");
  const units = normalized.split(/,\s+(?=[a-z]\.\s)/);
  return units.length > 1 ? units : [normalized];
}

// /main/parts hover text-layer content, keyed by Figma "Rectangle N" identity
// (see PARTS_RECTANGLE_NUMBERS in works.ts) — supplied directly by the user,
// separate from the design reference (get_design_context nodeId 54:217,
// which showed the text layer's font/spacing only). `number` isn't derived
// from the rectangle key: the source numbering skips 16 (15 -> 17) and
// repeats 49 (rectangles 48 and 49 are both "( 49. )") — kept verbatim.
export const PARTS_INFO: Record<number, PartsInfo> = {
  1: { number: n(1), name: "bobbin" },
  2: {
    number: n(2),
    name: "swivel",
    type: "lamp, or paper rack",
    dimensions: "865 × 460 × 350 mm",
  },
  3: { number: n(3), name: "rat guard" },
  4: { number: n(4), name: "bow" },
  5: { number: n(5), name: "Grating" },
  6: { number: n(6), name: "door hinge" },
  7: { number: n(7), name: "paver" },
  8: { number: n(8), name: "wire clamp" },
  9: { number: n(9), name: "cleat" },
  10: { number: n(10), name: "doorpin", type: "table", dimensions: "850 × 850 × 1100 mm" },
  11: { number: n(11), name: "Vent Grile" },
  12: { number: n(12), name: "eye bolt" },
  13: { number: n(13), name: "level", type: "vase", dimensions: "600 × 20 × 1500mm" },
  14: { number: n(14), name: "Trussbar" },
  15: { number: n(15), name: "horse collar" },
  16: { number: n(17), name: "spring" },
  17: { number: n(18), name: "U-bolt clamp" },
  18: { number: n(19), name: "gargoyle" },
  19: { number: n(20), name: "logque" },
  20: { number: n(21), name: "caster", type: "wagon", dimensions: "550 × 270 × 770 mm" },
  21: { number: n(22), name: "buckle" },
  22: {
    number: n(23),
    name: "vessel lock",
    type: "a bookshelf",
    dimensions: "340 × 1940 × 600 mm",
  },
  23: { number: n(24), name: "flag holder" },
  24: { number: n(25), name: "end cap" },
  25: { number: n(26), name: "hook" },
  26: { number: n(27), name: "winder" },
  27: {
    number: n(28),
    name: "foot sole",
    type: "a space divider",
    // Hard-broken before "c." per the user's spec — not left to wrap
    // naturally, unlike the other multi-line dimension strings.
    dimensions:
      "a. 770 × 2000 × 80 mm, b. 770 × 1900 × 40 mm,\nc. 770 × 1895 × 40 mm, d. 770 × 1545 × 40 mm",
  },
  28: { number: n(29), name: "cable lug" },
  29: {
    number: n(30),
    name: "muffler",
    type: "system hanger",
    dimensions: "100 × 100 × 1800 mm (main)",
  },
  30: {
    number: n(31),
    name: "snapring",
    type: "shelf / display",
    dimensions: "440 × 600 × 60 mm",
  },
  31: { number: n(32), name: "Postpone" },
  32: { number: n(33), name: "pulley", type: "side table", dimensions: "400 × 400 × 750 mm" },
  33: {
    number: n(34),
    name: "socket coupling",
    type: "a carpet carrier",
    dimensions: "200 × 200 × 670 mm",
  },
  34: { number: n(35), name: "joint part" },
  35: { number: n(36), name: "clamp", type: "table", dimensions: "985 × 1425 × 800 mm" },
  36: {
    number: n(37),
    name: "steel channel",
    type: "a rack",
    dimensions: "700 × 1800 × 180 mm",
  },
  37: { number: n(38), name: "Presser feet" },
  38: { number: n(39), name: "Hose clamp" },
  39: { number: n(40), name: "Strap" },
  40: { number: n(41), name: "door hinge" },
  41: { number: n(42), name: "rack" },
  42: { number: n(43), name: "Frame rib" },
  43: { number: n(44), name: "Wheel chocks" },
  44: { number: n(45), name: "T track", type: "paper shelf", dimensions: "210 × 1700 × 20 mm" },
  45: { number: n(46), name: "magnetic clasps" },
  46: {
    number: n(47),
    name: "piano hinge",
    type: "display, or cabinet",
    dimensions: "700 × 1300 × 300 mm",
  },
  47: {
    number: n(48),
    name: "metalball",
    type: "a fitting room",
    dimensions: "1440 × 1400 × 2010 mm",
  },
  48: { number: n(49), name: "cimping sleeve" },
  49: { number: n(49), name: "Shackle" },
  50: { number: n(50), name: "Towhitch" },
  51: {
    number: n(51),
    name: "distribution board",
    type: "a storage cabinet",
    dimensions: "335 × 400 × 2300 mm",
  },
  52: { number: n(52), name: "Door lock" },
  53: { number: n(53), name: "pipe bracket", type: "a hanger", dimensions: "900 × 200 × 200 mm" },
};
