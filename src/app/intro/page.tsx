"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { px } from "@/lib/figma-layout";
import { useContainScale } from "@/lib/useContainScale";

// Figma "intro" frame (get_metadata nodeId 43:43; 43:82 is a second frame
// showing the same composition at the aligned/final position, used only as a
// reference for how far "lock right2"/"lock right" travel). width=1920,
// height=1080 — same reference frame TopBar/the /main pages use.
//
// Scaled by the same min(1, viewport/1920, viewport/1080) factor as
// CaptionCarousel.tsx (`useContainScale` — an `object-fit: contain` for the
// whole 1920x1080 canvas, since this is a no-scroll page and a viewport
// wider-than-16:9 would clip a width-only scale's bottom edge). An earlier
// revision made this composition literally fixed-size and just re-centered
// it in the viewport instead — matching a responsive rule read as "화면
// 크기와 무관하게 항상 고정" — but that's the same mismatch TopBar/nav had
// on /main: at any viewport that isn't exactly 1920x1080 (i.e. almost every
// real window), a fixed-size composition doesn't match Figma's proportions.
// So this goes back to scaling, now with the min(1, ...) cap fixed.
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

// "lock right2"/"lock right" move together as one rigid group when dragged.
// 43:82 shows their resting (aligned) position — the two nodes' x deltas
// between 43:43 and 43:82 agree (~98.109px), so that's the total leftward
// travel distance, in the same raw-Figma-px space as everything else here
// (converted to on-screen px via the canvas's own scale, same as position).
const DRAG_DISTANCE_PX = 98.109130859375;
const ALIGN_THRESHOLD_PX = 15;

export default function IntroPage() {
  const router = useRouter();
  const scale = useContainScale(CANVAS_WIDTH, CANVAS_HEIGHT);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
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
      // The composition is rendered at `scale`x its raw Figma size, so a
      // real on-screen pointer delta corresponds to `delta / scale` in the
      // canvas's own coordinate space — without this, the drag would visibly
      // outrun (or lag) the cursor at any scale other than 1.
      const deltaScreen = moveEvent.clientX - lastXRef.current;
      lastXRef.current = moveEvent.clientX;
      const deltaCanvas = deltaScreen / scaleRef.current;
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
        className="relative shrink-0"
        style={{ width: px(CANVAS_WIDTH), height: px(CANVAS_HEIGHT), transform: `scale(${scale})` }}
      >
        <div
          className="absolute bg-[#454545]"
          style={{
            left: px(799.499755859375),
            top: px(482.7939453125),
            width: px(114.52941131591797),
            height: px(153.35293579101562),
          }}
        />
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(813.499755859375),
            top: px(529),
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
            left: px(914.109130859375),
            top: px(443),
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
