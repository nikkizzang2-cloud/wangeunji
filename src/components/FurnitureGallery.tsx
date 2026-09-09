"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { useState } from "react";
import { furnitureGallery } from "@/data/works";
import { px, cqw } from "@/lib/figma-layout";
import MainSideNav from "./MainSideNav";

// Same hover text layer as PartsGallery.tsx, minus the numbering line (no
// "( N. )" here, per spec) — so only the dimensions line needs its own font.
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: "400" });

// Figma "/main.furniture" frame (get_metadata nodeId 23:1088): width=1920,
// height=3127.
//
// Same responsive split as PartsGallery.tsx: header/statement text/side nav
// are fixed-size, plain document flow; only the tile grid keeps scaling as
// one proportional block. GRID_Y_OFFSET/CANVAS_HEIGHT follow the same
// rebasing — see PartsGallery.tsx's comment for the full rationale, including
// GRID_X_OFFSET keeping the grid's left edge pinned to the same fixed 50px
// margin as the header/statement instead of drifting as the canvas scales.
const GRID_X_OFFSET = 50;
const CANVAS_WIDTH = 1920 - GRID_X_OFFSET;
const GRID_Y_OFFSET = 197;
// Grid canvas height = last tile's bottom edge (50.996,2483.24,502.95,343.29
// -> 2483.24+343.29), minus GRID_Y_OFFSET.
const CANVAS_HEIGHT = 2483.24 + 343.29 - GRID_Y_OFFSET;

// x/y/width/height for each of the 17 tiles (node ids "Rectangle f1"
// .."Rectangle f17"), read directly off get_metadata — not hand-tuned.
// Unlike PartsGallery's TILE_GEOM, the Figma layer numbering here already
// matches furnitureGallery's array order 1:1 (id N -> "Rectangle fN"), so no
// separate index-remapping table is needed. y values are still raw Figma
// frame coordinates (include GRID_Y_OFFSET) — subtracted at render time.
//
// Same fixed-canvas + uniform-scale approach as PartsGallery.tsx (see
// CLAUDE.md "배치/크기 정확도" exception) — children keep exact Figma px
// positions, the whole canvas scales to fit the viewport width via
// `.figma-canvas-*` (globals.css), so it never needs horizontal scroll.
// object-cover re-crops each existing photo (base and hover) to the new box
// automatically — no change needed to how images render.
//
// NOTE: this revision's Figma frame also has a new "Group 237" spec-sheet
// annotation ("(01.) Parts: foot sole..." + dimensions) floating near
// Rectangle f1 — not implemented, since it wasn't part of what was asked
// (rectangle/image resizing) and there's no established pattern for it yet.
const TILE_GEOM: [x: number, y: number, w: number, h: number][] = [
  [50.97, 197.96, 436.09, 406.15],
  [501.31, 197, 294.76, 405.9],
  [810.57, 250.15, 217.55, 167.65],
  [810.57, 431.84, 217.55, 167.65],
  [51.52, 618.36, 375.94, 343.08],
  [442.37, 618.36, 389.47, 343.08],
  [50, 1075.17, 212.56, 172.64],
  [50, 1262.78, 212.56, 249.48],
  [277.52, 1075.17, 295.39, 437.09],
  [588.3, 1075.47, 621.41, 436.82],
  [50, 1527.23, 433.1, 391.19],
  [498.07, 1527.23, 433.1, 391.19],
  [946.13, 1527.23, 217.55, 168.65],
  [946.13, 1710.85, 217.55, 207.57],
  [1178.65, 1668.94, 327.32, 249.48],
  [50, 2033.19, 502.95, 343.29],
  [50.996, 2483.24, 502.95, 343.29],
];

// Year section labels (node ids 23:1097/23:1098/23:1099/23:1092), all at
// x≈51.97 in the original 1920-wide frame. Per the responsive rule these
// stay fixed-size (unlike the grid, hence rendered outside
// `.figma-canvas-content` — see below) but their position still tracks the
// grid's own scaled position via `cqw()`, so at 1920px (scale 1) they land
// on these exact Figma coordinates, same as before the grid was split out
// into its own scaling block.
const YEAR_LABELS: [year: string, y: number][] = [
  ["2026", 976.15],
  ["2025", 1932.91],
  ["2024", 2390.99],
  ["2021", 2840.99],
];

// Figma hard-breaks this into exactly two lines (node 23:1127 has two child
// <p>s, not one wrapping paragraph) — the natural CSS wrap point at 727px
// width lands mid-sentence ("...Space } transforming..." stays on line 1),
// so the break is forced here instead of left to wrap.
const STATEMENT_LINE_1 =
  "My practices to sense the potential of 'mm' to 'm' the synesthetic { Parts - Furniture - Space } ";
const STATEMENT_LINE_2 =
  "transforming the most personal functions into universal experiences.";

export default function FurnitureGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <>
      <MainSideNav fixed />
      <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] pt-16">
        {/* Same fixed-width/height rationale as PartsGallery.tsx: 727x54
            text node, fixed (not max-width) so it never re-wraps narrower
            and overflows into the grid below as the viewport shrinks. */}
        <div
          className="mt-[82px] h-[54px] w-[727px] ml-[50px] text-[13px] text-[#696969] capitalize leading-[1.5]"
        >
          <p>{STATEMENT_LINE_1}</p>
          <p>{STATEMENT_LINE_2}</p>
        </div>

        <div
          className="figma-canvas-frame mt-[-3px]"
          style={{
            marginLeft: px(GRID_X_OFFSET),
            width: `calc(100% - ${px(GRID_X_OFFSET)})`,
            ["--fc-width" as string]: px(CANVAS_WIDTH),
            ["--fc-height" as string]: px(CANVAS_HEIGHT),
          }}
        >
          <div className="figma-canvas-scaler">
            <div className="figma-canvas-content">
              {furnitureGallery.map((item, index) => {
                const [xRaw, yRaw, w, h] = TILE_GEOM[index];
                const x = xRaw - GRID_X_OFFSET;
                const y = yRaw - GRID_Y_OFFSET;
                const isHovered = hoveredId === item.id;

                return (
                  <Link
                    key={item.id}
                    href={`/caption/${item.slug}`}
                    className="absolute overflow-hidden bg-neutral-200"
                    style={{ left: px(x), top: px(y), width: px(w), height: px(h) }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() =>
                      setHoveredId((current) => (current === item.id ? null : current))
                    }
                  >
                    {item.image && (
                      <Image
                        src={isHovered && item.hoverImage ? item.hoverImage : item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    {isHovered && item.partsInfo && (
                      // Same margin/fonts as PartsGallery.tsx's hover text
                      // layer, just without the numbering line — every
                      // furniture item is one of the captioned 17, so the
                      // margin is always 19px (no name-only 17px case here).
                      <div className="absolute bottom-[19px] left-[13px] right-[13px] flex flex-col text-white">
                        <div className="capitalize text-[20px] leading-[0] tracking-[-0.6px]">
                          <p className="leading-[1.2]">Parts: {item.partsInfo.name}</p>
                          {item.partsInfo.type && (
                            <p className="leading-[1.2]">Type: {item.partsInfo.type}</p>
                          )}
                        </div>
                        {item.partsInfo.dimensions && (
                          <p
                            className={`${ebGaramond.className} mt-1 whitespace-pre-line lowercase text-[13px] leading-none tracking-[-0.39px]`}
                          >
                            {item.partsInfo.dimensions}
                          </p>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Siblings of `.figma-canvas-content` (not inside the
                `transform: scale(...)` tree), so their own font-size stays
                fixed while `top` still tracks the grid's scaled position via
                `cqw()`. */}
            {YEAR_LABELS.map(([year, y]) => (
              <p
                key={year}
                className="absolute text-[13px] text-[#6f6f6f] capitalize leading-relaxed"
                style={{
                  left: px(51.97 - GRID_X_OFFSET),
                  top: cqw(y - GRID_Y_OFFSET),
                }}
              >
                {year}
              </p>
            ))}
          </div>
        </div>

        {/* Grid bottom (2826.53) to logo top (3018.525, the pre-existing
            bottom-preserving 87->75 height crop) = 191.99px; logo top to
            copyright top (3086.525-3018.525=68), i.e. -7px from the logo
            box's own bottom (3018.525+75) — same as PartsGallery.tsx. */}
        <div className="mt-[192px] flex flex-col items-center pb-16">
          <div className="relative h-[75px] w-[69px]">
            <Image src="/main/logo.png" alt="" fill className="object-contain" />
          </div>
          <p className="mt-[-7px] text-[10px] whitespace-nowrap text-[#818181]">Eunji Wang©</p>
        </div>
      </div>
    </>
  );
}
