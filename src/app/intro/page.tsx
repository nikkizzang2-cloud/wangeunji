"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { px } from "@/lib/figma-layout";
import { resetNavSelection } from "@/components/MainSideNav";

// TopBar's "home" link routes here as `/intro?unlock=1` instead of straight
// to /main/parts (see TopBar.tsx's own comment) — this duration drives BOTH
// the CSS transition on the auto-animated lock (below) and the setTimeout
// that navigates on afterward, so the page-change lands right as the motion
// finishes rather than cutting it off or leaving an awkward pause.
const AUTO_UNLOCK_DURATION_MS = 450;

// Session cookie (no explicit maxAge, so it's cleared when the browser tab
// closes) — middleware.ts redirects any direct/shared-link visit to
// /main/parts, /main/furniture, or /info back to /intro unless this cookie
// is present, per explicit request: sharing a link to those pages should
// always show /intro first, only actually unlocking it (here) lets you
// through. Set right before EITHER success path navigates away — the
// manual drag (below) and the auto-unlock triggered by clicking "home"
// while already on /intro (IntroContent's own effect further down).
//
// Also resets MainSideNav's own "has the user picked parts vs furniture
// yet" flag — explicit follow-up request: going back through /intro (drag
// OR the "home" auto-unlock) should make both nav labels black again on
// arrival, not keep whatever black/gray split an earlier entrance already
// turned on.
function markEntered() {
  document.cookie = "entered=1; path=/";
  resetNavSelection();
}

// Mobile (<700px, the site-wide mobile toggle width — see TopBar.tsx) uses a separate "intro
// mobile" Figma frame (nodeId 95:2088, width=800, height=1532 — its own
// native reference width, unrelated to the 700px toggle) — not just a
// scaled-down copy of desktop's numbers (the lock pieces are relatively
// bigger on mobile: lock-left is 100x134 there vs 114.53x153.35 on desktop,
// a ~0.873 ratio, not the 800/1920=0.417 frame-width ratio). It still scales
// down via `.figma-contain-scale` as its own viewport narrows below its own
// 800px reference — unchanged, unaffected by the desktop change below.
//
// Desktop (>=700px) is now FIXED size, never scaling — explicit brief from
// the user: "화면이 줄어들어도 가운데 락의 크기가 바뀌지않고, 그냥 정중앙에
// 위치하면 돼" (as the screen shrinks, the center lock's size shouldn't
// change, just stay centered). Numbers below are node 117:243 (the "lock"
// group inside 117:178, a 1512px-reference frame) — same relative
// proportions/crops as the old 1920-frame numbers (117:243 is a
// proportionally-scaled copy, not a new design), just read as LOCAL
// coordinates within the lock's own small bounding box (0,0 to
// DESKTOP_LOCK_BOX's width/height) instead of a position within a huge
// 1920x1080 canvas — since there's no longer any canvas to scale, only this
// small fixed box, centered via plain flexbox (`h-dvh flex items-center
// justify-center`, no `.figma-contain-scale`/cqw involved at all).
//
// Both variants render at all times (`hidden`/`min-[700px]:hidden` toggles
// which is visible) rather than picking one in JS, so there's no
// hydration-mismatch flash — same approach as PartsGallery.tsx's canvas vs.
// TopBar.tsx's two nav blocks.
const DESKTOP_LOCK_BOX = { width: 260.0003662109375, height: 152.17530822753906 };
const MOBILE_CANVAS = { width: 800, height: 1532 };

// "lock right2"/"lock right" move together as one rigid group when dragged.
// The old 1920-frame desktop had a second "aligned position" reference frame
// (43:82) to read the travel distance off directly (~98.109px in that
// frame's raw-px space); 117:178/117:243 has no equivalent, so — same
// approach already used for MOBILE_DRAG_DISTANCE_PX below — that old value
// is scaled by the lock piece's own size ratio between the two frames
// (new lock-left width 90.235... / old lock-left width 114.529... ≈
// 0.78788) rather than by the frame-width ratio, since the interlocking
// geometry should scale with the drawn object itself, not the frame.
const DESKTOP_DRAG_DISTANCE_PX = 98.109130859375 * (90.23545837402344 / 114.52941131591797); // 77.298
const DESKTOP_ALIGN_THRESHOLD_PX = 15 * (90.23545837402344 / 114.52941131591797); // 11.818
const MOBILE_LOCK_SCALE = 118.45237731933594 / 114.52941131591797;
const MOBILE_DRAG_DISTANCE_PX = 98.109130859375 * MOBILE_LOCK_SCALE;
const MOBILE_ALIGN_THRESHOLD_PX = 15 * MOBILE_LOCK_SCALE;

type LockGeom = {
  lockLeft: { x: number; y: number; w: number; h: number };
  lockLeft1: { x: number; y: number; w: number; h: number };
  lockRight2: { x: number; y: number; w: number; h: number };
  lockRight: { x: number; y: number; w: number; h: number };
  dragDistance: number;
  alignThreshold: number;
};

// Local coordinates within DESKTOP_LOCK_BOX (i.e. each piece's own raw
// Figma x/y minus the "lock" group's own x=626/y=464) — node 117:243.
const DESKTOP_GEOM: LockGeom = {
  lockLeft: { x: 0, y: 31.352094650268555, w: 90.23545837402344, h: 120.82374572753906 },
  lockLeft1: { x: 11.030323028564453, y: 67.75769805908203, w: 66.96981811523438, h: 50.42433547973633 },
  lockRight2: { x: 90.2984619140625, y: 0, w: 169.70155334472656, h: 120.10395812988281 },
  lockRight: { x: 105.52978515625, y: 25.23525047302246, w: 153.7061767578125, h: 74.17660522460938 },
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
  scale = true,
  autoUnlock = false,
}: {
  className: string;
  canvasWidth: number;
  canvasHeight: number;
  geom: LockGeom;
  // false: never scales (fixed px size always), just centered via plain
  // flexbox — no `.figma-contain-scale` involved. See DESKTOP_LOCK_BOX's
  // comment. Defaults to true (mobile's existing scaling behavior).
  scale?: boolean;
  // See AUTO_UNLOCK_DURATION_MS's comment — drives the piece straight to its
  // fully-open position on mount instead of waiting for a drag.
  autoUnlock?: boolean;
}) {
  const router = useRouter();
  const dragElRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ scale: 1, lastX: 0, dragged: 0 });
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!autoUnlock) return;
    // Deferred a frame (not a synchronous setState in the effect body) so
    // the initial dragX=0 actually commits/paints first — otherwise the
    // transform jumps straight to its open position with no transition to
    // animate, since React would batch both the mount and this update into
    // the same paint.
    const raf = requestAnimationFrame(() => {
      dragStateRef.current.dragged = -geom.dragDistance;
      setDragX(-geom.dragDistance);
    });
    return () => cancelAnimationFrame(raf);
  }, [autoUnlock, geom.dragDistance]);

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
        markEntered();
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

  const lockPieces = (
    <>
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
          transition: isDragging
            ? "none"
            : `transform ${autoUnlock ? AUTO_UNLOCK_DURATION_MS : 200}ms ease`,
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
    </>
  );

  if (!scale) {
    return (
      <div className={`relative flex h-dvh items-center justify-center overflow-hidden bg-[#f8f8f8] ${className}`}>
        <div className="relative shrink-0" style={{ width: px(canvasWidth), height: px(canvasHeight) }}>
          {lockPieces}
        </div>
      </div>
    );
  }

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
        {lockPieces}
      </div>
    </div>
  );
}

function IntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoUnlock = searchParams.get("unlock") === "1";

  // Single navigation, owned here rather than inside each LockComposition
  // instance (desktop/mobile both render at once, `hidden`/`flex` toggling
  // which is visible — letting each own its own timer would fire router.push
  // twice) — timed to match AUTO_UNLOCK_DURATION_MS so it lands right as the
  // drag-open motion finishes.
  useEffect(() => {
    if (!autoUnlock) return;
    const timer = setTimeout(() => {
      markEntered();
      router.push("/main/parts");
    }, AUTO_UNLOCK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [autoUnlock, router]);

  return (
    <>
      <LockComposition
        className="hidden min-[700px]:flex"
        canvasWidth={DESKTOP_LOCK_BOX.width}
        canvasHeight={DESKTOP_LOCK_BOX.height}
        geom={DESKTOP_GEOM}
        scale={false}
        autoUnlock={autoUnlock}
      />
      <LockComposition
        className="flex min-[700px]:hidden"
        canvasWidth={MOBILE_CANVAS.width}
        canvasHeight={MOBILE_CANVAS.height}
        geom={MOBILE_GEOM}
        autoUnlock={autoUnlock}
      />
    </>
  );
}

export default function IntroPage() {
  // useSearchParams() requires a Suspense boundary — this page has no
  // server-rendered content to preserve either way (the whole tree is
  // already "use client"), so the fallback is never visibly shown in
  // practice.
  return (
    <Suspense fallback={null}>
      <IntroContent />
    </Suspense>
  );
}
