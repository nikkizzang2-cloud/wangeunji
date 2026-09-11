"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONTACT_EMAIL } from "@/lib/constants";
import { px } from "@/lib/figma-layout";

// Figma "main.parts" frame (get_metadata nodeId 117:2): width=1512. The nav
// row (wang eun ji / home / info / contact) sits at its own y=25. Below the
// mobile toggle width (700px, hardcoded directly into the `min-[700px]:`
// classes below — Tailwind's JIT scanner needs a literal string, not a
// template-interpolated constant, to generate the corresponding CSS), a
// separate mobile Figma frame gives different x positions AND font sizes
// for the nav row — "intro mobile" (95:2088) and "info mobile" (95:2287)
// both carry an identical copy of this row.
//
// Desktop (>=700px) is now literally fixed-px, never scaled — a site-wide
// rule change: "상단바의 크기, 비율, 위치는 화면 크기와 무관하게 항상 고정."
// An earlier revision scaled the header by the same min(1, viewport/1920)
// factor as the page canvas below it, since back then EVERYTHING else on the
// page scaled together too (see `.figma-fixed-scale`, globals.css) — a
// literally-fixed header next to scaling content drifted out of proportion.
// That's no longer a risk: /main and /info's own content is now also
// literally fixed-px (only the tile grid / CV image still scales, and only
// enough to avoid colliding with other fixed chrome — see PartsGallery.tsx's
// `.figma-collision-scale`), so nothing in view still scales against it.
//
// The 700px toggle is intentionally a DIFFERENT number from
// MOBILE_DESIGN_WIDTH below (the mobile Figma frames' own native reference
// width, used only for `--ffs-width`'s scaling math) — explicit site-wide
// request to move the switch point down to 700px without touching the
// mobile design itself, which was authored at 800px and keeps scaling from
// that same reference regardless of where the switch happens to occur.
const MOBILE_DESIGN_WIDTH = 800;

const DESKTOP_NAV = [
  { href: "/main/parts", label: "home", left: 187.875 },
  { href: "/info", label: "info", left: 294.2578125 },
] as const;
const MOBILE_NAV = [
  { href: "/main/parts", label: "home", left: 207 },
  { href: "/info", label: "info", left: 321 },
] as const;

// Fixed (not sticky) and out of document flow, so it floats over every
// page's scrollable content. Pages reserve a literal 64px (h-16/pt-16) for
// it since that height never changes; as the user scrolls, content passes
// underneath and shows through the transparent background.
export default function TopBar() {
  // Explicit user brief: the caption page's nav text is a different fixed
  // color (#b9b9b9) than everywhere else on the site — everything else
  // (position/size/links) stays identical, so this is a single color
  // override rather than a separate caption-specific header variant. On
  // caption pages specifically, it also turns black on hover.
  const pathname = usePathname();
  const isCaptionPage = pathname?.startsWith("/caption/") ?? false;
  const textColorClass = isCaptionPage ? "text-[#b9b9b9] hover:text-black" : "";

  // "home" only routes through the lock-opening motion when clicked FROM
  // /intro itself (explicit correction — an earlier revision routed every
  // "home" click through /intro?unlock=1 regardless of the current page,
  // which is wrong: from anywhere else "home" should still jump straight to
  // /main/parts, no detour). intro/page.tsx reads `?unlock=1` to auto-play
  // the drag-open motion (no user drag needed) before continuing on to
  // /main/parts — since we're already ON /intro, this is a same-page
  // client-side navigation (just the search param changes), not a real
  // page change.
  const isIntroPage = pathname === "/intro";
  const homeHref = isIntroPage ? "/intro?unlock=1" : "/main/parts";

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 overflow-hidden bg-transparent">
      <div className="relative hidden h-full min-[700px]:block">
        <Link
          href="/intro"
          className={`absolute touch-manipulation font-bold uppercase ${textColorClass}`}
          style={{ left: px(35), top: px(25), fontSize: px(11) }}
        >
          Wang eun ji
        </Link>
        {DESKTOP_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.label === "home" ? homeHref : item.href}
            className={`absolute touch-manipulation lowercase ${textColorClass}`}
            style={{ left: px(item.left), top: px(25), fontSize: px(10) }}
          >
            {item.label}
          </Link>
        ))}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className={`absolute lowercase ${textColorClass}`}
          style={{ left: px(343.90234375), top: px(25), fontSize: px(10) }}
        >
          contact
        </a>
      </div>

      <div
        className="figma-fixed-scale h-full min-[700px]:hidden"
        style={{ ["--ffs-width" as string]: px(MOBILE_DESIGN_WIDTH) }}
      >
        <div className="figma-fixed-scale-inner">
          <Link
            href="/intro"
            className={`absolute touch-manipulation font-bold uppercase ${textColorClass}`}
            style={{ left: px(45), top: px(25), fontSize: px(14.5) }}
          >
            Wang eun ji
          </Link>
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.label === "home" ? homeHref : item.href}
              // touch-manipulation: reported broken specifically for "home"
              // while already on /intro on a real phone (worked fine via
              // mouse-click emulation in testing, so this is a best-effort
              // hardening rather than a confirmed root-cause fix) — this
              // link sits inside a transform-scaled `.figma-fixed-scale`
              // container, the same kind of nesting already documented (see
              // intro/page.tsx) to have unreliable native touch dispatch on
              // iOS WKWebView.
              className={`absolute touch-manipulation lowercase ${textColorClass}`}
              style={{ left: px(item.left), top: px(25), fontSize: px(13.5) }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={`absolute lowercase ${textColorClass}`}
            style={{ left: px(373), top: px(25), fontSize: px(13.5) }}
          >
            contact
          </a>
        </div>
      </div>
    </header>
  );
}
