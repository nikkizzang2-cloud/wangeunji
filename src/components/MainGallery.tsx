"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, works, type Work } from "@/data/works";

// TODO: 실제 비정형 배치 로직/치수는 Figma 디자인 연동 시 교체 예정. 현재는 자리표시용 크기 변형만 적용.
const SIZE_VARIANTS = [
  "aspect-[3/4] w-40",
  "aspect-square w-56",
  "aspect-[4/3] w-72",
  "aspect-[2/3] w-48",
];

export default function MainGallery() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const worksByYear = useMemo(() => {
    const grouped = new Map<number, Work[]>();
    for (const work of works) {
      const list = grouped.get(work.year) ?? [];
      list.push(work);
      grouped.set(work.year, list);
    }
    return [...grouped.entries()].sort((a, b) => b[0] - a[0]);
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {worksByYear.map(([year, yearWorks]) => (
          <section key={year} className="mb-16">
            <h2 className="mb-4 text-sm text-neutral-400">{year}</h2>
            <div className="flex flex-wrap gap-4">
              {yearWorks.map((work) => {
                const isDimmed =
                  activeCategory !== null && work.category !== activeCategory;
                const sizeClass = SIZE_VARIANTS[work.id % SIZE_VARIANTS.length];
                const isHovered = hoveredId === work.id;

                const content = (
                  <div
                    className={`relative flex items-end overflow-hidden bg-neutral-200 transition-opacity duration-200 ${sizeClass} ${
                      isDimmed ? "opacity-20" : "opacity-100"
                    }`}
                    onMouseEnter={() => setHoveredId(work.id)}
                    onMouseLeave={() =>
                      setHoveredId((current) => (current === work.id ? null : current))
                    }
                  >
                    {work.image && (
                      <Image
                        src={isHovered && work.hoverImage ? work.hoverImage : work.image}
                        alt={work.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    {isHovered && (
                      <div className="relative w-full bg-black/50 p-2 text-xs text-white">
                        {work.title}
                      </div>
                    )}
                  </div>
                );

                return work.slug ? (
                  <Link key={work.id} href={`/caption/${work.slug}`}>
                    {content}
                  </Link>
                ) : (
                  <div key={work.id}>{content}</div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="w-48 shrink-0 border-l border-neutral-200 px-4 py-8">
        <p className="mb-4 text-xs text-neutral-400">Filter</p>
        <ul className="space-y-2 text-sm">
          <li>
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={activeCategory === null ? "font-medium" : "text-neutral-400"}
            >
              All
            </button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <button
                type="button"
                onClick={() =>
                  setActiveCategory((current) => (current === category ? null : category))
                }
                className={activeCategory === category ? "font-medium" : "text-neutral-400"}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
