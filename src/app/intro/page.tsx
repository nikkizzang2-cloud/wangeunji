"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { px } from "@/lib/figma-layout";

// Figma "intro" frame (get_metadata nodeId 43:43; 43:82 is a second frame
// showing the same composition at the aligned/final position, used only as a
// reference for how far "lock right2"/"lock right" travel).
//
// Per the responsive rules in CLAUDE.md, this composition stays fixed-size
// at every viewport width and is just re-centered — it no longer scales
// down to fit the viewport (see the removed `useContainScale` usage). The
// bounding box below is the lock composition's own tight bounding box
// (lock-left's left edge to lock-right2's right edge, lock-right2's top
// edge to lock-left's bottom edge) in the original 1920-wide frame; each
// piece's position is expressed relative to that box's own top-left corner,
// and the box itself is centered with plain flexbox.
const BOUND_X = 799.499755859375;
const BOUND_Y = 443;
const BOUND_WIDTH = 914.109130859375 + 215.39002990722656 - BOUND_X;
const BOUND_HEIGHT = 482.7939453125 + 153.35293579101562 - BOUND_Y;

// "lock right2"/"lock right" move together as one rigid group when dragged.
// 43:82 shows their resting (aligned) position — the two nodes' x deltas
// between 43:43 and 43:82 agree (~98.109px), so that's the total leftward
// travel distance, now a plain screen-px distance since nothing scales.
const DRAG_DISTANCE_PX = 98.109130859375;
const ALIGN_THRESHOLD_PX = 15;

export default function IntroPage() {
  const router = useRouter();
  const lastXRef = useRef(0);
  const draggedRef = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Pointer move/up are attached to `window`, not the dragged element itself
  // — attaching them locally (or relying on setPointerCapture) turned out
  // unreliable together with the plain <img>s below: the browser's native
  // image drag-and-drop (images are draggable by default) intercepted the
  // gesture mid-drag, so the pointerup that should trigger navigation
  // sometimes never fired. `draggable={false}` on the <img>s prevents that
  // native drag from starting in the first place; the window-level listeners
  // here are a second layer of robustness so the drag still tracks correctly
  // even if the pointer leaves the element's bounds.
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    lastXRef.current = event.clientX;

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaCanvas = moveEvent.clientX - lastXRef.current;
      lastXRef.current = moveEvent.clientX;
      const next = Math.min(
        0,
        Math.max(-DRAG_DISTANCE_PX, draggedRef.current + deltaCanvas),
      );
      draggedRef.current = next;
      setDragX(next);
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      setIsDragging(false);

      if (draggedRef.current <= -(DRAG_DISTANCE_PX - ALIGN_THRESHOLD_PX)) {
        router.push("/main/parts");
        return;
      }

      draggedRef.current = 0;
      setDragX(0);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#f8f8f8]">
      <div
        className="relative"
        style={{ width: px(BOUND_WIDTH), height: px(BOUND_HEIGHT) }}
      >
        <div
          className="absolute bg-[#454545]"
          style={{
            left: px(0),
            top: px(482.7939453125 - BOUND_Y),
            width: px(114.52941131591797),
            height: px(153.35293579101562),
          }}
        />
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(813.499755859375 - BOUND_X),
            top: px(529 - BOUND_Y),
            width: px(85),
            height: px(64),
          }}
        >
          <Image
            src="/intro/lock-left1.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div
          className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
          style={{
            left: px(914.109130859375 - BOUND_X),
            top: px(443 - BOUND_Y),
            width: px(215.39002990722656),
            height: px(152.43936157226562),
            transform: `translateX(${px(dragX)})`,
            transition: isDragging ? "none" : "transform 200ms ease",
          }}
          onPointerDown={handlePointerDown}
        >
          {/* Figma applies a manual crop/zoom transform to each image
                  (non-uniform %, not a simple object-fit:cover), so a plain
                  <img> with the same percentages is the only faithful
                  reproduction — next/image's `fill` forces 100%/100%. */}
          <div className="absolute inset-0 overflow-hidden opacity-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/intro/lock-right2.png"
              alt=""
              draggable={false}
              className="absolute left-[-64.18%] top-[-27.94%] h-[194.74%] w-[183.67%] max-w-none"
            />
          </div>
          <div
            className="absolute overflow-hidden opacity-80"
            style={{
              left: px(933.4411010742188 - 914.109130859375),
              top: px(475.029296875 - 443),
              width: px(195.08824157714844),
              height: px(94.14705657958984),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/intro/lock-right.png"
              alt=""
              draggable={false}
              className="absolute left-[-73.35%] top-[-63.39%] h-[268.4%] w-[173.14%] max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
