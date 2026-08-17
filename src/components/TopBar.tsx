"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";
import { createFigmaGeom } from "@/lib/figma-layout";
import AboutModal from "./AboutModal";

// Figma "/info" frame (get_metadata nodeId 1:416): width=1920. The nav row
// (wang eun ji / about / info / contact) sits at its own y=24, so no offset
// is subtracted here (unlike page content, which sits below this header).
const geom = createFigmaGeom(1920, 0);

export default function TopBar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 relative flex h-16 w-full shrink-0 items-center gap-6 bg-white px-6 text-xs lg:px-0">
        <Link href="/main" className="figma-pin font-bold uppercase" style={geom(40, 24)}>
          Wang eun ji
        </Link>
        <nav className="flex items-center gap-6 lg:contents">
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="figma-pin"
            style={geom(238, 24)}
          >
            about
          </button>
          <Link href="/info" className="figma-pin" style={geom(403, 24)}>
            info
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="figma-pin" style={geom(485, 24)}>
            contact
          </a>
        </nav>
      </header>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
