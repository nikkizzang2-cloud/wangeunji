"use client";

import { useEffect, useState } from "react";

const MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

// SSR/first paint has no `window` — true (hover) is the safe default here
// since it matches this site's original desktop-only behavior; the real
// value takes over immediately once client code can run (see the lazy
// useState initializer below), before any interaction is possible.
function getHasHover(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(MEDIA_QUERY).matches;
}

// True when the current pointing device can genuinely hover (mouse,
// trackpad) — independent of viewport width. A touch-only device (a phone,
// or a tablet held in landscape even though it's wide enough to show the
// desktop-width gallery layout) gets false; a real cursor gets true even in
// a narrow/resized desktop browser window. The gallery components use this
// to choose between hover-reveal and the tap-once-reveal/tap-twice-navigate
// pattern, instead of assuming "desktop width" always means "has a mouse".
//
// The initial value comes from a lazy useState initializer (runs
// synchronously during the first client render, not inside an effect — the
// react-hooks/set-state-in-effect rule flags a synchronous setState in an
// effect body); the effect below only subscribes to the media query's own
// `change` event, the pattern that rule actually wants. This value only
// ever affects event-handler *logic*, never what gets rendered, so the
// server (always `true`) vs. client (real value) difference on first paint
// can't cause a hydration mismatch.
export function useHasHover(): boolean {
  const [hasHover, setHasHover] = useState(getHasHover);

  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY);
    const onChange = (event: MediaQueryListEvent) => setHasHover(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return hasHover;
}
