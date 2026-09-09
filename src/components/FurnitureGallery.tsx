"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { useState } from "react";
import { furnitureGallery, type GalleryItem } from "@/data/works";
import { px } from "@/lib/figma-layout";
import MainSideNav from "./MainSideNav";

// Same hover text layer as PartsGallery.tsx, minus the numbering line (no
// "( N. )" here, per spec) — so only the dimensions line needs its own font.
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: "400" });

// Figma "/main.furniture" frame (get_metadata nodeId 23:1088): width=1920,
// height=3127.
//
// Same single-canvas approach as PartsGallery.tsx: statement text, grid, and
// footer all live in ONE canvas scaled uniformly by the same
// min(1, viewport/1920) factor as TopBar/MainSideNav's own
// `.figma-fixed-scale` — see PartsGallery.tsx's comment for the full
// rationale (an earlier "statement/footer/year-labels stay literally
// fixed-px" split only matched Figma at exactly 1920px viewport width).
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 3127;

// x/y/width/height for each of the 17 tiles (node ids "Rectangle f1"
// .."Rectangle f17"), read directly off get_metadata — not hand-tuned.
// Unlike PartsGallery's TILE_GEOM, the Figma layer numbering here already
// matches furnitureGallery's array order 1:1 (id N -> "Rectangle fN"), so no
// separate index-remapping table is needed.
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
// x≈51.97 in the original 1920-wide frame — plain children of
// `.figma-canvas-content` now, like everything else on this page, so they
// scale together with the grid instead of needing a separate `cqw()`
// position-tracking hack.
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

// Same hover/tap info layer for both desktop (hover) and mobile (tap) —
// "호버시 뜨는 정보는 기존의 텍스트 박스와 동일한 형식으로" — identical
// markup/sizes, just triggered by a different interaction.
function HoverInfo({ item }: { item: GalleryItem }) {
  if (!item.partsInfo) return null;
  return (
    // Same margin/fonts as PartsGallery.tsx's hover text layer, just
    // without the numbering line — every furniture item is one of the
    // captioned 17, so the margin is always 19px (no name-only 17px case
    // here).
    <div className="pointer-events-none absolute bottom-[19px] left-[13px] right-[13px] flex flex-col text-white">
      <div className="capitalize text-[20px] leading-[0] tracking-[-0.6px]">
        <p className="leading-[1.2]">Parts: {item.partsInfo.name}</p>
        {item.partsInfo.type && <p className="leading-[1.2]">Type: {item.partsInfo.type}</p>}
      </div>
      {item.partsInfo.dimensions && (
        <p
          className={`${ebGaramond.className} mt-1 whitespace-pre-line lowercase text-[13px] leading-none tracking-[-0.39px]`}
        >
          {item.partsInfo.dimensions}
        </p>
      )}
    </div>
  );
}

function DesktopFurnitureGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="hidden h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[800px]:block">
      <div
        className="figma-canvas-frame"
        style={{
          ["--fc-width" as string]: px(CANVAS_WIDTH),
          ["--fc-height" as string]: px(CANVAS_HEIGHT),
        }}
      >
        <div className="figma-canvas-scaler">
          <div className="figma-canvas-content">
            <div
              className="absolute text-[13px] text-[#696969] capitalize leading-[1.5]"
              style={{ left: px(50), top: px(146), width: px(727), height: px(54) }}
            >
              <p>{STATEMENT_LINE_1}</p>
              <p>{STATEMENT_LINE_2}</p>
            </div>

            {furnitureGallery.map((item, index) => {
              const [x, y, w, h] = TILE_GEOM[index];
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
                  {isHovered && <HoverInfo item={item} />}
                </Link>
              );
            })}

            {YEAR_LABELS.map(([year, y]) => (
              <p
                key={year}
                className="absolute text-[13px] text-[#6f6f6f] capitalize leading-relaxed"
                style={{ left: px(51.97), top: px(y) }}
              >
                {year}
              </p>
            ))}

            <div
              className="absolute"
              style={{ left: px(925), top: px(3005.525390625), width: px(69), height: px(87) }}
            >
              <Image src="/main/logo.png" alt="" fill className="object-contain" />
            </div>
            <p
              className="absolute whitespace-nowrap text-[10px] text-[#818181]"
              style={{ left: px(933), top: px(3086.525390625), width: px(59) }}
            >
              Eunji Wang©
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Figma "parts.funiture mobile" (nodeId 95:2340) — the user placed every
// tile themselves this time, so these are read directly off get_metadata
// (not derived/computed like PartsGallery's mobile tiles). The visual order
// isn't strictly f1->f17: f4 sits above f3. Year-label gaps are NOT a fixed
// 15px like the tile-to-tile gaps — e.g. "2026" sits ~77px below f6 but the
// next tile (f7) sits further below "2026" still — so every element here
// uses its own literal Figma y rather than a computed running gap.
const MOBILE_TILES: { item: GalleryItem; y: number }[] = [
  { item: furnitureGallery[0], y: 217 }, // f1
  { item: furnitureGallery[1], y: 638 }, // f2
  { item: furnitureGallery[3], y: 1059 }, // f4
  { item: furnitureGallery[2], y: 1241 }, // f3
  { item: furnitureGallery[4], y: 1424 }, // f5
  { item: furnitureGallery[5], y: 1782 }, // f6
  { item: furnitureGallery[6], y: 2237 }, // f7
  { item: furnitureGallery[7], y: 2425 }, // f8
  { item: furnitureGallery[8], y: 2690 }, // f9
  { item: furnitureGallery[9], y: 3142 }, // f10
  { item: furnitureGallery[10], y: 3594 }, // f11
  { item: furnitureGallery[11], y: 4000 }, // f12
  { item: furnitureGallery[12], y: 4406 }, // f13
  { item: furnitureGallery[13], y: 4590 }, // f14
  { item: furnitureGallery[14], y: 4813 }, // f15
  { item: furnitureGallery[15], y: 5175.26171875 }, // f16
  { item: furnitureGallery[16], y: 5630.841796875 }, // f17
];
// [x, w, h] per tile above, in the same order — kept separate from the
// y-position table since the widths repeat/vary independently of position.
const MOBILE_TILE_WH: [w: number, h: number][] = [
  [436.0921630859375, 406.1543884277344], // f1
  [294.75732421875, 405.8952941894531], // f2
  [217.5470733642578, 167.6509552001953], // f4
  [217.5470733642578, 167.6509552001953], // f3
  [375.9363098144531, 343.0781555175781], // f5
  [389.4661560058594, 343.0781555175781], // f6
  [212.5574951171875, 172.64056396484375], // f7
  [212.5574951171875, 249.4806365966797], // f8
  [295.38507080078125, 437.0900573730469], // f9
  [621.4063110351562, 436.82061767578125], // f10
  [433.0982666015625, 391.185546875], // f11
  [433.0982666015625, 391.185546875], // f12
  [217.5470733642578, 168.64889526367188], // f13
  [217.5470733642578, 207.56787109375], // f14
  [327.31854248046875, 249.4806365966797], // f15
  [502.9529113769531, 343.2852478027344], // f16
  [502.9529113769531, 343.2852478027344], // f17
];

const MOBILE_YEAR_LABELS: [year: string, y: number][] = [
  ["2026", 2140],
  ["2025", 5077],
  ["2024", 5533.546875],
  ["2021", 5989.126953125],
];

const MOBILE_TILE_X = 45;
const MOBILE_LAST_TILE_BOTTOM = 5630.841796875 + 343.2852478027344; // f17

// Footer margin per explicit spec ("마지막 사각형과 위로 180px 아래로
// 35px") — matches the placed footer exactly (logo top - last tile bottom
// = 6154.126953125 - 5974.126953125 = 180; canvas bottom - copyright bottom
// = 35).
const MOBILE_FOOTER_LOGO_Y = MOBILE_LAST_TILE_BOTTOM + 180;
const MOBILE_FOOTER_COPYRIGHT_Y = MOBILE_FOOTER_LOGO_Y + 74;
const MOBILE_CANVAS_WIDTH = 800;
const MOBILE_CANVAS_HEIGHT = MOBILE_FOOTER_COPYRIGHT_Y + 15 + 35;

function MobileFurnitureGallery() {
  // No hover on touch devices: the first tap on a tile reveals the same
  // info layer desktop shows on hover (without navigating); a second tap on
  // the already-active tile lets the click through to actually navigate to
  // the caption page — same single-value "active" model as desktop's
  // hoveredId, see PartsGallery.tsx's MobilePartsGallery for the same
  // pattern.
  const [activeId, setActiveId] = useState<number | null>(null);

  const handleTap = (event: React.MouseEvent, id: number) => {
    if (activeId !== id) {
      event.preventDefault();
      setActiveId(id);
    }
  };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[800px]:hidden">
      <div
        className="figma-canvas-frame"
        style={{
          ["--fc-width" as string]: px(MOBILE_CANVAS_WIDTH),
          ["--fc-height" as string]: px(MOBILE_CANVAS_HEIGHT),
        }}
      >
        <div className="figma-canvas-scaler">
          <div className="figma-canvas-content">
            <div
              className="absolute text-[13px] text-[#696969] capitalize leading-[1.4]"
              style={{ left: px(45), top: px(158), width: px(727) }}
            >
              <p>{STATEMENT_LINE_1}</p>
              <p>{STATEMENT_LINE_2}</p>
            </div>

            {MOBILE_TILES.map(({ item, y }, index) => {
              const [w, h] = MOBILE_TILE_WH[index];
              const isActive = activeId === item.id;

              return (
                <Link
                  key={item.id}
                  href={`/caption/${item.slug}`}
                  className="absolute overflow-hidden bg-neutral-200"
                  style={{ left: px(MOBILE_TILE_X), top: px(y), width: px(w), height: px(h) }}
                  onClick={(event) => handleTap(event, item.id)}
                >
                  {item.image && (
                    <Image
                      src={isActive && item.hoverImage ? item.hoverImage : item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  {isActive && <HoverInfo item={item} />}
                </Link>
              );
            })}

            {MOBILE_YEAR_LABELS.map(([year, y]) => (
              <p
                key={year}
                className="absolute text-[13px] text-[#6f6f6f] capitalize leading-relaxed"
                style={{ left: px(45), top: px(y) }}
              >
                {year}
              </p>
            ))}

            <div
              className="absolute"
              style={{ left: px(368), top: px(MOBILE_FOOTER_LOGO_Y), width: px(64), height: px(81) }}
            >
              <Image src="/main/logo.png" alt="" fill className="object-contain" />
            </div>
            <p
              className="absolute whitespace-nowrap text-[10px] text-[#818181]"
              style={{ left: px(370), top: px(MOBILE_FOOTER_COPYRIGHT_Y), width: px(59) }}
            >
              Eunji Wang©
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FurnitureGallery() {
  return (
    <>
      <MainSideNav fixed />
      <DesktopFurnitureGallery />
      <MobileFurnitureGallery />
    </>
  );
}
