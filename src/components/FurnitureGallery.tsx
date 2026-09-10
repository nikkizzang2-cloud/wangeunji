"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { useEffect, useRef, useState, type RefObject } from "react";
import { furnitureGallery, type GalleryItem } from "@/data/works";
import { px } from "@/lib/figma-layout";
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
const GRID_ANCHOR_TOP = 188;

// Native (unscaled) grid content size — "Group 268"'s own declared
// width/height, not the full 1512px frame width.
const GRID_NATIVE_WIDTH = 1147.0001220703125;
const GRID_NATIVE_HEIGHT = 2098.456298828125;

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

  return (
    <div
      ref={scrollRef}
      className="figma-collision-scale hidden h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[800px]:block"
      style={{
        ["--fcol-reserved" as string]: px(GRID_RESERVED_WIDTH),
        ["--fcol-width" as string]: px(SCALE_REFERENCE_WIDTH),
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
          minHeight: `calc(${px(GRID_ANCHOR_TOP)} + ${px(GRID_NATIVE_HEIGHT)} * var(--fcol-scale) + ${px(FOOTER_GAP)} + ${px(FOOTER_GROUP_HEIGHT)} + ${px(PAGE_BOTTOM_PADDING)})`,
        }}
      >
        {/* Statement text: literally fixed, left margin never shrinks. */}
        <div
          className="absolute text-[10px] text-[#696969] capitalize leading-[1.4]"
          style={{ left: px(LEFT_MARGIN), top: px(146), width: px(727) }}
        >
          <p>{STATEMENT_LINE_1}</p>
          <p>{STATEMENT_LINE_2}</p>
        </div>

        {/* Grid: anchor (left margin + literal top) never shrinks; only the
            inner content (tiles + year labels, one Figma group) scales,
            uniformly, once it would collide with the nav menu. */}
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
