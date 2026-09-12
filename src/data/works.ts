import { INSTAGRAM_URL } from "@/lib/constants";
import { PARTS_INFO, type PartsInfo } from "@/data/partsInfo";
import { CAPTION_CONTENT } from "@/data/captionContent";

export type CaptionWork = {
  slug: string;
  title: string;
  // Everything below powers /caption/[slug] (get_design_context nodeId
  // 72:1167 / 72:1145). Center title block ("작업제목"/"제목설명") — real
  // content from CAPTION_CONTENT, see its own file for where it came from.
  workTitleLines: string[] | null;
  workSubtitleKo: string | null;
  workSubtitleEn: string | null;
  // Right-carousel text layer's 정보1 (Parts/type/size), 정보2 ("for" +
  // exhibition — a string, except work-14 where the user gave an explicit
  // 4-line example), 정보3 (date), and Group 249 (Korean/English caption,
  // each entry a hard-broken line/paragraph per "모든 글은 단위로 줄바꿈").
  // Real content from CAPTION_CONTENT — separate from the shared PARTS_INFO
  // parts/furniture hover layers use, since some wording differs here (e.g.
  // "a vessel lock" vs PARTS_INFO's "vessel lock", matching the Figma
  // reference's own phrasing for this page specifically).
  partsInfo: { name: string; type: string; dimensions: string };
  exhibition: string | string[] | null;
  year: string | null;
  captionKo: string[] | null;
  captionEn: string[] | null;
};

export type GalleryItem = {
  id: number;
  image: string | null;
  hoverImage: string | null;
  title: string;
  slug: string | null;
  instagramUrl: string | null;
  // Powers the /main/parts and /main/furniture hover text layers
  // (number/name/type/dimensions) — populated for all of partsGallery and
  // for furnitureGallery's captioned 17 (see PARTS_CAPTION_RECTANGLE_NUMBERS).
  partsInfo?: PartsInfo;
};

const CAPTION_COUNT = 17;
const PARTS_COUNT = 53;

// Maps partsGallery array index (id-1, and PartsGallery.tsx's TILE_GEOM
// index — both are the same visual top-to-bottom/left-to-right order) to
// the Figma layer name ("Rectangle N") the designer used for the matching
// photo filename. NOT a 1:1 sequential numbering — Figma's layer numbers
// don't follow visual order. Source: public/main/parts/rectangle-N.jpg
// (renamed from "Rectangle N.jpg", see /Users/isihyeon/Documents/eunji/image/main/parts/).
// Rectangle 43 and 53 are missing from the delivered image set (53 is
// intentionally left empty) — those two slots stay imageless (null).
export const PARTS_RECTANGLE_NUMBERS = [
  1, 3, 4, 2, 7, 5, 6, 8, 9, 10, 11, 12, 14, 15, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 31, 30, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 45, 48, 49, 50,
  51, 52, 53,
];

// Per-rectangle Instagram post for each of the 36 non-captioned parts tiles
// (the other 17 link to /caption instead — see PARTS_CAPTION_RECTANGLE_NUMBERS
// below) — explicit request to replace the single shared INSTAGRAM_URL
// fallback with each tile's own real post. The user supplied a name + URL
// list, not rectangle numbers, so this matches by PARTS_INFO's own `name`
// field (src/data/partsInfo.ts) — exact for most (e.g. "shackle", "cleat"),
// close-spelling for a few PARTS_INFO typos (logque/logue, magnetic
// clasps/claps), and a handful of best-effort semantic matches where
// PARTS_INFO's internal working name doesn't literally match the given
// post's caption — flagged individually below; worth a quick visual
// double-check against the user's own list if any of these seem off.
// (Rectangle 5's PARTS_INFO name was originally "drain" and rectangle 11's
// was "ventrgile" — both a guessed match against this list's "Grating"/"Vent
// Grile" at the time; a later explicit request renamed PARTS_INFO itself to
// "Grating"/"Vent Grile", so those two are exact matches now too.)
//   - rectangle 6 "door hinge" <- "Door Stop", rectangle 40 "door hinge"
//     <- plain "door hinge" (PARTS_INFO has two identical "door hinge"
//     entries; the given list has one plain "door hinge" and one "Door
//     Latch" — arbitrarily split across the two, see rectangle 52 below)
//   - rectangle 7 "paver" <- "Paver Support"
//   - rectangle 8 "wire clamp" <- "펜스 클립" (fence clip)
//   - rectangle 34 "joint part" <- "pipe joint"
//   - rectangle 41 "rack" <- "Hose Rack"
//   - rectangle 42 "Frame rib" <- "Support Frame"
//   - rectangle 48 "cimping sleeve" <- "슬리브" (sleeve)
//   - rectangle 52 "Door lock" <- "Door Latch"
export const PART_INSTAGRAM_URLS: Record<number, string> = {
  1: "https://www.instagram.com/p/C2KnkSYPmMn/?stkn=OXF5aTZ5YmFnb2s3", // bobbin
  3: "https://www.instagram.com/p/C5AKEfwp0b3/?stkn=ZndwemJwbXp1cHNm", // rat guard
  4: "https://www.instagram.com/p/C-jkuIWpBtm/?stkn=MWI3NWtybXYxNDcybQ==", // bow / Bowstick
  5: "https://www.instagram.com/p/C3ObwWOP6-n/?stkn=a3Vvb2gwOWxpYXRt", // Grating
  6: "https://www.instagram.com/p/C4xlVyipDJp/?stkn=MTh3bW43cmZtMTAxNw==", // door hinge / Door Stop
  7: "https://www.instagram.com/p/C4oiTK4v2MQ/?stkn=NXNvbGlucnJoaHY1", // paver / Paver Support
  8: "https://www.instagram.com/p/C52wNcJucCh/?stkn=bjdwbmczazZlbHAw", // wire clamp / 펜스 클립
  9: "https://www.instagram.com/p/C7ItPSLpn1Y/?stkn=Yzlxa3A3MTNpaDV0", // cleat
  11: "https://www.instagram.com/p/C3ZxsYRrB7B/?stkn=MWZoZG5ieWQzdGt6Zw==", // Vent Grile
  12: "https://www.instagram.com/p/C2X0nwjv_zF/?stkn=MXNlaDNiYnA2dWV5Yg==", // eye bolt / 아이볼트
  14: "https://www.instagram.com/p/C2_7o7yLTab/?stkn=MWEwcmJhNWR6eWpqcA==", // Trussbar / 트러스바
  15: "https://www.instagram.com/p/C6nTDTtJD9g/?stkn=NzZscXZyYTd4dnYx", // horse collar / Horse Colla
  16: "https://www.instagram.com/p/C2wSG31rtmd/?stkn=MWRsNXA0ZzBma283cA==", // spring / 스프링
  17: "https://www.instagram.com/p/C3ylx7dvC9f/?stkn=MTl6azRxY2FhcjlkYQ==", // U-bolt clamp / U-bolts clamp
  18: "https://www.instagram.com/p/C35D_6kp98c/?stkn=MWtjMXQ2Y2p6endyMw==", // gargoyle
  19: "https://www.instagram.com/p/C2Oa8rpP3Q1/?stkn=MjE4MmlhdW5uYXN2", // logque / logue
  21: "https://www.instagram.com/p/C2e4vrtvp9V/?stkn=MjBrM21sMDh4b3kx", // buckle / 버클
  23: "https://www.instagram.com/p/C2sJ0zBvLSZ/?stkn=MWVuY2x0bTV2Z25sbA==", // flag holder
  24: "https://www.instagram.com/p/C3j3NwlOUGm/?stkn=b25qczJqNjV0d2lq", // end cap / 앤드캡
  25: "https://www.instagram.com/p/C3FP1v5vnCR/?stkn=MWthZDNmMmVzeWtqdA==", // hook / 후크
  26: "https://www.instagram.com/p/C5QlFpOpA5e/?stkn=YXd6YjBiczQyZ3U1", // winder / 와인더
  28: "https://www.instagram.com/p/C3KoW4fv6bi/?stkn=MTcyZTE3cTJmZmFwbg==", // cable lug
  31: "https://www.instagram.com/p/C4nRR3OJRCS/?stkn=MWx1NWVrNDk0Z2J5eg==", // Postpone / Post stone
  34: "https://www.instagram.com/p/C2SP7K8PIkK/?stkn=MTdsOG9hMHhpOHQ0OA==", // joint part / pipe joint
  37: "https://www.instagram.com/p/C2Y7FdRP158/?stkn=NGI3ZjdqMzN1ZTJo", // Presser feet / presser feet
  38: "https://www.instagram.com/p/C4H59RwJENP/?stkn=NWF3bWRmOG5uaTJr", // Hose clamp / 호스밴드
  39: "https://www.instagram.com/p/C3IV6NSvFYC/?stkn=MWQ3dnRtM3NzNTAwdA==", // Strap
  40: "https://www.instagram.com/p/C2bxrUjLIbS/?stkn=MWkxZTN4dzdud29vOA==", // door hinge
  41: "https://www.instagram.com/p/C3Uc-zILypN/?stkn=bTZidTZucHJpdDYz", // rack / Hose Rack
  42: "https://www.instagram.com/p/C5H_MbbJNQZ/?stkn=ampkZXpqemJpZjE2", // Frame rib / Support Frame
  43: "https://www.instagram.com/p/C7yiLR8JN5g/?stkn=a3YzdXppMGtodWVr", // Wheel chocks
  45: "https://www.instagram.com/p/C2KxAOpvnHl/?stkn=MXNnbzJ2eXZseGYxMQ==", // magnetic clasps / claps
  48: "https://www.instagram.com/p/C2RaddoLqB2/?stkn=ZnluaG9lZ2Y1MzVt", // cimping sleeve / 슬리브
  49: "https://www.instagram.com/p/C4NJQ8fupVJ/?stkn=eXJodnAybTI1b3Yy", // Shackle
  50: "https://www.instagram.com/p/C87XdOtvHAG/?stkn=MTF3Z2tiNXZiZHhvcA==", // Towhitch / 토우히치
  52: "https://www.instagram.com/p/C206MrEPjJE/?stkn=cjloN2l0MWV4OHFk", // Door lock / Door Latch
};

// Maps captionWorks/hover-fN index (1-17, the same "work N" shared with
// furnitureGallery — see CLAUDE.md "parts(17개)와 furniture(17개, 동일한
// 작품)가 공유하는 17개") to the Figma "Rectangle N" identity in /main/parts
// that represents that same work. Given directly by the user as "hover fK -
// Rectangle Y" — but Y there is the parts hover-text NUMBERING LABEL
// (PARTS_INFO[...].number, e.g. "( 21. )"), not the literal Rectangle
// layer name: the label diverges from the rectangle number from 16 onward
// (rectangle 16 is labeled "( 17. )", see partsInfo.ts), and reversing that
// label back to a rectangle number for all 17 entries lines up exactly with
// the 17 rectangles that have Type/dimensions info — the set the user
// described these 17 as being ("파츠, 타입, mm 정보가 있는 사각형 번호"),
// confirming the label reading over a literal one.
const PARTS_CAPTION_RECTANGLE_NUMBERS = [
  20, 36, 29, 13, 53, 22, 2, 44, 46, 47, 27, 51, 33, 30, 10, 35, 32,
];
const RECTANGLE_TO_CAPTION_INDEX = new Map(
  PARTS_CAPTION_RECTANGLE_NUMBERS.map((rectangleNumber, index) => [rectangleNumber, index]),
);

export const captionWorks: CaptionWork[] = Array.from({ length: CAPTION_COUNT }, (_, index) => {
  const id = index + 1;
  const slug = `work-${String(id).padStart(2, "0")}`;
  const content = CAPTION_CONTENT[slug];

  return {
    slug,
    title: `Work ${String(id).padStart(2, "0")}`,
    workTitleLines: content ? [content.workTitle] : null,
    workSubtitleKo: content?.workSubtitleKo ?? null,
    workSubtitleEn: content?.workSubtitleEn ?? null,
    partsInfo: content
      ? { name: content.name, type: content.type, dimensions: content.dimensions }
      : { name: "", type: "", dimensions: "" },
    exhibition: content?.exhibition ?? null,
    year: content?.year ?? null,
    captionKo: content?.captionKo ?? null,
    captionEn: content?.captionEn ?? null,
  };
});

// All 53 parts photos have now been delivered.
const MISSING_RECTANGLE_NUMBERS = new Set<number>([]);

// The 17 rectangles in PARTS_CAPTION_RECTANGLE_NUMBERS link to captionWorks
// (same shared caption page as furnitureGallery's matching work) and swap to
// that work's hover-fN.jpg on hover; the other 36 link to Instagram instead
// (see PartsGallery.tsx for the darken+text-layer hover treatment).
export const partsGallery: GalleryItem[] = Array.from({ length: PARTS_COUNT }, (_, index) => {
  const id = index + 1;
  const rectangleNumber = PARTS_RECTANGLE_NUMBERS[index];
  const captionIndex = RECTANGLE_TO_CAPTION_INDEX.get(rectangleNumber);
  const linkedCaption = captionIndex !== undefined ? captionWorks[captionIndex] : undefined;

  return {
    id,
    image: MISSING_RECTANGLE_NUMBERS.has(rectangleNumber)
      ? null
      : `/main/parts/rectangle-${rectangleNumber}.jpg`,
    // Reuses furnitureGallery's hover images directly (same file, same
    // "work N" identity) rather than duplicating them under public/main/parts.
    hoverImage: captionIndex !== undefined ? `/main/furniture/hover-f${captionIndex + 1}.jpg` : null,
    title: linkedCaption ? linkedCaption.title : `Part ${String(id).padStart(2, "0")}`,
    slug: linkedCaption ? linkedCaption.slug : null,
    // Falls back to the generic INSTAGRAM_URL only for the (currently none,
    // but kept as a safety net) case a non-captioned rectangle has no entry
    // in PART_INSTAGRAM_URLS.
    instagramUrl: linkedCaption ? null : (PART_INSTAGRAM_URLS[rectangleNumber] ?? INSTAGRAM_URL),
    partsInfo: PARTS_INFO[rectangleNumber],
  };
});

// All 17 furniture photos have now been delivered. Unlike parts, furniture's
// Figma layer numbers ("Rectangle fN") already match captionWorks index 1:1,
// so no remapping table is needed. Source: public/main/furniture/rectangle-fN.jpg
// (renamed from "Rectangle fN.jpg", see /Users/isihyeon/Documents/eunji/image/main/furniture/).
const MISSING_FURNITURE_NUMBERS = new Set<number>([]);

// captionWorks와 1:1로 연결된다. hoverImage는 base image 유무와 무관하게 17장 모두
// 존재한다 (public/main/furniture/hover-fN.jpg, 원본 "hover fN.jpg" —
// "hover f10jpg.jpg"는 오타로 보고 f10으로 정리, 그 외 이름은 그대로 두었다.
// see /Users/isihyeon/Documents/eunji/image/hover/) — f5는 base image가 없어
// FurnitureGallery.tsx가 hover 여부와 무관하게 렌더링하지 않으므로 지금은
// 화면에 반영되지 않고, base image가 채워지면 그대로 동작한다.
export const furnitureGallery: GalleryItem[] = captionWorks.map((caption, index) => {
  const id = index + 1;
  // Same "work N" identity as partsGallery's matching captioned rectangle
  // (see PARTS_CAPTION_RECTANGLE_NUMBERS above) — reuses that rectangle's
  // PARTS_INFO entry so both galleries' hover text layers show identical
  // Parts/Type/dimensions content for the same piece. FurnitureGallery.tsx
  // doesn't render the `number` field (no numbering here, per spec).
  const rectangleNumber = PARTS_CAPTION_RECTANGLE_NUMBERS[index];
  return {
    id,
    image: MISSING_FURNITURE_NUMBERS.has(id) ? null : `/main/furniture/rectangle-f${id}.jpg`,
    hoverImage: `/main/furniture/hover-f${id}.jpg`,
    title: caption.title,
    slug: caption.slug,
    instagramUrl: null,
    partsInfo: PARTS_INFO[rectangleNumber],
  };
});

export function getCaptionBySlug(slug: string) {
  return captionWorks.find((caption) => caption.slug === slug);
}

export function getAllCaptionSlugs() {
  return captionWorks.map((caption) => caption.slug);
}
