"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { px } from "@/lib/figma-layout";

// Figma "intro" frame (get_metadata nodeId 43:43; 43:82 is a second frame
// showing the same composition at the aligned/final position, used only as a
// reference for how far "lock right2"/"lock right" travel). width=1920,
// height=1080 — same reference frame TopBar/the /main pages use. Below
// MOBILE_BREAKPOINT (800px, see TopBar.tsx), a separate "intro mobile" frame
// (nodeId 95:2088, width=800, height=1532) is used instead — not just a
// scaled-down copy of the desktop numbers (the lock pieces are relatively
// bigger on mobile: lock-left is 100x134 there vs 114.53x153.35 on desktop,
// a ~0.873 ratio, not the 800/1920=0.417 frame-width ratio).
//
// Both variants render at all times (`hidden`/`min-[800px]:hidden` toggles
// which is visible) rather than picking one in JS, so there's no
// hydration-mismatch flash — same approach as PartsGallery.tsx's canvas vs.
// TopBar.tsx's two nav blocks.
//
// Scaled via `.figma-contain-scale` (globals.css) — pure CSS, both axes
// (object-fit: contain for the whole canvas, since this is a no-scroll page
// and a viewport wider-than-the-canvas-aspect-ratio would clip a
// width-only scale's bottom edge). This used to be a JS hook
// (`useContainScale`) reading `window.innerWidth`/`innerHeight`, which
// turned out unreliable in KakaoTalk's in-app browser — see globals.css's
// `.figma-contain-scale` comment for the full story ("잠금장치 사이즈가 너무
// 커"). The lock composition sits centered in Figma's own frame (both
// desktop and mobile), so centering the whole scaled canvas via flexbox
// keeps it centered on screen at any viewport — the explicit requirement for
// the mobile variant ("가운데 잠금 여는 요소는 무조건 화면의 중앙에").
const DESKTOP_CANVAS = { width: 1920, height: 1080 };
const MOBILE_CANVAS = { width: 800, height: 1532 };

// "lock right2"/"lock right" move together as one rigid group when dragged.
// Desktop's 43:82 shows their resting (aligned) position — the two nodes' x
// deltas between 43:43 and 43:82 agree (~98.109px), so that's the total
// leftward travel distance in that frame's raw-px space.
//
// There's no equivalent second "aligned" frame for mobile, so its drag
// distance is derived by scaling the desktop value by the lock piece's own
// size ratio (mobile lock-left width 118.452... / desktop lock-left width
// 114.52941... ≈ 1.034) rather than the frame-width ratio (800/1920 ≈
// 0.417) — the interlocking geometry should scale with the drawn object
// itself, not the frame. Approximate pending a real mobile "aligned"
// reference frame; easy to correct if the drag distance feels off.
const DESKTOP_DRAG_DISTANCE_PX = 98.109130859375;
const DESKTOP_ALIGN_THRESHOLD_PX = 15;
const MOBILE_LOCK_SCALE = 118.45237731933594 / 114.52941131591797;
const MOBILE_DRAG_DISTANCE_PX = DESKTOP_DRAG_DISTANCE_PX * MOBILE_LOCK_SCALE;
const MOBILE_ALIGN_THRESHOLD_PX = DESKTOP_ALIGN_THRESHOLD_PX * MOBILE_LOCK_SCALE;

type LockGeom = {
  lockLeft: { x: number; y: number; w: number; h: number };
  lockLeft1: { x: number; y: number; w: number; h: number };
  lockRight2: { x: number; y: number; w: number; h: number };
  lockRight: { x: number; y: number; w: number; h: number };
  dragDistance: number;
  alignThreshold: number;
};

const DESKTOP_GEOM: LockGeom = {
  lockLeft: { x: 799.499755859375, y: 482.7939453125, w: 114.52941131591797, h: 153.35293579101562 },
  lockLeft1: { x: 813.499755859375, y: 529, w: 85, h: 64 },
  lockRight2: { x: 914.109130859375, y: 443, w: 215.39002990722656, h: 152.43936157226562 },
  lockRight: { x: 933.4411010742188, y: 475.029296875, w: 195.08824157714844, h: 94.14705657958984 },
  dragDistance: DESKTOP_DRAG_DISTANCE_PX,
  alignThreshold: DESKTOP_ALIGN_THRESHOLD_PX,
};

const MOBILE_GEOM: LockGeom = {
  lockLeft: { x: 228.9988839328289, y: 691.273811340332, w: 118.45237731933594, h: 158.7261962890625 },
  lockLeft1: { x: 243.2131700515747, y: 738.6547622680664, w: 88.79436492919922, h: 66.36691284179688 },
  lockRight2: { x: 347.49683380126953, y: 651.0000000000036, w: 222.64491271972656, h: 157.5738983154297 },
  lockRight: { x: 367.5881652832031, y: 684.1666679382324, w: 201.3201904296875, h: 97.1545181274414 },
  dragDistance: MOBILE_DRAG_DISTANCE_PX,
  alignThreshold: MOBILE_ALIGN_THRESHOLD_PX,
};

function LockComposition({
  className,
  canvasWidth,
  canvasHeight,
  geom,
}: {
  className: string;
  canvasWidth: number;
  canvasHeight: number;
  geom: LockGeom;
}) {
  const router = useRouter();
  const dragElRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ scale: 1, lastX: 0, dragged: 0 });
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Drag is implemented with plain mouse/touch events instead of Pointer
  // Events: Pointer Events turned out unreliable inside KakaoTalk's in-app
  // browser (didn't fire, or got intercepted by the app's own gesture
  // handling before reaching the page — reported as dragging "손으로
  // 드래그도 안돼").
  //
  // touchstart/mousedown are registered on `window`, not on the draggable
  // element itself, and do their OWN geometric hit-test (touch coordinates
  // vs. the element's `getBoundingClientRect()`) instead of relying on the
  // browser resolving which nested element the touch landed on. This is a
  // second attempt at the same bug: attaching directly to the element (with
  // `{ passive: false }`) still didn't fire on iOS Kakao ("여전히 터치가
  // 안돼") — iOS WKWebView has known touch hit-testing bugs for elements
  // nested inside a `transform: scale(...)` + `container-type: size`
  // ancestor (see `.figma-contain-scale`, globals.css): the element paints
  // in the right place but doesn't reliably receive the touch. Listening at
  // `window` sidesteps target resolution entirely — any touch anywhere
  // still reaches window, and we do our own math instead of trusting which
  // element the engine decided was hit.
  //
  // The conversion from on-screen pointer px to the canvas's own coordinate
  // space no longer trusts a separately-tracked "current scale" number
  // (that used to come from the same JS hook removed for the sizing fix
  // above) — it's measured directly off the dragged element's actual
  // rendered width at drag-start (`getBoundingClientRect().width /
  // geom.lockRight2.w`), so it's correct regardless of how the CSS scale
  // was computed or when.
  useEffect(() => {
    const el = dragElRef.current;
    if (!el) return;

    const isInsideDragArea = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      return (
        clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
      );
    };

    const startDrag = (clientX: number) => {
      const rect = el.getBoundingClientRect();
      dragStateRef.current.scale = rect.width / geom.lockRight2.w;
      dragStateRef.current.lastX = clientX;
      setIsDragging(true);
    };

    const moveDrag = (clientX: number) => {
      const state = dragStateRef.current;
      const deltaScreen = clientX - state.lastX;
      state.lastX = clientX;
      const deltaCanvas = deltaScreen / state.scale;
      const next = Math.min(0, Math.max(-geom.dragDistance, state.dragged + deltaCanvas));
      state.dragged = next;
      setDragX(next);
    };

    const endDrag = () => {
      setIsDragging(false);
      const state = dragStateRef.current;
      if (state.dragged <= -(geom.dragDistance - geom.alignThreshold)) {
        router.push("/main/parts");
        return;
      }
      state.dragged = 0;
      setDragX(0);
    };

    const onMouseDown = (event: MouseEvent) => {
      if (!isInsideDragArea(event.clientX, event.clientY)) return;
      event.preventDefault();
      startDrag(event.clientX);
      const onMouseMove = (moveEvent: MouseEvent) => moveDrag(moveEvent.clientX);
      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        endDrag();
      };
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!isInsideDragArea(touch.clientX, touch.clientY)) return;
      event.preventDefault();
      startDrag(touch.clientX);
      const onTouchMove = (moveEvent: TouchEvent) => {
        moveEvent.preventDefault();
        moveDrag(moveEvent.touches[0].clientX);
      };
      const onTouchEnd = () => {
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
        endDrag();
      };
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
      window.addEventListener("touchcancel", onTouchEnd);
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [geom, router]);

  return (
    <div
      className={`figma-contain-scale relative h-dvh items-center justify-center overflow-hidden bg-[#f8f8f8] ${className}`}
      style={{
        ["--fcs-width" as string]: px(canvasWidth),
        ["--fcs-height" as string]: px(canvasHeight),
      }}
    >
      <div
        className="figma-contain-scale-inner relative shrink-0"
        style={{ width: px(canvasWidth), height: px(canvasHeight) }}
      >
        <div
          className="absolute bg-[#454545]"
          style={{
            left: px(geom.lockLeft.x),
            top: px(geom.lockLeft.y),
            width: px(geom.lockLeft.w),
            height: px(geom.lockLeft.h),
          }}
        />
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(geom.lockLeft1.x),
            top: px(geom.lockLeft1.y),
            width: px(geom.lockLeft1.w),
            height: px(geom.lockLeft1.h),
          }}
        >
          <Image src="/intro/lock-left1.png" alt="" fill className="object-cover" />
        </div>

        <div
          ref={dragElRef}
          className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
          style={{
            left: px(geom.lockRight2.x),
            top: px(geom.lockRight2.y),
            width: px(geom.lockRight2.w),
            height: px(geom.lockRight2.h),
            transform: `translateX(${px(dragX)})`,
            transition: isDragging ? "none" : "transform 200ms ease",
          }}
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
              left: px(geom.lockRight.x - geom.lockRight2.x),
              top: px(geom.lockRight.y - geom.lockRight2.y),
              width: px(geom.lockRight.w),
              height: px(geom.lockRight.h),
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

export default function IntroPage() {
  return (
    <>
      <LockComposition
        className="hidden min-[800px]:flex"
        canvasWidth={DESKTOP_CANVAS.width}
        canvasHeight={DESKTOP_CANVAS.height}
        geom={DESKTOP_GEOM}
      />
      <LockComposition
        className="flex min-[800px]:hidden"
        canvasWidth={MOBILE_CANVAS.width}
        canvasHeight={MOBILE_CANVAS.height}
        geom={MOBILE_GEOM}
      />
    </>
  );
}
