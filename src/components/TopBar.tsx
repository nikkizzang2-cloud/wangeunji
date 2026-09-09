import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { px } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 23:1023): width=1920. The nav row
// (wang eun ji / home / info / contact) sits at its own y=25.
//
// The header's PROPORTIONS stay fixed — same relative position/size/font
// ratio to the page content at every viewport width — via the same
// min(1, viewport/1920) scale factor as the page canvas below it
// (`.figma-fixed-scale`, globals.css). It is NOT literally fixed-px: an
// earlier revision tried that ("항상 고정" taken as "never scales"), but
// since real browser windows are almost never exactly 1920px wide, a
// literally-fixed header just renders at the wrong size relative to the
// (correctly-scaling) page content below it at every other width — reported
// as "박스 이외의 요소들이 크게 보여". Children below keep their literal
// Figma px values; `.figma-fixed-scale-inner`'s transform does the scaling.

// Fixed (not sticky) and out of document flow, so it floats over every
// page's scrollable content. Pages reserve a literal 64px (h-16/pt-16) for
// it since that height never changes; as the user scrolls, content passes
// underneath and shows through the transparent background.
export default function TopBar() {
  return (
    <header
      className="figma-fixed-scale fixed inset-x-0 top-0 z-40 h-16 overflow-hidden bg-transparent"
    >
      <div className="figma-fixed-scale-inner">
        <Link
          href="/intro"
          className="absolute font-bold uppercase"
          style={{ left: px(50), top: px(25), fontSize: px(14) }}
        >
          Wang eun ji
        </Link>
        <Link
          href="/main/parts"
          className="absolute lowercase"
          style={{ left: px(244), top: px(25), fontSize: px(13) }}
        >
          home
        </Link>
        <Link
          href="/info"
          className="absolute lowercase"
          style={{ left: px(379), top: px(25), fontSize: px(13) }}
        >
          info
        </Link>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="absolute lowercase"
          style={{ left: px(442), top: px(25), fontSize: px(13) }}
        >
          contact
        </a>
      </div>
    </header>
  );
}
