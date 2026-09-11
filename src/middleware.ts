import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Explicit request: sharing/pasting a link to any page EXCEPT /caption/[slug]
// should always land on /intro first, never jump straight to the gated page
// — only actually navigating there FROM WITHIN the site (through /intro's
// lock, or between /main/parts <-> /main/furniture <-> /info once already
// in) should work. /intro/page.tsx sets a session cookie ("entered") right
// before it navigates away on a successful unlock (manual drag or the
// auto-unlock triggered by clicking "home" while already on /intro) — this
// middleware redirects to /intro whenever that cookie is missing, which is
// true for a fresh browser session opening a bare/shared link but NOT for
// in-app navigation (the cookie rides along on every same-origin request)
// or a page refresh within the same session (cookie persists until the
// browser tab/window closes, since it's set with no explicit maxAge).
export function middleware(request: NextRequest) {
  if (!request.cookies.has("entered")) {
    return NextResponse.redirect(new URL("/intro", request.url));
  }
  return NextResponse.next();
}

// Next.js statically analyzes this at build time — it must be a literal
// array here, not a reference to a variable (a computed/imported list
// fails with "matcher needs to be a static array" and breaks the build).
// Keep in sync with this comment's own list if a gated route is ever
// added/removed: /main, /main/parts, /main/furniture, /info.
export const config = {
  matcher: ["/main", "/main/parts", "/main/furniture", "/info"],
};
