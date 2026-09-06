"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createFigmaGeom } from "@/lib/figma-layout";

// Figma "/main" frame (get_metadata nodeId 1:224): width=1920. This sidebar
// nav is shared chrome between /main/parts and /main/furniture.
const geom = createFigmaGeom(1920, 64);

const NAV_ITEMS = [
  { label: "furniture", href: "/main/furniture", y: 201 },
  { label: "parts", href: "/main/parts", y: 222 },
] as const;

export default function MainSideNav() {
  const pathname = usePathname();

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
