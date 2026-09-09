import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { px } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 23:1023): width=1920. The nav row
// (wang eun ji / home / info / contact) sits at its own y=25. Below the
// MOBILE_BREAKPOINT (800px), a separate mobile Figma frame gives different
// x positions AND slightly larger font sizes (13.5px/14.5px vs desktop's
// 13px/14px) for the nav row — "intro mobile" (95:2088) and "info mobile"
// (95:2287) both carry an identical copy of this row (previously ~5px off
// between the two; now in sync after the user's latest Figma edit).
//
// The header's PROPORTIONS stay fixed — same relative position/size/font
// ratio to the page content at every viewport width — via the same
// min(1, viewport/referenceWidth) scale factor as the page canvas below it
// (`.figma-fixed-scale`, globals.css, `--ffs-width` set per breakpoint
// below). It is NOT literally fixed-px: an earlier revision tried that
// ("항상 고정" taken as "never scales"), but since real browser windows are
// almost never exactly 1920px (or 800px) wide, a literally-fixed header just
// renders at the wrong size relative to the (correctly-scaling) page content
// below it at every other width — reported as "박스 이외의 요소들이 크게
// 보여". Children below keep their literal Figma px values;
// `.figma-fixed-scale-inner`'s transform does the scaling.
// Tailwind can only see literal class strings at build time, so the
// `min-[800px]:` breakpoint below is hardcoded in the className props (not
// built from this constant) — this is just the shared reference value for
// the mobile --ffs-width and doc comments; keep both in sync if it changes.
const MOBILE_BREAKPOINT = 800;

const DESKTOP_NAV = [
  { href: "/main/parts", label: "home", left: 244 },
  { href: "/info", label: "info", left: 379 },
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
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 overflow-hidden bg-transparent">
      <div
        className="figma-fixed-scale hidden h-full min-[800px]:block"
        style={{ ["--ffs-width" as string]: px(1920) }}
      >
        <div className="figma-fixed-scale-inner">
          <Link
            href="/intro"
            className="absolute font-bold uppercase"
            style={{ left: px(50), top: px(25), fontSize: px(14) }}
          >
            Wang eun ji
          </Link>
          {DESKTOP_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="absolute lowercase"
              style={{ left: px(item.left), top: px(25), fontSize: px(13) }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="absolute lowercase"
            style={{ left: px(442), top: px(25), fontSize: px(13) }}
          >
            contact
          </a>
        </div>
      </div>

      <div
        className="figma-fixed-scale h-full min-[800px]:hidden"
        style={{ ["--ffs-width" as string]: px(MOBILE_BREAKPOINT) }}
      >
        <div className="figma-fixed-scale-inner">
          <Link
            href="/intro"
            className="absolute font-bold uppercase"
            style={{ left: px(45), top: px(25), fontSize: px(14.5) }}
          >
            Wang eun ji
          </Link>
          {MOBILE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="absolute lowercase"
              style={{ left: px(item.left), top: px(25), fontSize: px(13.5) }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="absolute lowercase"
            style={{ left: px(373), top: px(25), fontSize: px(13.5) }}
          >
            contact
          </a>
        </div>
      </div>
    </header>
  );
}
