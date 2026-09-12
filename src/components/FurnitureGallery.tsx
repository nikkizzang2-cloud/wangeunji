"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { useEffect, useRef, useState, type RefObject } from "react";
import { furnitureGallery, type GalleryItem } from "@/data/works";
import { fontgrow, growWith, px } from "@/lib/figma-layout";
import { useHasHover } from "@/lib/useHasHover";
import MainSideNav from "./MainSideNav";

// Same hover text layer as PartsGallery.tsx, minus the numbering line (no
// "( N. )" here, per spec) — so only the dimensions line needs its own font.
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: "400" });

// Figma "main.furniture" frame (get_metadata nodeId 117:74): width=1512,
// height=2536.
//
// Same site-wide rule change as PartsGallery.tsx: nothing scales together as
// one composition anymore. Statement text is literally fixed-px, left
// margin never shrinks (see LEFT_MARGIN below); only the tile grid (here,
// "Group 268" — rectangles f1-f17 AND the four year labels, all in one
// Figma group/local coordinate space) still shrinks, and only far enough to
// avoid colliding with the nav menu — see PartsGallery.tsx's
// `.figma-collision-scale` (globals.css) for the full mechanism.
const LEFT_MARGIN = 35;
const NAV_RESERVED_WIDTH = 78 + 40; // MainSideNav's own width + its fixed right margin
const GRID_RESERVED_WIDTH = LEFT_MARGIN + NAV_RESERVED_WIDTH;

// Grid anchor point: literally fixed (not scaled) — same convention as
// PartsGallery.tsx, using "Group 268"'s own raw Figma x/y directly (both
// tiles and year labels are already local to the group in the coordinates
// below, unlike PartsGallery which had to compute this by hand across 53
// loose tiles — this page's whole grid is one named Figma group already).
// Shifted up 8px from Figma's 188 (and the statement text's 146->138, same
// delta) per explicit request to tighten the topbar-statement gap by 8px —
// every OTHER gap below stays exactly as Figma specified (see
// PartsGallery.tsx's identical change).
// A later explicit request moved the topbar itself up 3px (desktop only,
// see TopBar.tsx) — shifted here by that same 3px (180->177, statement text
// 138->135), see PartsGallery.tsx's identical change; the mobile branch
// below is untouched since that request was desktop-only.
// A further explicit request pointed out the statement-text-to-grid gap
// didn't match PartsGallery's (14px here vs. 11px there, despite identical
// statement text) and asked for the two to be unified on parts' own value —
// 177->174, matching PartsGallery.tsx's GRID_ANCHOR_TOP exactly.
const GRID_ANCHOR_TOP = 174;
// A further explicit follow-up tightens ONLY the statement-text-to-grid
// gap by another 3px past 1700px viewport width — see PartsGallery.tsx's
// identical `GRID_ANCHOR_TOP_CSS` for the full reasoning.
const GRID_ANCHOR_TOP_CSS = `calc(${px(GRID_ANCHOR_TOP)} + var(--grid-anchor-adjust-wide))`;

// Native (unscaled) grid content size — "Group 268"'s own declared
// width/height, not the full 1512px frame width.
const GRID_NATIVE_WIDTH = 1147.0001220703125;
const GRID_NATIVE_HEIGHT = 2098.456298828125;

// Explicit request: past 1700px viewport width the grid should ALSO grow
// past its native size — scaling up from 1x to GRID_GROWN_WIDTH/
// GRID_NATIVE_WIDTH between 1700 and 1920px, then holding at that larger
// size above 1920px — see PartsGallery.tsx's identical change and
// `.figma-collision-scale`'s own comment (globals.css) for the mechanism.
const GRID_GROWN_WIDTH = 1540;
const GRID_GROW_MAX = GRID_GROWN_WIDTH / GRID_NATIVE_WIDTH - 1;

// Explicit request: furniture's shrink point should line up with parts'
// (viewport 1158px, not furniture's own true 1300px = 153 reserved +
// 1147 native) — so the `--fcol-width` fed into the scale FORMULA below
// uses parts' native grid width (PartsGallery.tsx's GRID_NATIVE_WIDTH), not
// furniture's own (larger) one. GRID_NATIVE_WIDTH above is kept as-is for
// the canvas's actual box size/footer-offset math, which must still reflect
// furniture's true content — only the scale calculation is borrowed.
//
// Consequence: furniture's real content (1147px) is wider than this
// borrowed reference (1005px), so at any given viewport the grid renders
// slightly larger than the "safe" width that guarantees no collision with
// the fixed nav menu. In practice only Rectangle f15 (the widest-reaching
// tile, at local x=889-1147) ever extends far enough right to actually
// reach the menu — and since the menu is `position:fixed` (fixed screen
// position, doesn't scroll), that only happens while f15 happens to be
// scrolled to the menu's on-screen vertical band. See the scroll-tracking
// effect in `DesktopFurnitureGallery` below, which swaps the menu to white
// text only during that specific window (matches the white-on-image
// treatment already used by the hover text layers).
const SCALE_REFERENCE_WIDTH = 1004.9998168945312;

// x/y/width/height for each of the 17 tiles (node ids "Rectangle f1"
// .."Rectangle f17"), read directly off get_metadata and rebased to the
// grid's own local origin (raw x - LEFT_MARGIN, raw y - GRID_ANCHOR_TOP) —
// not hand-tuned. Figma's layer numbering already matches furnitureGallery's
// array order 1:1 (id N -> "Rectangle fN"), so no index-remapping table is
// needed here (unlike PartsGallery.tsx's PARTS_RECTANGLE_NUMBERS).
const TILE_GEOM: [x: number, y: number, w: number, h: number][] = [
  [0.7598, 0.7598, 343.5506, 319.9658], // f1
  [355.543, 0, 232.2079, 319.7617], // f2
  [599.1719, 41.873, 171.3822, 132.0744], // f3
  [599.1719, 185.0059, 171.3822, 132.0744], // f4
  [1.1934, 331.9434, 296.1602, 270.2748], // f5
  [309.1035, 331.9434, 306.8189, 270.2748], // f6
  [0, 691.8184, 167.4514, 136.0051], // f7
  [0, 839.6152, 167.4514, 196.5392], // f8
  [179.2402, 691.8184, 232.7025, 344.3368], // f9
  [424.0664, 692.0566, 489.5399, 344.1245], // f10
  [0, 1047.9473, 341.192, 308.1735], // f11
  [352.9844, 1047.9473, 341.192, 308.1735], // f12
  [705.9668, 1047.9473, 171.3822, 132.8605], // f13
  [705.9668, 1192.6016, 171.3822, 163.5206], // f14
  [889.1406, 1159.582, 257.8595, 196.5392], // f15
  [0, 1446.5391, 396.2231, 270.4379], // f16
  [0.7852, 1801.0859, 396.2231, 270.4379], // f17
];

// Year section labels — same local coordinate space as TILE_GEOM above
// (part of the same "Group 268"), so they scale together with the grid via
// the same `--fcol-scale` transform rather than needing a separate
// position-tracking mechanism. All four share the same local x (~1.55px).
const YEAR_LABEL_X = 1.5546875;
const YEAR_LABELS: [year: string, y: number][] = [
  ["2026", 613.8105],
  ["2025", 1367.5352],
  ["2024", 1728.4082],
  ["2021", 2082.918],
];

// Footer group ("Group 264", node 120:384): logo + copyright, same
// dimensions/local layout as PartsGallery.tsx's footer (always horizontally
// centered — its x=729/w=54 sits exactly centered in the 1512-wide
// reference frame). FOOTER_GAP is furniture's own value (grid native bottom
// to logo top) — different from parts' since this grid is shorter.
const FOOTER_GAP = 150.067138671875;
const FOOTER_GROUP_WIDTH = 54;
const FOOTER_GROUP_HEIGHT = 74.609375;
const FOOTER_LOGO = { w: 54, h: 68.08695983886719 };
const FOOTER_TEXT = { x: 6.26171875, y: 62.609375, w: 47 };
// Frame height (2536) minus everything above it, kept as literal bottom
// padding so the scroll container's height matches the design at scale 1.
const PAGE_BOTTOM_PADDING =
  2536 - (GRID_ANCHOR_TOP + GRID_NATIVE_HEIGHT + FOOTER_GAP + FOOTER_GROUP_HEIGHT);

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
//
// Deliberately NOT wired into the site-wide `fontgrow`/`growWith` past-1700px
// font growth (see figma-layout.ts) — see PartsGallery.tsx's identical
// comment: this tree sits inside the grid's own `zoom: var(--fcol-scale)`
// container, which already grows it (text included) as part of the
// EARLIER past-1700px grid growth request.
function HoverInfo({ item }: { item: GalleryItem }) {
  if (!item.partsInfo) return null;
  return (
    // Same margin/fonts as PartsGallery.tsx's hover text layer (main.parts
    // Figma frame, node 117:2), just without the numbering line — every
    // furniture item is one of the captioned 17, so it's always the
    // type+size variant (bottom-[12px], never the name-only bottom-[13px]).
    <div className="pointer-events-none absolute bottom-[12px] left-[10px] right-[10px] flex flex-col text-white">
      <div className="capitalize text-[15px] leading-[0] tracking-[-0.45px]">
        <p className="leading-[1.2]">Parts: {item.partsInfo.name}</p>
        {item.partsInfo.type && <p className="leading-[1.2]">Type: {item.partsInfo.type}</p>}
      </div>
      {item.partsInfo.dimensions && (
        <p
          className={`${ebGaramond.className} mt-[2px] whitespace-pre-line lowercase text-[10px] leading-none tracking-[-0.3px]`}
        >
          {item.partsInfo.dimensions}
        </p>
      )}
    </div>
  );
}

type DesktopFurnitureGalleryProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  f15Ref: RefObject<HTMLAnchorElement | null>;
};

function DesktopFurnitureGallery({ scrollRef, f15Ref }: DesktopFurnitureGalleryProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  // See PartsGallery.tsx's DesktopPartsGallery for the same comment/pattern
  // — a touch-only device (a tablet in landscape, mainly) viewing this
  // desktop-width layout falls back to tap-once-reveal/tap-twice-navigate.
  // The two handler sets below are mutually exclusive, never both attached
  // — see that component's tileHandlers comment for why (a touch device
  // fires a synthetic mouseenter right before click, which would defeat
  // the tap-once-reveal pattern if a real onMouseEnter were also present).
  const hasHover = useHasHover();

  const tileHandlers = (id: number) =>
    hasHover
      ? {
          onMouseEnter: () => setHoveredId(id),
          onMouseLeave: () =>
            setHoveredId((current: number | null) => (current === id ? null : current)),
        }
      : {
          onClick: (event: React.MouseEvent) => {
            if (hoveredId !== id) {
              event.preventDefault();
              setHoveredId(id);
            }
          },
        };

  return (
    // max-h-screen, not h-screen — same fix as PartsGallery.tsx's identical
    // change: caps at 100vh for tall content (still scrolls internally) but
    // shrinks to fit shorter content instead of leaving growing blank space
    // below the footer as the grid shrinks.
    <div
      ref={scrollRef}
      className="figma-collision-scale hidden max-h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[700px]:block"
      style={{
        ["--fcol-reserved" as string]: px(GRID_RESERVED_WIDTH),
        ["--fcol-width" as string]: px(SCALE_REFERENCE_WIDTH),
        ["--fcol-grow-max" as string]: GRID_GROW_MAX,
      }}
    >
      {/* Separate inner element carrying the page's actual (scale-dependent)
          height, so the outer div stays exactly h-screen for its
          overflow-y-auto to scroll internally — see PartsGallery.tsx's
          identical comment for why a min-height directly on the outer div
          breaks this (it wins over h-screen's height:100vh, pushing scroll
          to the document instead). */}
      <div
        className="relative"
        style={{
          minHeight: `calc(${GRID_ANCHOR_TOP_CSS} + ${px(GRID_NATIVE_HEIGHT)} * var(--fcol-scale) + ${px(FOOTER_GAP)} + ${px(FOOTER_GROUP_HEIGHT)} + ${px(PAGE_BOTTOM_PADDING)})`,
        }}
      >
        {/* Statement text: literally fixed, left margin never shrinks. Font
            size + box width both grow past 1700px viewport width (site-wide
            font-grow request — see `fontgrow`'s own comment,
            figma-layout.ts); the left anchor stays fixed, so the box
            widens to the right. */}
        <div
          className="absolute text-[#696969] capitalize leading-[1.4]"
          style={{
            left: px(LEFT_MARGIN),
            top: px(135),
            width: growWith(10, 727),
            fontSize: fontgrow(10),
          }}
        >
          <p>{STATEMENT_LINE_1}</p>
          <p>{STATEMENT_LINE_2}</p>
        </div>

        {/* Grid: anchor (left margin + literal top) never shrinks; only the
            inner content (tiles + year labels, one Figma group) scales,
            uniformly, once it would collide with the nav menu.

            `zoom`, not `transform: scale()` — see PartsGallery.tsx's
            identical comment: transform only changes paint size, not layout
            size, so the outer overflow-y-auto div kept scrolling as if the
            grid were still at its full unscaled height, leaving a growing
            gap between the (correctly-positioned) footer and the page's
            real bottom once the grid actually shrank below scale 1. */}
        <div className="absolute" style={{ left: px(LEFT_MARGIN), top: GRID_ANCHOR_TOP_CSS }}>
          <div
            className="relative"
            style={{
              width: px(GRID_NATIVE_WIDTH),
              height: px(GRID_NATIVE_HEIGHT),
              zoom: "var(--fcol-scale)",
            }}
          >
            {furnitureGallery.map((item, index) => {
              const [x, y, w, h] = TILE_GEOM[index];
              const isHovered = hoveredId === item.id;

              return (
                <Link
                  key={item.id}
                  // Rectangle f15 is index 14 (f1..f17, 0-based) — the
                  // widest-reaching tile, tracked so the fixed nav menu can
                  // swap to white text while it's scrolled behind it (see
                  // SCALE_REFERENCE_WIDTH's comment and the effect below).
                  ref={index === 14 ? f15Ref : undefined}
                  href={`/caption/${item.slug}`}
                  className="absolute touch-manipulation overflow-hidden bg-neutral-200"
                  style={{ left: px(x), top: px(y), width: px(w), height: px(h) }}
                  {...tileHandlers(item.id)}
                >
                  {/* Base image + stacked, opacity-faded hover image — see
                      PartsGallery.tsx's identical comment for why (no
                      built-in crossfade for a plain `src` swap). */}
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  )}
                  {item.hoverImage && (
                    <Image
                      src={item.hoverImage}
                      alt={item.title}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        isHovered ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  )}
                  {isHovered && <HoverInfo item={item} />}
                </Link>
              );
            })}

            {YEAR_LABELS.map(([year, y]) => (
              <p
                key={year}
                className="absolute text-[10px] text-[#6f6f6f] capitalize leading-[1.5]"
                style={{ left: px(YEAR_LABEL_X), top: px(y) }}
              >
                {year}
              </p>
            ))}
          </div>
        </div>

        {/* Footer: always horizontally centered via `50vw` (not `left-1/2`
            — see PartsGallery.tsx's comment on why), literal fixed
            margin/size; `top` tracks the grid's current scaled bottom edge
            via the same --fcol-scale custom property. */}
        <div
          className="absolute -translate-x-1/2"
          style={{
            left: "50vw",
            width: px(FOOTER_GROUP_WIDTH),
            top: `calc(${GRID_ANCHOR_TOP_CSS} + ${px(GRID_NATIVE_HEIGHT)} * var(--fcol-scale) + ${px(FOOTER_GAP)})`,
          }}
        >
          <div className="relative" style={{ width: px(FOOTER_LOGO.w), height: px(FOOTER_LOGO.h) }}>
            <Image src="/main/logo.png" alt="" fill className="object-contain" />
          </div>
          <p
            className="absolute whitespace-nowrap text-[#818181]"
            style={{
              left: px(FOOTER_TEXT.x),
              top: px(FOOTER_TEXT.y),
              width: px(FOOTER_TEXT.w),
              fontSize: fontgrow(8),
            }}
          >
            Eunji Wang©
          </p>
        </div>
      </div>
    </div>
  );
}

// Figma "parts.funiture mobile" (nodeId 95:2340) originally had every tile
// individually hand-placed (not derived/computed like PartsGallery.tsx's
// mobile tiles) — a later explicit follow-up switched this to the same
// fixed-gap auto-stacking PartsGallery.tsx's mobile grid already uses (far
// simpler to apply a shared grid-growth request to a computed running
// position than to 17 individually hand-placed ones). MOBILE_TILE_GAP/
// MOBILE_FIRST_TILE_TOP below match PartsGallery.tsx's own values exactly
// — explicit request to unify the statement-text-to-grid top margin
// between the two pages (a user-visible inconsistency: the grids "다른
// 비율로 들어가있다").
//
// The visual order isn't strictly f1->f17 (f4 sits above f3), and year
// labels are interleaved at their own points in that order — both
// preserved from the original hand-placed layout, just re-expressed as
// entries in one sequence that a single running cursor stacks, rather than
// each carrying its own literal Figma y.
const MOBILE_TILE_GAP = 15; // tile -> tile, and tile -> label (matches PartsGallery.tsx's MOBILE_TILE_GAP)
const MOBILE_LABEL_GAP_AFTER = 78; // label -> next tile (~77-79px in the original hand-placed data)
const MOBILE_LABEL_FONT_SIZE = 13;
const MOBILE_LABEL_LINE_HEIGHT = MOBILE_LABEL_FONT_SIZE * 1.625; // leading-relaxed

// Explicit follow-up request: the mobile grid's tiles grow so the single
// widest one (f10) lands at exactly 621px — every tile scales by this SAME
// factor to preserve their relative proportions, gaps stay exactly 15px
// (only each tile's own w/h scales, not the space between them). f10 is
// already 621.41px natively, so this scale is ~0.9993 — furniture's mobile
// grid stays essentially at its native size, unlike PartsGallery.tsx's
// (whose own widest tile is only 491.089px natively and so grows ~1.26x to
// reach the same 621px target) — see that file's identical comment.
const MOBILE_WIDEST_TILE_NATIVE = 621.4063110351562; // f10
const MOBILE_GRID_TARGET_WIDTH = 621;
const MOBILE_GRID_SCALE = MOBILE_GRID_TARGET_WIDTH / MOBILE_WIDEST_TILE_NATIVE;

type MobileEntry =
  | { type: "tile"; item: GalleryItem; wNative: number; hNative: number }
  | { type: "label"; year: string };

const MOBILE_SEQUENCE: MobileEntry[] = [
  { type: "tile", item: furnitureGallery[0], wNative: 436.0921630859375, hNative: 406.1543884277344 }, // f1
  { type: "tile", item: furnitureGallery[1], wNative: 294.75732421875, hNative: 405.8952941894531 }, // f2
  { type: "tile", item: furnitureGallery[3], wNative: 217.5470733642578, hNative: 167.6509552001953 }, // f4
  { type: "tile", item: furnitureGallery[2], wNative: 217.5470733642578, hNative: 167.6509552001953 }, // f3
  { type: "tile", item: furnitureGallery[4], wNative: 375.9363098144531, hNative: 343.0781555175781 }, // f5
  { type: "tile", item: furnitureGallery[5], wNative: 389.4661560058594, hNative: 343.0781555175781 }, // f6
  { type: "label", year: "2026" },
  { type: "tile", item: furnitureGallery[6], wNative: 212.5574951171875, hNative: 172.64056396484375 }, // f7
  { type: "tile", item: furnitureGallery[7], wNative: 212.5574951171875, hNative: 249.4806365966797 }, // f8
  { type: "tile", item: furnitureGallery[8], wNative: 295.38507080078125, hNative: 437.0900573730469 }, // f9
  { type: "tile", item: furnitureGallery[9], wNative: MOBILE_WIDEST_TILE_NATIVE, hNative: 436.82061767578125 }, // f10
  { type: "tile", item: furnitureGallery[10], wNative: 433.0982666015625, hNative: 391.185546875 }, // f11
  { type: "tile", item: furnitureGallery[11], wNative: 433.0982666015625, hNative: 391.185546875 }, // f12
  { type: "tile", item: furnitureGallery[12], wNative: 217.5470733642578, hNative: 168.64889526367188 }, // f13
  { type: "tile", item: furnitureGallery[13], wNative: 217.5470733642578, hNative: 207.56787109375 }, // f14
  { type: "tile", item: furnitureGallery[14], wNative: 327.31854248046875, hNative: 249.4806365966797 }, // f15
  { type: "label", year: "2025" },
  { type: "tile", item: furnitureGallery[15], wNative: 502.9529113769531, hNative: 343.2852478027344 }, // f16
  { type: "label", year: "2024" },
  { type: "tile", item: furnitureGallery[16], wNative: 502.9529113769531, hNative: 343.2852478027344 }, // f17
  { type: "label", year: "2021" },
];

const MOBILE_TILE_X = 45;
// Matches PartsGallery.tsx's own MOBILE_FIRST_TILE_TOP exactly — see this
// block's own opening comment.
const MOBILE_FIRST_TILE_TOP = 209;

type MobilePlacedTile = { item: GalleryItem; x: number; y: number; w: number; h: number };
type MobilePlacedLabel = { year: string; y: number };

const MOBILE_TILES: MobilePlacedTile[] = [];
const MOBILE_YEAR_LABELS: MobilePlacedLabel[] = [];
let mobileCursorY = MOBILE_FIRST_TILE_TOP;
let mobileLastTileBottom = MOBILE_FIRST_TILE_TOP;
for (const entry of MOBILE_SEQUENCE) {
  if (entry.type === "label") {
    MOBILE_YEAR_LABELS.push({ year: entry.year, y: mobileCursorY });
    mobileCursorY += MOBILE_LABEL_LINE_HEIGHT + MOBILE_LABEL_GAP_AFTER;
    continue;
  }
  const w = entry.wNative * MOBILE_GRID_SCALE;
  const h = entry.hNative * MOBILE_GRID_SCALE;
  MOBILE_TILES.push({ item: entry.item, x: MOBILE_TILE_X, y: mobileCursorY, w, h });
  mobileLastTileBottom = mobileCursorY + h;
  mobileCursorY = mobileLastTileBottom + MOBILE_TILE_GAP;
}
const MOBILE_LAST_TILE_BOTTOM = mobileLastTileBottom; // f17 — footer hangs off the last TILE, not the trailing "2021" label after it

// Footer margin per explicit spec ("마지막 사각형과 위로 180px 아래로
// 35px").
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
  // pattern (including the real-mouse fallback to pure hover).
  const [activeId, setActiveId] = useState<number | null>(null);
  const hasHover = useHasHover();

  // See PartsGallery.tsx's MobilePartsGallery tileHandlers comment: the two
  // sets are mutually exclusive, never both attached, since a touch device
  // fires a synthetic mouseenter right before click regardless of whether a
  // real cursor exists.
  const tileHandlers = (id: number) =>
    hasHover
      ? {
          onMouseEnter: () => setActiveId(id),
          onMouseLeave: () =>
            setActiveId((current: number | null) => (current === id ? null : current)),
        }
      : {
          onClick: (event: React.MouseEvent) => {
            if (activeId !== id) {
              event.preventDefault();
              setActiveId(id);
            }
          },
        };

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[700px]:hidden">
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
              style={{ left: px(45), top: px(150), width: px(727) }}
            >
              <p>{STATEMENT_LINE_1}</p>
              <p>{STATEMENT_LINE_2}</p>
            </div>

            {MOBILE_TILES.map(({ item, x, y, w, h }) => {
              const isActive = activeId === item.id;

              return (
                <Link
                  key={item.id}
                  href={`/caption/${item.slug}`}
                  className="absolute touch-manipulation overflow-hidden bg-neutral-200"
                  style={{
                    left: px(x),
                    top: px(y),
                    width: px(w),
                    height: px(h),
                  }}
                  {...tileHandlers(item.id)}
                >
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  )}
                  {item.hoverImage && (
                    <Image
                      src={item.hoverImage}
                      alt={item.title}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  )}
                  {isActive && <HoverInfo item={item} />}
                </Link>
              );
            })}

            {MOBILE_YEAR_LABELS.map(({ year, y }) => (
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

// The fixed nav menu's own on-screen rect — it never scrolls (position:
// fixed) and its width/margin are themselves fixed (see MainSideNav.tsx),
// so only its height (top/bottom) and left edge (viewport width dependent)
// matter here. MENU_TOP/BOTTOM span both "furniture" (y=200) and "parts"
// (y=215, +15 height) labels together.
const MENU_TOP = 200;
const MENU_BOTTOM = 230;
const MENU_RESERVED_FROM_RIGHT = 78 + 40; // MainSideNav's own width + right margin

export default function FurnitureGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const f15Ref = useRef<HTMLAnchorElement>(null);
  const [menuOverlapsF15, setMenuOverlapsF15] = useState(false);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const f15El = f15Ref.current;
    if (!scrollEl || !f15El) return;

    const checkOverlap = () => {
      const rect = f15El.getBoundingClientRect();
      const menuLeft = window.innerWidth - MENU_RESERVED_FROM_RIGHT;
      setMenuOverlapsF15(
        rect.right > menuLeft && rect.bottom > MENU_TOP && rect.top < MENU_BOTTOM,
      );
    };

    checkOverlap();
    scrollEl.addEventListener("scroll", checkOverlap, { passive: true });
    window.addEventListener("resize", checkOverlap);
    return () => {
      scrollEl.removeEventListener("scroll", checkOverlap);
      window.removeEventListener("resize", checkOverlap);
    };
  }, []);

  return (
    <>
      <MainSideNav fixed whiteOverlap={menuOverlapsF15} />
      <DesktopFurnitureGallery scrollRef={scrollRef} f15Ref={f15Ref} />
      <MobileFurnitureGallery />
    </>
  );
}
