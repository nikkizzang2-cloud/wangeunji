"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { partsGallery } from "@/data/works";
import { createFigmaGeom } from "@/lib/figma-layout";
import MainSideNav from "./MainSideNav";

// Figma "/main" frame (get_metadata nodeId 1:224): width=1920, height=7243.
const FRAME_WIDTH = 1920;
// Matches TopBar's h-16; see CLAUDE.md "Figma 연동" for the conversion convention.
const TOPBAR_HEIGHT = 64;
const geom = createFigmaGeom(FRAME_WIDTH, TOPBAR_HEIGHT);

const STATEMENT =
  "My practices to sense the potential of 'mm' to 'm' the synesthetic { Parts - Furniture - Space } transforming the most personal functions into universal experiences.";

// x/y/width/height for each of the 53 tiles (node ids 1:229-1:389, 2:8, 2:210),
// read directly off get_metadata — not hand-tuned — sorted into visual
// (top-to-bottom, left-to-right) order so the mobile static layout reads
// naturally; Figma's own layer order doesn't match visual order.
const MASONRY_BOXES: [x: number, y: number, w: number, h: number][] = [
  [66.75, 242, 233.58, 181.08],
  [317, 242, 418, 378],
  [751, 242, 317, 469],
  [66.75, 439.32, 233.58, 180],
  [1083.56, 606.47, 351.44, 267.86],
  [66.75, 635, 667.51, 445.72],
  [750.34, 727.54, 317.15, 352.51],
  [1083.56, 894.69, 227.15, 185.36],
  [66.75, 1096.12, 366.44, 331.08],
  [449.26, 1096.12, 379.29, 331.08],
  [846.77, 1096.12, 378.22, 331.08],
  [66.75, 1443.27, 228.22, 184.29],
  [311.05, 1443.27, 317.15, 469.3],
  [644.27, 1443.27, 667.51, 469.3],
  [66.75, 1644.7, 228.22, 184.29],
  [66.75, 1845.07, 228.22, 460.72],
  [311.05, 1928.64, 417.87, 376.08],
  [744.98, 1928.64, 507.87, 472.51],
  [67.83, 2321.87, 661.09, 445.72],
  [744.98, 2416.15, 317.15, 349.29],
  [1078.21, 2416.15, 227.15, 185.36],
  [66.75, 2783.66, 366.44, 331.08],
  [446.05, 2783.66, 379.29, 331.08],
  [840.34, 2783.66, 378.22, 331.08],
  [66.75, 3130.81, 318.22, 469.3],
  [401.05, 3130.81, 233.58, 376.08],
  [650.7, 3130.81, 418.94, 376.08],
  [1085.71, 3130.81, 233.58, 180],
  [1085.71, 3326.89, 233.58, 180],
  [401.05, 3522.96, 668.59, 445.72],
  [66.75, 3616.18, 318.22, 352.51],
  [66.75, 3984.76, 370.72, 331.08],
  [453.55, 3984.76, 370.72, 331.08],
  [840.34, 3984.76, 384.65, 331.08],
  [66.75, 4331.91, 598.94, 468.22],
  [683.91, 4331.91, 298.94, 468.22],
  [996.78, 4415.48, 227.15, 185.36],
  [996.78, 4615.84, 227.15, 185.36],
  [66.75, 4816.21, 228.22, 377.15],
  [311.05, 4816.21, 417.87, 376.08],
  [743.91, 4816.21, 507.87, 472.51],
  [66.75, 5208.36, 661.09, 445.72],
  [743.91, 5303.72, 317.15, 349.29],
  [66.75, 5676.58, 228.22, 185.36],
  [311.05, 5676.65, 317.15, 469.3],
  [644.27, 5677.65, 667.51, 468.22],
  [66.75, 5878.01, 228.22, 184.29],
  [67.75, 6078.38, 228.22, 460.72],
  [311.05, 6161.95, 417.87, 377.15],
  [744.98, 6161.95, 507.87, 472.51],
  [66.75, 6555.17, 402.87, 368.58],
  [485.69, 6555.17, 243.22, 368.58],
  [745, 6651, 228.22, 184.29],
];

export default function PartsGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-[#f8f8f8]">
      <div className="relative mx-auto w-full max-w-[1920px] px-6 py-10 lg:min-h-[7200px] lg:px-0 lg:py-0">
        <p
          className="figma-pin mb-10 max-w-md text-[13px] capitalize leading-relaxed lg:mb-0 lg:max-w-none"
          style={geom(66, 165, 572)}
        >
          {STATEMENT}
        </p>

        <MainSideNav />

        {partsGallery.map((item, index) => {
          const [x, y, w, h] = MASONRY_BOXES[index];
          const isHovered = hoveredId === item.id;
          const isInstagram = item.instagramUrl !== null;

          const content = (
            <div
              className="figma-pin relative mb-2 w-full overflow-hidden bg-neutral-200 lg:mb-0"
              style={geom(x, y, w, h)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() =>
                setHoveredId((current) => (current === item.id ? null : current))
              }
            >
              {item.image && (
                <Image
                  src={!isInstagram && isHovered && item.hoverImage ? item.hoverImage : item.image}
                  alt={item.title}
                  fill
                  className={`object-cover transition-[filter] duration-200 ${
                    isInstagram && isHovered ? "brightness-50" : ""
                  }`}
                />
              )}
              {isHovered && (
                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-xs text-white">
                  {item.title}
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
          className="figma-pin relative mx-auto mt-16 w-16 lg:mx-0 lg:mt-0 lg:w-auto"
          style={geom(922, 7118, 69, 87)}
        >
          <Image src="/main/logo.png" alt="" fill className="object-contain object-bottom" />
        </div>
        <p
          className="figma-pin mt-2 text-center text-[10px] whitespace-nowrap text-[#818181] lg:text-left"
          style={geom(930, 7198)}
        >
          wang eunji©
        </p>
      </div>
    </div>
  );
}
