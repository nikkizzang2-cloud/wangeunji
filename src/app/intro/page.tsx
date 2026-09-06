"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// TODO: 실제 파츠 이미지, 초기 간격, 정렬 판정 기준은 Figma 디자인 연동 시 교체 예정.
const INITIAL_GAP_PX = 160;
const ALIGN_THRESHOLD_PX = 24;

export default function IntroPage() {
  const router = useRouter();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const draggedRef = useRef(0);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startXRef.current = event.clientX - draggedRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const next = Math.min(0, Math.max(-INITIAL_GAP_PX, event.clientX - startXRef.current));
    draggedRef.current = next;
    setDragX(next);
  };

  const handlePointerUp = () => {
    setIsDragging(false);

    if (draggedRef.current <= -(INITIAL_GAP_PX - ALIGN_THRESHOLD_PX)) {
      router.push("/main/parts");
      return;
    }

    draggedRef.current = 0;
    setDragX(0);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] select-none items-center justify-center overflow-hidden">
      <div className="flex items-center">
        <div className="h-64 w-48 bg-neutral-300" />
        <div
          className="h-64 w-48 cursor-grab touch-none bg-neutral-400 active:cursor-grabbing"
          style={{
            marginLeft: INITIAL_GAP_PX + dragX,
            transition: isDragging ? "none" : "margin-left 200ms ease",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
}
