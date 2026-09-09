"use client";

import { useEffect, useState } from "react";

/**
 * Scale factor to fit a `width`x`height` Figma canvas entirely inside the
 * viewport with no scroll and no clipping — `min(1, vw/width, vh/height)`,
 * i.e. `object-fit: contain` (never upscaled past the canvas's real size —
 * same "1920px보다 넓을 때 커짐" cap as the `.figma-canvas-*` classes in
 * globals.css) for the whole page. For a no-scroll page
 * (/intro, /caption), the `.figma-canvas-*` classes (globals.css) aren't
 * enough on their own: those scale by width only (`100cqw`), which is right
 * for a scrolling page (any extra height just scrolls), but on a no-scroll
 * page a viewport proportionally wider than the canvas (1920x1080, 16:9) —
 * common, since browser chrome eats vertical space even on a 16:9 display,
 * pushing the effective viewport wider-than-16:9 — makes the width-scaled
 * canvas taller than the viewport, clipping its bottom under `overflow-hidden`
 * (reported as "전체화면으로 했을 때 아래가 잘리는 거 같아"). Computed in JS
 * (not CSS `cqw`/`cqh`) since the height-based half of that `min` would
 * otherwise need `container-type: size` on an ancestor whose own height is
 * itself derived from a width-based calc — a circular dependency.
 *
 * Kept in its own "use client" file, separate from figma-layout.ts's plain
 * (hook-free) helpers — those are imported by Server Components (e.g.
 * info/page.tsx), and a hook import anywhere in that file taints the whole
 * module for Next's server/client boundary check.
 *
 * TopBar is fixed-size at every viewport width (see TopBar.tsx), so it no
 * longer needs to track this scale — this hook only drives the page's own
 * canvas now.
 */
export function useContainScale(width: number, height: number) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      setScale(Math.min(1, window.innerWidth / width, window.innerHeight / height));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [width, height]);

  return scale;
}
