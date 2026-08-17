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
 * `.figma-pin` only switches from static to absolute positioning at the
 * lg breakpoint (1024px) — below that, elements stay in normal document
 * flow, since these frames are desktop-only references with no mobile
 * design. Always source x/y/width from get_metadata (exact, frame-relative
 * pixels), never approximate them with hand-tuned flex/grid gaps.
 */
export function createFigmaGeom(frameWidth: number, topBarHeight: number) {
  return function geom(x: number, y: number, w?: number): CSSProperties {
    return {
      ["--fx" as string]: `${(x / frameWidth) * 100}%`,
      ["--fy" as string]: `${y - topBarHeight}px`,
      ...(w !== undefined ? { ["--fw" as string]: `${(w / frameWidth) * 100}%` } : {}),
    } as CSSProperties;
  };
}
