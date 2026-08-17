"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";
import AboutModal from "./AboutModal";

export default function TopBar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
        <Link href="/main" className="text-sm font-medium">
          Wang eun ji
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <button type="button" onClick={() => setIsAboutOpen(true)}>
            About
          </button>
          <Link href="/info">Info</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
        </nav>
      </header>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
