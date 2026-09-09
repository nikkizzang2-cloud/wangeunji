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

// Below MOBILE_BREAKPOINT (800px, see TopBar.tsx), the mobile Figma frames
// ("main.parts mobile" 95:2244, "parts.funiture mobile" 95:2340) place this
// nav at x=682 (right edge at 760, i.e. 40px from the 800px frame's own
// right edge) instead of desktop's x=1764 — not a scaled-down copy of the
// desktop numbers.
const MOBILE_NAV_ITEMS = [
  { label: "furniture", href: "/main/furniture", y: 301 },
  { label: "parts", href: "/main/parts", y: 319 },
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
  // Viewport-pinned (stays put while the page scrolls, see the class above)
  // AND scaled by the same min(1, viewport/1920) factor as the page canvas
  // below it (`.figma-fixed-scale`, globals.css) — left-anchored at Figma's
  // real x=1764 like PartsGallery.tsx/FurnitureGallery.tsx's grid, not the
  // viewport's right edge. A literal `right: 78px` anchor used to hold this
  // nav's screen position fixed while the canvas scaled down around it, but
  // that meant its own size/position never scaled either, so at any width
  // other than exactly 1920px it drifted out of proportion with the (now
  // correctly-scaling) page content — same issue as TopBar, see its comment.
  fixed?: boolean;
};

export default function MainSideNav({ pinned = false, fixed = false }: MainSideNavProps) {
  const pathname = usePathname();

  if (fixed) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
        <div
          className="figma-fixed-scale hidden h-full min-[800px]:block"
          style={{ ["--ffs-width" as string]: px(1920) }}
        >
          <div className="figma-fixed-scale-inner">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pointer-events-auto absolute text-right capitalize ${
                  pathname === item.href ? "font-bold" : ""
                }`}
                style={{
                  left: px(1764),
                  top: px(item.y),
                  width: px(78),
                  fontSize: px(13),
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="figma-fixed-scale h-full min-[800px]:hidden"
          style={{ ["--ffs-width" as string]: px(800) }}
        >
          <div className="figma-fixed-scale-inner">
            {MOBILE_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`pointer-events-auto absolute text-right capitalize ${
                  pathname === item.href ? "font-bold" : ""
                }`}
                style={{
                  left: px(682),
                  top: px(item.y),
                  width: px(78),
                  fontSize: px(13),
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
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
