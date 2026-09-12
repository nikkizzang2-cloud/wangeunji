"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createFigmaGeom, px } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 23:1023): width=1920. This
// sidebar nav is shared chrome between /main/parts and /main/furniture.
const geom = createFigmaGeom(1920, 64);

const NAV_ITEMS = [
  { label: "furniture", href: "/main/furniture", y: 200 },
  { label: "parts", href: "/main/parts", y: 221 },
] as const;

// Figma "main.parts" frame (get_metadata nodeId 117:2): width=1512. Desktop
// nav is now literally fixed-px, right-anchored by a margin that never
// shrinks ("furniture/parts 메뉴는 margin-right 고정") — width=78,
// right margin = 1512 - 1394 - 78 = 40px. Stacked with 0 gap (furniture
// y=200 h=15, parts y=215 h=15). Both labels are always plain black text —
// the current page is indicated by font-weight (bold) once one has been
// picked (see hasSelected below), not by a muted color anymore (an earlier
// revision used `#b9b9b9` gray for the inactive label; explicit follow-up
// request replaced that with "inactive stays regular black" instead).
const DESKTOP_NAV_WIDTH = 78;
const DESKTOP_NAV_RIGHT_MARGIN = 40;
const DESKTOP_NAV_ITEMS = [
  { label: "furniture", href: "/main/furniture", y: 200 },
  { label: "parts", href: "/main/parts", y: 215 },
] as const;

// Below the site-wide mobile toggle width (700px, see TopBar.tsx), the
// mobile Figma frames ("main.parts mobile"
// 95:2244, "parts.funiture mobile" 95:2340, both authored at native width
// 800 regardless of where the toggle itself sits) place this nav at x=682
// (right edge at 760, i.e. 40px from the 800px frame's own right edge)
// instead of desktop's x=1764 — not a scaled-down copy of the desktop
// numbers.
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
  // Furniture-only: its grid intentionally borrows parts' (narrower) scale
  // reference width so both pages start shrinking at the same viewport
  // width (see FurnitureGallery.tsx's SCALE_REFERENCE_WIDTH comment) — the
  // cost is that its widest tile, Rectangle f15, can momentarily render far
  // enough right to sit behind this fixed menu while scrolled to its
  // on-screen band. White text keeps both labels legible against the image
  // in that moment (matches the hover-text layers, already white-on-image),
  // overriding the normal black/muted-current-page coloring while true.
  whiteOverlap?: boolean;
};

// Explicit request: every time you land on /main fresh FROM /intro
// (whichever of parts/furniture the redirect resolves to) — whether by
// dragging the lock open by hand or via the "home" auto-unlock — NEITHER
// label should read as "current" yet, both stay black, since the user
// hasn't actually chosen one over the other for THIS entrance. Once they
// click either nav item, the black/gray current-vs-inactive split turns on
// and stays on for the rest of that entrance — until they go back through
// /intro again, which resets it. sessionStorage (not component state)
// because MainSideNav remounts fresh on every parts<->furniture navigation
// (each is its own page/component tree, not a shared persisted layout) —
// plain useState would reset right back to "nothing selected yet" on the
// very next click. intro/page.tsx calls resetNavSelection() right where it
// sets the "entered" cookie (both gate the SAME two success paths: manual
// drag and auto-unlock), so a fresh entrance always starts clean even if
// the previous one had already turned the split on.
const NAV_SELECTED_KEY = "mainNavSelected";
function markNavSelected() {
  try {
    sessionStorage.setItem(NAV_SELECTED_KEY, "1");
  } catch {
    // Private-browsing/storage-disabled: worst case the black/gray split
    // never turns on, which just means it stays "both black" — harmless.
  }
}
function readNavSelected() {
  try {
    return sessionStorage.getItem(NAV_SELECTED_KEY) === "1";
  } catch {
    return false; // storage inaccessible — safe "both black" default
  }
}
export function resetNavSelection() {
  try {
    sessionStorage.removeItem(NAV_SELECTED_KEY);
  } catch {
    // Storage inaccessible — nothing to reset either way.
  }
}

export default function MainSideNav({
  pinned = false,
  fixed = false,
  whiteOverlap = false,
}: MainSideNavProps) {
  const pathname = usePathname();
  // Lazy initializer (runs synchronously on first render, not inside an
  // effect — see useHasHover.ts's identical comment for why: the
  // react-hooks/set-state-in-effect rule flags a synchronous setState in an
  // effect body) reads sessionStorage before first paint, so there's no
  // flash from "both black" to the split — SSR's own render doesn't depend
  // on this value (sessionStorage doesn't exist server-side, so it starts
  // `false` there, but that's also correct: a server-rendered page has by
  // definition not been "selected" yet).
  const [hasSelected] = useState(readNavSelected);

  if (fixed) {
    return (
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
        <div className="relative hidden h-full min-[700px]:block">
          {DESKTOP_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={markNavSelected}
              className={`pointer-events-auto absolute text-right capitalize ${
                whiteOverlap ? "text-white" : "text-black"
              } ${hasSelected && pathname === item.href ? "font-bold" : ""}`}
              style={{
                right: px(DESKTOP_NAV_RIGHT_MARGIN),
                top: px(item.y),
                width: px(DESKTOP_NAV_WIDTH),
                fontSize: px(10),
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div
          className="figma-fixed-scale h-full min-[700px]:hidden"
          style={{ ["--ffs-width" as string]: px(800) }}
        >
          <div className="figma-fixed-scale-inner">
            {MOBILE_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={markNavSelected}
                className={`pointer-events-auto absolute text-right capitalize text-black ${
                  hasSelected && pathname === item.href ? "font-bold" : ""
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
