import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets the dev server serve /_next/static/* (JS chunks) and the HMR
  // websocket to requests coming in on the Mac's LAN IP, not just
  // localhost — without this, Next.js 403s those requests (a DNS-rebinding
  // protection), so a phone on the same Wi-Fi loading
  // http://<LAN IP>:3000 gets a fully-rendered page (HTML/CSS load fine)
  // with zero working JavaScript, since every chunk 403s. Looks exactly
  // like the page is "frozen" — no drag, no hover-reveal, no carousel
  // advance, regardless of which mobile browser is used — since the actual
  // cause is the JS never loading at all, not a touch-handling bug.
  //
  // This list is the Mac's LAN IP at the time it was written — it changes
  // whenever the Mac reconnects to Wi-Fi/gets a new DHCP lease (check via
  // `ipconfig getifaddr en0` in Terminal), so re-add the current one here
  // if phone testing over the LAN link stops working again.
  allowedDevOrigins: ["192.168.132.88"],
};

export default nextConfig;
