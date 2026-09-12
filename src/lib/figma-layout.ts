import type { CSSProperties } from "react";

/**
 * Converts a Figma frame's raw x/y/width (from the MCP `get_metadata` tool,
 * NOT the approximate calc()/% values `get_design_context` sometimes emits)
 * into CSS custom properties for the `.figma-pin` utility class (globals.css).
 *
 * Horizontal values (`--fx`, `--fw`) are percentages of `frameWidth`, so they
 * scale with viewport width. Vertical value (`--fy`) is a fixed px offset
 * below `topBarHeight`, since page height is content-driven, not the Figma
 * frame's height — do not attempt to express `top` as a percentage.
 *
 * Pass `h` when the element is a box whose exact aspect ratio matters (e.g. a
 * masonry image tile) — it's applied as `aspectRatio: "w / h"`, which holds
 * the box's proportions correctly at any rendered width (a plain percentage
 * `height` would resolve against the parent's height, not its width, and
 * drift). Unlike `--fx`/`--fy`/`--fw`, aspect-ratio is NOT gated to `.figma-pin`'s
 * lg breakpoint — it should hold on the mobile static layout too.
 *
 * `.figma-pin` only switches from static to absolute positioning at the
 * lg breakpoint (1024px) — below that, elements stay in normal document
 * flow, since these frames are desktop-only references with no mobile
 * design. Always source x/y/width from get_metadata (exact, frame-relative
 * pixels), never approximate them with hand-tuned flex/grid gaps.
 */
export function createFigmaGeom(frameWidth: number, topBarHeight: number) {
  return function geom(x: number, y: number, w?: number, h?: number): CSSProperties {
    return {
      ["--fx" as string]: `${(x / frameWidth) * 100}%`,
      ["--fy" as string]: `${y - topBarHeight}px`,
      ...(w !== undefined ? { ["--fw" as string]: `${(w / frameWidth) * 100}%` } : {}),
      ...(w !== undefined && h !== undefined ? { aspectRatio: `${w} / ${h}` } : {}),
    } as CSSProperties;
  };
}

/** Formats a number as a px length string, e.g. `px(64)` -> `"64px"`. */
export function px(value: number) {
  return `${value}px`;
}

/**
 * Site-wide explicit request: past 1800px viewport width, every font size
 * grows by +1.5pt (e.g. 10pt -> 11.5pt) — a hard jump at 1800px, not a
 * gradual `clamp()` curve, permanently in effect above that width. Because
 * +1.5pt is a different RATIO for every base size (10->11.5 is 1.15x,
 * 11->12.5 is ~1.136x), there's no single site-wide scale factor — instead
 * globals.css defines one `--fontgrow-N` custom property PER BASE SIZE in
 * scope so far (currently 10 and 11 — see its own comment), each 1 normally
 * and (N+1.5)/N above 1800px, and every caller multiplies by the variable
 * matching ITS OWN base size. `fontgrow(10)` gives the font-size itself;
 * `growWith(10, someBoxWidth)` scales anything else (a text's own wrap
 * width, or a gap INTERNAL to that same text block) by that same text's
 * ratio — deliberately not page-layout anchors unrelated to any one text's
 * own rendering (margins, inter-column/inter-section gaps), which stay
 * fixed per explicit user confirmation. Line-heights expressed as unitless
 * multipliers (`leading-[1.4]` etc, used almost everywhere already) need no
 * separate call here — they scale for free once the font-size itself does.
 */
export function fontgrow(basePt: number) {
  return `calc(${basePt}px * var(--fontgrow-${basePt}, 1))`;
}

/** See `fontgrow`'s comment — scales `value`px by the SAME ratio as the
 * `basePt` font size it belongs to (not a formula of `value` itself). */
export function growWith(basePt: number, value: number) {
  return `calc(${value}px * var(--fontgrow-${basePt}, 1))`;
}
