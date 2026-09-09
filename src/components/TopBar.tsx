import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { px } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 23:1023): width=1920. The nav row
// (wang eun ji / home / info / contact) sits at its own y=25.
//
// The header's size, proportions and position stay literally fixed at every
// viewport width — it no longer scales with the page canvas below it (see
// the responsive rules in CLAUDE.md: "상단바(헤더)의 크기, 비율, 위치는 화면
// 크기와 무관하게 항상 고정"). Plain px throughout; no container query units.

// Fixed (not sticky) and out of document flow, so it floats over every
// page's scrollable content. Pages reserve a literal 64px (h-16/pt-16) for
// it since that height never changes; as the user scrolls, content passes
// underneath and shows through the transparent background.
export default function TopBar() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 h-16 overflow-hidden bg-transparent"
    >
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
    </header>
  );
}
