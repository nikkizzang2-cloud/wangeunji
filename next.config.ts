import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets the dev server serve /_next/static/* (JS chunks) and the HMR
  // websocket to requests coming in on the Mac's LAN IP, not just
  // localhost — without this, Next.js 403s those requests (a DNS-rebinding
  // protection), so a phone on the same Wi-Fi loading
  // http://192.168.0.124:3000 gets a fully-rendered page (HTML/CSS load
  // fine) with zero working JavaScript, since every chunk 403s. Looked
  // exactly like the page was "frozen" — no drag, no interactivity of any
  // kind — regardless of which mobile browser was used, since the actual
  // cause was the JS never loading at all, not a touch-handling bug.
  allowedDevOrigins: ["192.168.0.124"],
};

export default nextConfig;
