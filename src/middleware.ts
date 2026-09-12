import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Explicit request: opening/pasting/sharing a link to any page EXCEPT
// /caption/[slug] should always land on /intro first, never jump straight
// to the gated page — no exceptions, not even "I already went through
// /intro once in this browser" (an earlier revision used a session cookie
// for that, but the user explicitly rejected it: pasting a copied link
// must redirect EVERY time). A later revision tried checking for the
// `?_rsc=` query param Next.js's client router appends to *prefetch*
// requests, on the theory that it'd also mark real navigations — it
// doesn't: router.push's own navigation fetch (used by /intro's drag-unlock
// and "home" auto-unlock) didn't carry it, which broke auto-unlock outright
// (confirmed via actual network requests, not just reasoning about it).
//
// Referer is the reliable, framework-version-independent signal: ANY
// request a page's own JS initiates (a <Link> click, router.push, a
// same-origin fetch) carries that page's URL as Referer, browser-enforced,
// not something Next.js has to opt into. A genuine top-level navigation —
// typing/pasting a URL, clicking a link from OUTSIDE the site (KakaoTalk,
// email, another site), or a hard refresh — has no same-origin Referer
// (most browsers send none at all for a reload). So: Referer isn't from
// this same site -> redirect to /intro. No cookie, no client-side code.
export function middleware(request: NextRequest) {
  const referer = request.headers.get("referer");
  const isFromSameSite = referer !== null && new URL(referer).origin === request.nextUrl.origin;
  if (!isFromSameSite) {
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
