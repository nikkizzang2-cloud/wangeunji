"use client";

import Image from "next/image";
import Link from "next/link";
import { Crimson_Text, EB_Garamond } from "next/font/google";
import { useState } from "react";
import { partsGallery } from "@/data/works";
import { px } from "@/lib/figma-layout";
import MainSideNav from "./MainSideNav";

// Hover text layer (get_design_context nodeId 54:217) uses three fonts: the
// body's default Helvetica for "Parts:"/"Type:", and two more just for the
// numbering and the dimensions line.
const crimsonText = Crimson_Text({ subsets: ["latin"], weight: "600" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: "400" });

// Figma "/main.parts" frame (get_metadata nodeId 23:1023): width=1920,
// height=6728.
//
// The statement text, grid, and footer all live in ONE canvas scaled
// uniformly by the same min(1, viewport/1920) factor (`.figma-canvas-*`,
// globals.css) — TopBar/MainSideNav's own `.figma-fixed-scale` (see their
// files) use the identical factor, so the whole page shrinks/grows together
// as one composition, matching Figma exactly at any viewport width.
//
// An earlier revision split this into a "literally fixed px" group (header/
// statement/nav/footer) and a "scales with the viewport" group (just the
// grid), per a responsive rule read as "상단바 아래 텍스트 레이어... 는
// 크기·비율 고정". That only matched Figma at exactly 1920px viewport width;
// at any other width (i.e. almost every real browser window — MacBook
// screens are commonly 1440-1728px) the "fixed" group didn't shrink with the
// grid, so it visibly outgrew its correct proportion relative to the page
// (reported as "박스 이외의 요소들이 크게 보여" — confirmed by the fact that
// setting Chrome's own zoom to make `window.innerWidth` land back on exactly
// 1920 made everything match again). So the statement/footer below now use
// this page's raw Figma x/y coordinates directly, same as the tiles always
// did — no more GRID_X_OFFSET/GRID_Y_OFFSET rebasing or separate flow-layout
// margins for them.
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 6728;

// x/y/width/height for each of the 53 tiles (node ids 23:1028-23:1080), read
// directly off get_metadata — not hand-tuned — sorted into visual
// (top-to-bottom, left-to-right) order for DOM/reading order. This is the
// same rectangle-to-slot order as the previous revision (only sizes/
// positions changed), so it still lines up with PARTS_RECTANGLE_NUMBERS in
// works.ts and the already-downloaded rectangle-N.jpg photos — object-cover
// re-crops each existing photo (base and hover) to the new box automatically.
//
// The grid keeps its own children at exact Figma px positions (never
// reflowed), uniformly scaled via `.figma-canvas-*` (globals.css) to fit the
// viewport width — like an image, not a responsive reflow — so the
// composition always matches Figma exactly and never needs horizontal
// scroll. See CLAUDE.md "배치/크기 정확도" for why this page is the one
// exception to the `figma-pin` (%-scaling) convention used elsewhere.
const TILE_GEOM: [x: number, y: number, w: number, h: number][] = [
  [50, 197, 217.83, 168.87],
  [282.44, 197, 389.82, 352.52],
  [686.02, 197, 295.63, 437.38],
  [50, 379.86, 217.83, 167.87],
  [998.26, 542.06, 327.74, 249.8],
  [50, 563.51, 622.51, 415.67],
  [686.02, 649.81, 295.77, 328.74],
  [998.26, 805.85, 211.83, 172.86],
  [50, 993.54, 341.73, 308.76],
  [406.72, 993.54, 353.72, 308.76],
  [775.56, 993.54, 352.72, 308.76],
  [50, 1317.28, 212.83, 171.87],
  [277.82, 1317.28, 295.77, 437.66],
  [588.58, 1317.28, 622.51, 437.66],
  [50, 1505.14, 212.83, 171.87],
  [50, 1692, 212.83, 429.66],
  [277.82, 1769.93, 389.69, 350.73],
  [682.51, 1769.93, 473.63, 440.65],
  [50.996, 2136.65, 616.52, 415.67],
  [682.51, 2225.51, 295.77, 325.74],
  [993.26, 2225.51, 211.83, 172.86],
  [50, 2567.31, 341.73, 308.76],
  [403.72, 2567.31, 353.72, 308.76],
  [771.43, 2567.31, 352.72, 308.76],
  [50, 2891.06, 296.77, 437.66],
  [361.76, 2891.06, 217.83, 350.73],
  [594.57, 2891.06, 390.69, 350.73],
  [1000.25, 2891.06, 217.83, 167.87],
  [1000.25, 3073.91, 217.83, 167.87],
  [361.76, 3256.77, 623.51, 415.67],
  [50, 3343.7, 296.77, 328.74],
  [50, 3687.43, 345.73, 308.76],
  [410.72, 3687.43, 345.73, 308.76],
  [771.43, 3687.44, 358.72, 308.76],
  [50, 4011.18, 558.56, 436.66],
  [625.54, 4011.18, 278.78, 436.66],
  [917.32, 4089.11, 211.83, 172.86],
  [917.32, 4275.96, 211.83, 172.86],
  [50, 4462.83, 212.83, 351.72],
  [277.82, 4462.83, 389.69, 350.73],
  [681.51, 4462.83, 473.63, 440.65],
  [50, 4828.54, 616.52, 415.67],
  [681.51, 4917.47, 295.77, 325.74],
  [50, 5265.19, 212.83, 172.86],
  [277.82, 5265.26, 295.77, 437.66],
  [588.58, 5266.19, 622.51, 436.66],
  [50, 5453.04, 212.83, 171.87],
  [50.93, 5639.9, 212.83, 429.66],
  [277.82, 5717.85, 389.69, 351.72],
  [682.51, 5717.85, 473.63, 440.65],
  [50, 6084.55, 375.71, 343.73],
  [440.7, 6084.55, 226.82, 343.73],
  // Rectangle 53: enlarged from the Figma-metadata size (212.83x171.87) to
  // 341x255 per explicit request — left/top (x/y) unchanged, only
  // width/height grow (right/bottom edges extend outward).
  [682.52, 6173.92, 341, 255],
];

// Figma hard-breaks this into exactly two lines (node 23:1081 has two child
// <p>s, not one wrapping paragraph) — the natural CSS wrap point at 727px
// width lands mid-sentence ("...Space } transforming..." stays on line 1),
// so the break is forced here instead of left to wrap.
const STATEMENT_LINE_1 =
  "My practices to sense the potential of 'mm' to 'm' the synesthetic { Parts - Furniture - Space } ";
const STATEMENT_LINE_2 =
  "transforming the most personal functions into universal experiences.";

export default function PartsGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <>
      <MainSideNav fixed />
      <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8]">
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
                    {item.image && (
                      <Image
                        src={
                          !isInstagram && isHovered && item.hoverImage
                            ? item.hoverImage
                            : item.image
                        }
                        alt={item.title}
                        fill
                        className={`object-cover transition-[filter] duration-200 ${
                          isInstagram && isHovered ? "brightness-50" : ""
                        }`}
                      />
                    )}
                    {isHovered && item.partsInfo && (
                      // Anchored bottom-left, margin from the tile edges (not
                      // the Figma frame) so it holds position at every tile
                      // size; `right-[13px]` lets long "Type:" descriptions
                      // wrap instead of overflowing narrow tiles, since Figma
                      // only gave per-instance fixed widths. Items with a
                      // Type/dimensions line get more bottom margin (19px) than
                      // name-only items (17px).
                      <div
                        className={`absolute left-[13px] right-[13px] flex flex-col text-white ${
                          item.partsInfo.type ? "bottom-[19px]" : "bottom-[17px]"
                        }`}
                      >
                        <p
                          className={`${crimsonText.className} mb-[7px] text-[15px] leading-[normal] whitespace-nowrap`}
                        >
                          {item.partsInfo.number}
                        </p>
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
                style={{ left: px(925), top: px(6608.28125), width: px(69), height: px(87) }}
              >
                <Image src="/main/logo.png" alt="" fill className="object-contain" />
              </div>
              <p
                className="absolute whitespace-nowrap text-[10px] text-[#818181]"
                style={{ left: px(933), top: px(6688.28125), width: px(59) }}
              >
                Eunji Wang©
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
