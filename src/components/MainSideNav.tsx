"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createFigmaGeom, px } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 23:1023): width=1920. This
// sidebar nav is shared chrome between /main/parts and /main/furniture.
const geom = createFigmaGeom(1920, 64);

const NAV_ITEMS = [
  { label: "furniture", href: "/main/furniture", y: 200 },
  { label: "parts", href: "/main/parts", y: 221 },
] as const;

type MainSideNavProps = {
  // parts/page.tsx renders its whole page as a fixed 1920px-wide Figma
  // canvas (see PartsGallery.tsx / CLAUDE.md "배치/크기 정확도"), so this nav
  // needs literal fixed px positions there too instead of the responsive
  // `figma-pin` (%-scaling + lg-breakpoint fallback) behavior furniture uses.
  pinned?: boolean;
  // Viewport-fixed variant: stays at the same on-screen position while the
  // page scrolls, instead of scrolling away with the canvas content. Must be
  // rendered OUTSIDE `.figma-canvas-content` (a `transform: scale(...)`
  // ancestor) — a `position: fixed` descendant of a transformed element is
  // fixed to that ancestor, not the viewport, per the CSS spec — see
  // PartsGallery.tsx/FurnitureGallery.tsx, which render it as a sibling of
  // the scroll container rather than inside the canvas tree.
  //
  // Fixed size/position at every viewport width — anchored to the right
  // edge (`right: 78px`, matching Figma's own margin from the frame's right
  // edge at 1920px: 1920 - 1764 - 78) instead of scaling with the page
  // canvas. As the viewport narrows, the canvas content to its left keeps
  // shrinking (see PartsGallery.tsx/FurnitureGallery.tsx) while this stays
  // put, so the gap between them is what closes up — not this nav itself.
  fixed?: boolean;
};

export default function MainSideNav({ pinned = false, fixed = false }: MainSideNavProps) {
  const pathname = usePathname();

  if (fixed) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`pointer-events-auto absolute text-right capitalize ${
              pathname === item.href ? "font-bold" : ""
            }`}
            style={{
              right: px(78),
              top: px(item.y),
              width: px(78),
              fontSize: px(13),
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  if (pinned) {
    return (
      <>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`absolute text-right text-[13px] capitalize ${
              pathname === item.href ? "font-bold" : ""
            }`}
            style={{ left: "1764px", top: `${item.y}px`, width: "78px" }}
          >
            {item.label}
          </Link>
        ))}
      </>
    );
  }

  return (
    <div className="mb-8 flex items-center gap-6 text-[13px] capitalize lg:mb-0 lg:contents">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`figma-pin text-right ${pathname === item.href ? "font-bold" : ""}`}
          style={geom(1764, item.y, 78)}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
