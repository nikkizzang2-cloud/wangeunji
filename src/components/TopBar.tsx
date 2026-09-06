import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { createFigmaGeom } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 1:224): width=1920. The nav row
// (wang eun ji / home / info / contact) sits at its own y=28, so no offset
// is subtracted here (unlike page content, which sits below this header).
const geom = createFigmaGeom(1920, 0);

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 relative flex h-16 w-full shrink-0 items-center gap-6 bg-white px-6 text-xs lg:px-0">
      <Link href="/intro" className="figma-pin font-bold uppercase" style={geom(66, 28)}>
        Wang eun ji
      </Link>
      <nav className="flex items-center gap-6 lg:contents">
        <Link href="/main/parts" className="figma-pin lowercase" style={geom(260, 28)}>
          home
        </Link>
        <Link href="/info" className="figma-pin lowercase" style={geom(395, 28)}>
          info
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="figma-pin lowercase" style={geom(458, 28)}>
          contact
        </a>
      </nav>
    </header>
  );
}
