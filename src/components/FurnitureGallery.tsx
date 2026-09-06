"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { furnitureGallery } from "@/data/works";
import MainSideNav from "./MainSideNav";

// TODO: furniture 페이지의 실제 배치는 Figma 프레임이 나오면 정확한 좌표로 교체 예정.
const SIZE_VARIANTS = [
  "aspect-[3/4] w-40",
  "aspect-square w-56",
  "aspect-[4/3] w-72",
  "aspect-[2/3] w-48",
];

export default function FurnitureGallery() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-[#f8f8f8]">
      <div className="relative mx-auto w-full max-w-[1920px] px-6 py-10 lg:px-0">
        <MainSideNav />

        <div className="flex flex-wrap gap-4 lg:pr-56">
          {furnitureGallery.map((item) => {
            const isHovered = hoveredId === item.id;
            const sizeClass = SIZE_VARIANTS[item.id % SIZE_VARIANTS.length];

            return (
              <Link
                key={item.id}
                href={`/caption/${item.slug}`}
                className={`relative overflow-hidden bg-neutral-200 ${sizeClass}`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() =>
                  setHoveredId((current) => (current === item.id ? null : current))
                }
              >
                {item.image && (
                  <Image
                    src={isHovered && item.hoverImage ? item.hoverImage : item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}
                {isHovered && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-2 text-xs text-white">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
