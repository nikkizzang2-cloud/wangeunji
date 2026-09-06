"use client";

import { useState } from "react";
import type { CaptionWork } from "@/data/works";

// TODO: 실제 좌/우 이미지 스택 개수·이미지는 Figma 디자인 연동 시 교체 예정.
const PLACEHOLDER_STACK_SIZE = 3;

type CaptionCarouselProps = {
  work: CaptionWork;
};

export default function CaptionCarousel({ work }: CaptionCarouselProps) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  const goToNext = (setIndex: (updater: (current: number) => number) => void, count: number) => {
    setIndex((current) => (current + 1) % count);
  };

  const isLastRightSlide = rightIndex === PLACEHOLDER_STACK_SIZE - 1;

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-2 overflow-hidden">
      <button
        type="button"
        onClick={() => goToNext(setLeftIndex, PLACEHOLDER_STACK_SIZE)}
        className="relative flex items-center justify-center border-r border-neutral-200 bg-neutral-100"
      >
        <span className="text-sm text-neutral-400">
          Left {leftIndex + 1} / {PLACEHOLDER_STACK_SIZE}
        </span>
      </button>

      <button
        type="button"
        onClick={() => goToNext(setRightIndex, PLACEHOLDER_STACK_SIZE)}
        className="relative flex items-center justify-center bg-neutral-100"
      >
        {isLastRightSlide ? (
          <span className="text-sm text-neutral-500">{work.credit}</span>
        ) : (
          <span className="text-sm text-neutral-400">
            Right {rightIndex + 1} / {PLACEHOLDER_STACK_SIZE}
          </span>
        )}
      </button>
    </div>
  );
}
