"use client";

import Image from "next/image";
import Link from "next/link";
import { Crimson_Text, EB_Garamond } from "next/font/google";
import { useState } from "react";
import { partsGallery, PARTS_RECTANGLE_NUMBERS, type GalleryItem } from "@/data/works";
import { px } from "@/lib/figma-layout";
import MainSideNav from "./MainSideNav";

// Hover text layer (get_design_context nodeId 54:217) uses three fonts: the
// body's default Helvetica for "Parts:"/"Type:", and two more just for the
// numbering and the dimensions line.
const crimsonText = Crimson_Text({ subsets: ["latin"], weight: "600" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: "400" });

// Figma "main.parts" frame (get_metadata nodeId 117:2): width=1512,
// height=5372.
//
// Site-wide rule change: nothing scales together as one composition
// anymore. The header, statement text, and nav menu are each literally
// fixed-px, anchored by a margin that never shrinks (left for statement/
// grid, right for the nav menu — see TopBar.tsx/MainSideNav.tsx). Only the
// tile grid itself still shrinks, and only far enough to avoid colliding
// with the nav menu on its way to the right edge — see
// `.figma-collision-scale` (globals.css). Above that collision width the
// grid renders at its exact native Figma size; below it, the grid scales
// down as one rigid block (all 53 tiles' relative positions/gaps stay
// proportionally identical — same technique the old `.figma-canvas-*`
// used, just with a narrower "100%" reference).
const LEFT_MARGIN = 35;
const NAV_RESERVED_WIDTH = 78 + 40; // MainSideNav's own width + its fixed right margin
const GRID_RESERVED_WIDTH = LEFT_MARGIN + NAV_RESERVED_WIDTH;

// Grid anchor point: literally fixed (not scaled) — "상단바–텍스트 레이어–
// 사각형 이미지 그룹 사이의 간격은 화면이 줄어도 고정". Left is the same
// LEFT_MARGIN the statement text uses; top is the raw Figma y of the
// topmost tile (185, Rectangles 3/4) — same convention as every other
// element on this page: use get_metadata's raw px directly, no synthetic
// "gap" formula.
// Shifted up 8px from Figma's 185 (and the statement text's 146->138, same
// delta) per explicit request to tighten the topbar-statement gap by 8px —
// every OTHER gap below (statement-grid, grid-footer, etc.) must stay
// exactly as Figma specified, so shifting both anchors by the same amount
// preserves them; the page's total scroll height shrinks by exactly 8px too.
const GRID_ANCHOR_TOP = 177;

// Native (unscaled) grid content size, measured edge-to-edge across the 53
// tiles below (min x=35 treated as local 0 via LEFT_MARGIN, min y=185 via
// GRID_ANCHOR_TOP) — this, not the full 1512px frame width, is what
// `.figma-collision-scale` compares against the leftover viewport width.
const GRID_NATIVE_WIDTH = 1004.9998168945312;
const GRID_NATIVE_HEIGHT = 4907.869171142578;

// x/y/width/height for each of the 53 tiles (node ids 117:7-117:59), read
// directly off get_metadata and rebased to the grid's own local origin
// (raw x - LEFT_MARGIN, raw y - GRID_ANCHOR_TOP) — not hand-tuned. Indexed
// by RECTANGLE NUMBER (index 0 = "Rectangle 1", ..., index 52 = the last
// one, "Rectangle 96"/53rd) — this is the order get_metadata itself
// returned the nodes in, NOT partsGallery's visual/masonry order. Figma's
// rectangle numbers don't run sequentially in visual order (that's exactly
// what PARTS_RECTANGLE_NUMBERS in works.ts is for), so pairing this
// straight against `partsGallery[index]` scrambled which photo lands in
// which box — fixed below by deriving TILE_GEOM through that same mapping,
// same as works.ts itself does for the image filename.
const TILE_GEOM_BY_RECTANGLE: [x: number, y: number, w: number, h: number][] = [
  [1, 1, 171.5663, 133.0033],
  [0, 144.0234, 171.5663, 132.2163],
  [183.0742, 0, 307.0287, 277.648],
  [500.9414, 0, 232.8424, 344.4892],
  [0, 288.668, 490.3021, 327.3926],
  [500.9414, 356.6387, 232.9525, 258.9235],
  [746.8633, 271.7734, 258.1365, 196.7504],
  [746.8633, 479.543, 166.8443, 136.1513],
  [0, 627.3691, 269.1546, 243.1835],
  [280.959, 627.3691, 278.5986, 243.1835],
  [571.4668, 627.3691, 277.8115, 243.1835],
  [0, 882.3574, 167.6313, 135.3643],
  [0, 1030.3145, 167.6313, 135.3643],
  [179.4355, 882.3574, 232.9525, 344.7067],
  [424.1914, 882.3574, 490.3021, 344.7067],
  [0, 1177.4883, 167.6313, 338.4107],
  [179.4355, 1238.8711, 306.9306, 276.2376],
  [498.1738, 1238.8711, 373.0388, 347.0677],
  [0.7852, 1527.7031, 485.58, 327.3926],
  [498.1738, 1597.6895, 232.9525, 256.5625],
  [742.9297, 1597.6895, 166.8443, 136.1513],
  [0, 1866.8984, 269.1546, 243.1835],
  [278.5977, 1866.8984, 278.5986, 243.1835],
  [568.2129, 1866.8984, 277.8115, 243.1835],
  [0, 2121.8867, 233.7394, 344.7068],
  [245.5449, 2121.8867, 171.5663, 276.2376],
  [428.916, 2121.8867, 307.7177, 276.2376],
  [748.4355, 2121.8867, 171.5663, 132.2163],
  [748.4355, 2265.9062, 171.5663, 132.2163],
  [0, 2478.3965, 233.7394, 258.9235],
  [245.5449, 2409.9297, 491.089, 327.3926],
  [0, 2749.1309, 272.3026, 243.1835],
  [284.1074, 2749.1309, 272.3026, 243.1835],
  [568.2129, 2749.1309, 282.5336, 243.1835],
  [0, 3004.1172, 439.9339, 343.9196],
  [453.3086, 3004.1172, 219.5743, 343.9185],
  [683.1211, 3065.498, 166.8443, 136.1513],
  [683.1211, 3212.666, 166.8443, 136.1513],
  [0, 3359.8418, 167.6313, 277.0246],
  [179.4355, 3359.8418, 306.9306, 276.2376],
  [497.3867, 3359.8418, 373.0388, 347.0677],
  [0, 3647.8828, 485.58, 327.3926],
  [497.3867, 3717.9258, 232.9525, 256.5625],
  [0, 3991.8027, 167.6313, 136.1513],
  [0, 4139.7559, 167.6313, 135.3643],
  [179.4355, 3991.8516, 232.9525, 344.7066],
  [424.1914, 3992.5898, 490.3021, 343.9196],
  [0.7344, 4286.9258, 167.6313, 338.4107],
  [179.4355, 4348.3184, 306.9306, 277.0246],
  [498.1738, 4348.3184, 373.0388, 347.0677],
  [0, 4637.1406, 295.9126, 270.7285],
  [307.7188, 4637.1406, 178.6494, 270.7285],
  [498.5625, 4706.8047, 268.5778, 200.8426],
];

// Rebuilt into partsGallery's own array order — TILE_GEOM[index] is now the
// box for whichever rectangle PARTS_RECTANGLE_NUMBERS[index] names, exactly
// like works.ts derives partsGallery[index]'s image filename from the same
// number. Photo N therefore always renders in Figma's "Rectangle N" box,
// regardless of visual/DOM order.
const TILE_GEOM: [x: number, y: number, w: number, h: number][] = PARTS_RECTANGLE_NUMBERS.map(
  (rectangleNumber) => TILE_GEOM_BY_RECTANGLE[rectangleNumber - 1],
);

// Footer group ("Group 264", node 120:391): logo + copyright, always
// horizontally centered ("로고는 항상 중앙 위치") — its own x=729/w=54 sits
// exactly centered in the 1512-wide reference frame (729+27=756=1512/2), so
// it's centered via `left:50%` + `translateX(-50%)` rather than a literal
// left offset. `top` isn't a fixed number, though — the grid above it can be
// scaled, so this must track the grid's *current* rendered bottom edge, not
// its native one. FOOTER_GAP (logo top - grid's native bottom) is the one
// piece that stays a fixed, non-scaling margin ("로고의 마진값 고정") —
// applied on top of the grid's scaled height via a CSS calc() that reads
// the same `--fcol-scale` custom property the grid's own transform uses
// (see globals.css), so it stays in sync with no JS measurement.
const FOOTER_GAP = 179.77731323242188;
const FOOTER_GROUP_WIDTH = 54;
const FOOTER_GROUP_HEIGHT = 74.609375;
const FOOTER_LOGO = { w: 54, h: 68.08695983886719 };
const FOOTER_TEXT = { x: 6.26171875, y: 62.609375, w: 47 };
// Frame height (5372) minus everything above (fixed anchor + native grid
// height + fixed footer gap + footer group height) — the bit of empty space
// Figma left below the footer, kept as a literal bottom padding so the
// scroll container's height matches the design exactly at scale 1.
const PAGE_BOTTOM_PADDING =
  5372 - (GRID_ANCHOR_TOP + GRID_NATIVE_HEIGHT + FOOTER_GAP + FOOTER_GROUP_HEIGHT);

// Figma hard-breaks this into exactly two lines (node 23:1081 has two child
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
// Figma "main.parts" frame (get_metadata nodeId 117:2) text-layer examples
// (127:583 name-only, 127:589/127:587 name+type+size): numbering 13px,
// Parts/Type 15px, size 10px — down from the previous revision's
// 15/20/13px. Gap numbering->Parts/Type is 7px (unchanged), Parts/Type->size
// is now 2px (was 4px/`mt-1`). Margin from the tile edge is now 10px left
// (and, symmetrically, right, for wrap) for both variants, but bottom
// differs: 12px when a type+size line follows, 13px for name-only.
function HoverInfo({ item }: { item: GalleryItem }) {
  if (!item.partsInfo) return null;
  return (
    <div
      className={`pointer-events-none absolute left-[10px] right-[10px] flex flex-col text-white ${
        item.partsInfo.type ? "bottom-[12px]" : "bottom-[13px]"
      }`}
    >
      <p className={`${crimsonText.className} mb-[7px] text-[13px] leading-[normal] whitespace-nowrap`}>
        {item.partsInfo.number}
      </p>
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

function DesktopPartsGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    // max-h-screen, not h-screen: was previously an exact 100vh, which left
    // growing blank space below the footer as the grid shrank (its scaled
    // height, and so the whole page's real content height, drops below
    // 100vh at narrower widths, but a plain h-screen container doesn't
    // shrink to match — the fixed-size PAGE_BOTTOM_PADDING below the footer
    // stayed correct in isolation, but the leftover 100vh-vs-content gap
    // read as an ever-growing margin). max-h-screen caps at 100vh (so tall
    // content still scrolls internally, same as before) but lets the
    // container shrink to fit shorter content, so the page's total scroll
    // length shrinks right along with the grid.
    <div
      className="figma-collision-scale hidden max-h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[800px]:block"
      style={{
        ["--fcol-reserved" as string]: px(GRID_RESERVED_WIDTH),
        ["--fcol-width" as string]: px(GRID_NATIVE_WIDTH),
      }}
    >
      {/* Establishes the page's actual (scale-dependent) content height for
          the outer div's overflow-y-auto to scroll — kept as a separate
          inner element so the outer div's own height stays driven by
          `max-h-screen` (caps at 100vh, but shrinks below it when content is
          shorter — see the outer div's own comment). A min-height on the
          outer div directly would win over `max-h-screen`'s cap whenever
          content is taller, making the outer div itself grow to full
          content height instead of scrolling internally — content would
          then overflow into a document-level scrollbar instead (confirmed
          via a 15px viewport/clientWidth gap matching a document scrollbar,
          when it should have had none). */}
      <div
        className="relative"
        style={{
          minHeight: `calc(${px(GRID_ANCHOR_TOP)} + ${px(GRID_NATIVE_HEIGHT)} * var(--fcol-scale) + ${px(FOOTER_GAP)} + ${px(FOOTER_GROUP_HEIGHT)} + ${px(PAGE_BOTTOM_PADDING)})`,
        }}
      >
        {/* Statement text: literally fixed, left margin never shrinks. */}
        <div
          className="absolute text-[10px] text-[#696969] capitalize leading-[1.4]"
          style={{ left: px(LEFT_MARGIN), top: px(138), width: px(727) }}
        >
          <p>{STATEMENT_LINE_1}</p>
          <p>{STATEMENT_LINE_2}</p>
        </div>

      {/* Grid: anchor (left margin + literal top) never shrinks; only the
          inner content scales, uniformly, once it would collide with the
          nav menu (`.figma-collision-scale`, globals.css). */}
      <div className="absolute" style={{ left: px(LEFT_MARGIN), top: px(GRID_ANCHOR_TOP) }}>
        <div
          className="relative"
          style={{
            width: px(GRID_NATIVE_WIDTH),
            height: px(GRID_NATIVE_HEIGHT),
            transform: "scale(var(--fcol-scale))",
            transformOrigin: "top left",
          }}
        >
          {partsGallery.map((item, index) => {
            const [x, y, w, h] = TILE_GEOM[index];
            const isHovered = hoveredId === item.id;
            const isInstagram = item.instagramUrl !== null;

            const content = (
              <div
                className="absolute overflow-hidden bg-neutral-200"
                style={{ left: px(x), top: px(y), width: px(w), height: px(h) }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() =>
                  setHoveredId((current) => (current === item.id ? null : current))
                }
              >
                {/* Base image (always rendered) + a stacked hover image
                    faded in via opacity, rather than swapping `src`
                    directly — Next Image has no built-in crossfade for a
                    `src` change (it's an instant cut), so a smooth
                    transition needs two images layered instead. Instagram
                    items never had a hover-image swap (their hover effect
                    is the darkening filter on the base image instead). */}
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className={`object-cover transition-[filter] duration-300 ${
                      isInstagram && isHovered ? "brightness-50" : ""
                    }`}
                  />
                )}
                {!isInstagram && item.hoverImage && (
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
              </div>
            );

            return item.slug ? (
              <Link key={item.id} href={`/caption/${item.slug}`}>
                {content}
              </Link>
            ) : (
              <a key={item.id} href={item.instagramUrl!} target="_blank" rel="noreferrer">
                {content}
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer: always horizontally centered, literal fixed margin/size —
          `top` tracks the grid's *current* (possibly scaled) bottom edge via
          the same --fcol-scale custom property the grid's transform uses.
          Centered via `50vw` (true viewport center), not `left-1/2` (50% of
          this scrolling div's own content-box) — a vertical scrollbar
          shrinks that content-box width, which would otherwise pull the
          "always centered" logo a few px off from the actual viewport
          center whenever the page needs to scroll (i.e. basically always). */}
      <div
        className="absolute -translate-x-1/2"
        style={{
          left: "50vw",
          width: px(FOOTER_GROUP_WIDTH),
          top: `calc(${px(GRID_ANCHOR_TOP)} + ${px(GRID_NATIVE_HEIGHT)} * var(--fcol-scale) + ${px(FOOTER_GAP)})`,
        }}
      >
        <div className="relative" style={{ width: px(FOOTER_LOGO.w), height: px(FOOTER_LOGO.h) }}>
          <Image src="/main/logo.png" alt="" fill className="object-contain" />
        </div>
        <p
          className="absolute whitespace-nowrap text-[8px] text-[#818181]"
          style={{ left: px(FOOTER_TEXT.x), top: px(FOOTER_TEXT.y), width: px(FOOTER_TEXT.w) }}
        >
          Eunji Wang©
        </p>
      </div>
      </div>
    </div>
  );
}

// Figma "main.parts mobile" (nodeId 95:2244) only placed 6 sample tiles (a
// single column, left-aligned at x=45, 15px gaps — confirmed by their
// widths/heights matching desktop's Rectangle 1-6 exactly) and asked for the
// rest to be filled in the same way, "이미지 숫자 순서대로" (in rectangle
// -number order, 1->53 — NOT partsGallery's array order, which is desktop's
// visual/masonry order and doesn't run 1->53 sequentially). So this derives
// each rectangle's own width/height from the already-correct desktop
// TILE_GEOM (via PARTS_RECTANGLE_NUMBERS, which maps a partsGallery index to
// its Figma "Rectangle N" identity) instead of re-transcribing 53 numbers by
// hand, then stacks them in strict number order with a running Y cursor.
const MOBILE_TILE_GAP = 15;
const MOBILE_FIRST_TILE_TOP = 209; // shifted up 8px, same -8 as desktop's GRID_ANCHOR_TOP
const MOBILE_TILE_X = 45;

const RECTANGLE_WH_BY_NUMBER = new Map<number, [w: number, h: number]>();
const ITEM_BY_RECTANGLE_NUMBER = new Map<number, GalleryItem>();
PARTS_RECTANGLE_NUMBERS.forEach((number, index) => {
  const [, , w, h] = TILE_GEOM[index];
  RECTANGLE_WH_BY_NUMBER.set(number, [w, h]);
  ITEM_BY_RECTANGLE_NUMBER.set(number, partsGallery[index]);
});

type MobileTile = { item: GalleryItem; x: number; y: number; w: number; h: number };

const MOBILE_TILES: MobileTile[] = [];
let mobileCursorY = MOBILE_FIRST_TILE_TOP;
for (let number = 1; number <= PARTS_RECTANGLE_NUMBERS.length; number++) {
  const wh = RECTANGLE_WH_BY_NUMBER.get(number);
  const item = ITEM_BY_RECTANGLE_NUMBER.get(number);
  if (!wh || !item) continue;
  const [w, h] = wh;
  MOBILE_TILES.push({ item, x: MOBILE_TILE_X, y: mobileCursorY, w, h });
  mobileCursorY += h + MOBILE_TILE_GAP;
}
const MOBILE_LAST_TILE_BOTTOM = mobileCursorY - MOBILE_TILE_GAP;

// Footer margin per explicit spec ("마지막 사각형과 위로 180px 아래로
// 35px") — matches "parts.funiture mobile"'s own placed footer exactly
// (logo top - last tile bottom = 180; canvas bottom - copyright bottom =
// 35), so the same formula is reused here since /main/parts's footer
// wasn't placed in Figma for this revision.
const MOBILE_FOOTER_LOGO_Y = MOBILE_LAST_TILE_BOTTOM + 180;
const MOBILE_FOOTER_COPYRIGHT_Y = MOBILE_FOOTER_LOGO_Y + 74;
const MOBILE_CANVAS_WIDTH = 800;
const MOBILE_CANVAS_HEIGHT = MOBILE_FOOTER_COPYRIGHT_Y + 15 + 35;

function MobilePartsGallery() {
  // No hover on touch devices: the first tap on a tile reveals the same
  // info layer desktop shows on hover (without navigating); a second tap on
  // the already-active tile lets the click through to actually navigate
  // (caption page, or Instagram for the 36 uncaptioned tiles) — tapping a
  // different tile just moves the "active" one, same single-value model as
  // desktop's hoveredId.
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
              style={{ left: px(45), top: px(150), width: px(568) }}
            >
              <p>{STATEMENT_LINE_1}</p>
              <p>{STATEMENT_LINE_2}</p>
            </div>

            {MOBILE_TILES.map(({ item, x, y, w, h }) => {
              const isActive = activeId === item.id;
              const isInstagram = item.instagramUrl !== null;

              const content = (
                <div
                  className="absolute overflow-hidden bg-neutral-200"
                  style={{ left: px(x), top: px(y), width: px(w), height: px(h) }}
                  onClick={(event) => handleTap(event, item.id)}
                >
                  {/* Base image + stacked, opacity-faded hover image — see
                      the desktop grid's identical comment for why (no
                      built-in crossfade for a plain `src` swap). */}
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className={`object-cover transition-[filter] duration-300 ${
                        isInstagram && isActive ? "brightness-50" : ""
                      }`}
                    />
                  )}
                  {!isInstagram && item.hoverImage && (
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
                </div>
              );

              return item.slug ? (
                <Link key={item.id} href={`/caption/${item.slug}`}>
                  {content}
                </Link>
              ) : (
                <a key={item.id} href={item.instagramUrl!} target="_blank" rel="noreferrer">
                  {content}
                </a>
              );
            })}

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

export default function PartsGallery() {
  return (
    <>
      <MainSideNav fixed />
      <DesktopPartsGallery />
      <MobilePartsGallery />
    </>
  );
}
