"use client";

import Image from "next/image";
import localFont from "next/font/local";
import { useState } from "react";
import type { CaptionWork } from "@/data/works";
import { CAPTION_MEDIA, type CaptionMediaItem } from "@/data/captionMedia";
import { splitDimensionUnits } from "@/data/partsInfo";
import { fontgrow, growWith, px } from "@/lib/figma-layout";

// Figma "caption" pages — 5 reference frames across 5 responsive stages
// (get_design_context/get_metadata nodeId 72:1167 "caption" / 126:464 /
// 162:65 / 154:47 for the three DesktopCaption width stages (1885/1512/1200
// native px), 168:111 "caption 1200" for MidCaption (700-1200px, the frame's
// own 800px lower edge moved down to match the site's 700px mobile toggle),
// 168:72 "cation 800" for MobileCaption (<700px); 168:56/168:57 "caption.textframe"
// give the text-frame-internal font/leading/gap values InfoAndCaption and
// TitleBlock use everywhere below 1200px doesn't scale). Each stage has its
// own shrink rules, which a single uniform 2D transform can't express — same
// reasoning as /info's move to `clamp()`-driven custom CSS.
//
// TOPBAR_HEIGHT: matches TopBar.tsx's `h-16`.
const TOPBAR_HEIGHT = 64;
// Carousel top position across DesktopCaption's three width stages — fixed,
// deliberately NOT a function of viewport height. An earlier revision
// instead vertically centered the pair within the space below the header
// (`100vh`-driven), and later added a `min()` safety clamp shrinking the box
// when height was short — both reverted per explicit user feedback:
// resizing the BROWSER WINDOW's height shouldn't move or resize the
// carousel at all — width changes drive width-based shrinking (the whole
// point of these stages), but height on its own just crops/scrolls (see
// DesktopCaption's `overflow-y-auto` + the viewport-pinned text below). 69
// matches node 72:1167's own native y (64 + 5).
const CAROUSEL_TOP_OFFSET = TOPBAR_HEIGHT + 5;

// Three breakpoint anchors, read directly off the reference frames' own
// widths (each frame is named after its width): "caption 1920" (actual
// width 1885, not literally 1920 — the user's rounded verbal number),
// "caption 1512", "caption 1200". Below 1200, MidCaption/MobileCaption take
// over (see their own constants below).
const STAGE1_MIN_VW = 1885;
const STAGE2_END_VW = 1512;
const STAGE3_END_VW = 1200;

// Carousel box size at each anchor (w/h at STAGE1_MIN_VW / STAGE2_END_VW /
// STAGE3_END_VW respectively). The aspect ratio itself changes once during
// stage 2 (0.786 -> 0.751) then holds constant through stage 3 (confirmed
// by comparing 645/859 vs 512/681 — both ≈0.751) — that's why stage 2 and
// 3 need separate shrink rates rather than one continuous ratio-preserving
// scale from 1885 all the way to 1200.
const CAROUSEL_NATIVE = { w: 795, h: 1011 };
const CAROUSEL_STAGE2_FLOOR = { w: 645, h: 859 };
const CAROUSEL_STAGE3_FLOOR = { w: 512, h: 681 };

// Margins that shrink ONLY during stage 2 (1885->1512) and then hold flat
// through stage 3 (confirmed directly off the reference frames: e.g. the
// title box's left margin is already 12 at both the 1512 AND 1200 frames,
// not still shrinking at 1200).
const TITLE_LEFT_NATIVE = 20;
const TITLE_LEFT_FLOOR = 12;
const CAPTION_RIGHT_MARGIN_NATIVE = 85; // explicit user number (Figma's own right-side box measures ~74, close but not exact)
const CAPTION_RIGHT_MARGIN_FLOOR = 50;

const TITLE_WIDTH = 151; // "작업제목" box width, constant across every stage
const INFO_LABEL_WIDTH = 91;
const INFO_WIDTH = 325; // widest element (Group249/Group258, the ko/en caption text)

// Linear interpolation as a CSS `calc()` string: `floor` at `vwAtFloor`,
// `native` at `vwAtNative`, clamped flat outside that range. Every "shrinks
// during stage 2, then holds" margin above uses this once (vwAtNative =
// STAGE1_MIN_VW, vwAtFloor = STAGE2_END_VW).
function linearClamp(floor: number, native: number, vwAtFloor: number, vwAtNative: number): string {
  const rate = (native - floor) / (vwAtNative - vwAtFloor);
  return `clamp(${px(floor)}, calc(${px(native)} - (${px(vwAtNative)} - 100vw) * ${rate}), ${px(native)})`;
}

// Same idea but for a value that shrinks across TWO consecutive stages at
// different rates (the carousel's own width/height: 1885->1512->1200) —
// each stage's contribution is its own `clamp()` (0 outside its own range,
// full delta once viewport has shrunk past its start), summed together.
// This is the same "each range saturates on its own" trick /info's
// multi-stage shrinks used, just as two subtracted terms instead of one.
function twoStageShrink(
  native: number,
  mid: number,
  floor: number,
  vwNative: number,
  vwMid: number,
  vwFloor: number,
): string {
  const stage2Delta = native - mid;
  const stage2Rate = stage2Delta / (vwNative - vwMid);
  const stage3Delta = mid - floor;
  const stage3Rate = stage3Delta / (vwMid - vwFloor);
  return `calc(${px(native)} - clamp(${px(0)}, calc((${px(vwNative)} - 100vw) * ${stage2Rate}), ${px(stage2Delta)}) - clamp(${px(0)}, calc((${px(vwMid)} - 100vw) * ${stage3Rate}), ${px(stage3Delta)}))`;
}

const carouselWidthCss = twoStageShrink(
  CAROUSEL_NATIVE.w,
  CAROUSEL_STAGE2_FLOOR.w,
  CAROUSEL_STAGE3_FLOOR.w,
  STAGE1_MIN_VW,
  STAGE2_END_VW,
  STAGE3_END_VW,
);
const carouselHeightCss = twoStageShrink(
  CAROUSEL_NATIVE.h,
  CAROUSEL_STAGE2_FLOOR.h,
  CAROUSEL_STAGE3_FLOOR.h,
  STAGE1_MIN_VW,
  STAGE2_END_VW,
  STAGE3_END_VW,
);
const titleLeftMarginCss = linearClamp(TITLE_LEFT_FLOOR, TITLE_LEFT_NATIVE, STAGE2_END_VW, STAGE1_MIN_VW);
// Below 750px viewport HEIGHT (see DesktopCaption), the viewport-pinned text
// falls back to these — carousel-box-relative, cropping accepted.
const captionRightMarginCss = linearClamp(
  CAPTION_RIGHT_MARGIN_FLOOR,
  CAPTION_RIGHT_MARGIN_NATIVE,
  STAGE2_END_VW,
  STAGE1_MIN_VW,
);
// Below-750px-height fallback bottom-gap-from-carousel-edge, shared by both
// the title box and the info/caption box — they used to be two separate,
// mismatched pairs (30/4 for the title, 55/12 for the caption), which made
// the two boxes' bottoms visibly diverge once the >=750px viewport-pinned
// position (both pinned to the same bottom:35) gave way to this
// carousel-relative fallback. Confirmed against work-01, then applied to
// every work.
const BOTTOM_GAP_NATIVE = 70;
const BOTTOM_GAP_FLOOR = 20;
const bottomGapCss = linearClamp(BOTTOM_GAP_FLOOR, BOTTOM_GAP_NATIVE, STAGE2_END_VW, STAGE1_MIN_VW);

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
  weight: "400",
  display: "swap",
});

function MediaFrame({ item }: { item: CaptionMediaItem }) {
  // Per spec: crop-to-fill by default (object-cover), but a landscape
  // (wider-than-tall) photo in this portrait-tall box only gets fit to its
  // width (object-contain — for an image wider than the box's aspect ratio,
  // that resolves by width, matching "가로 사이즈만 딱 맞게") instead of
  // being cropped further to cover the full height.
  const fit = item.width > item.height ? "object-contain" : "object-cover";
  if (item.type === "video") {
    return (
      <video
        src={item.src}
        className={`absolute inset-0 size-full ${fit}`}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return <Image src={item.src} alt="" fill className={fit} />;
}

type CaptionCarouselProps = {
  work: CaptionWork;
};

// Text-frame-internal values below (font sizes, leading, gaps between the
// Parts/for/date rows and the ko/en caption block) are all read directly off
// get_metadata(168:56, "caption.textframe" right box) raw x/y — e.g. "for"
// label top(307) - Parts row bottom(246+48=294) = 13. Caption leading is
// Korean 1.7 / English 1.6 per explicit request (Figma's own 1.5 read as too
// tight once real content was in place); break-keep so lines only wrap at
// word (Korean 어절) boundaries, never mid-word.
const INFO_ROW_FONT_SIZE = 10;
const PARTS_ROW_GAP = 13; // Parts/type/size row -> for row
const FOR_ROW_GAP = 10; // for row -> date row
const DATE_ROW_GAP = 44; // date row -> ko/en caption block
const CAPTION_FONT_SIZE = 11;
const CAPTION_KO_EN_GAP = 19; // Korean caption bottom(391+119) -> English caption top(529)

// captionKo/captionEn lines render tight (no gap) by default — matching the
// source document's own line wraps, which aren't all real paragraph breaks.
// An empty-string entry ("") marks an actual blank line in the source: it's
// skipped and instead adds a gap before the NEXT line, reproducing exactly
// which breaks are "real" paragraphs vs. incidental wraps (explicit user
// request — see captionContent.ts for which works use this marker).
const CAPTION_PARAGRAPH_GAP = 10;

function CaptionLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, index) => {
        if (line === "") return null;
        const gapBefore = index > 0 && lines[index - 1] === "";
        return (
          <p key={index} style={gapBefore ? { marginTop: growWith(11, CAPTION_PARAGRAPH_GAP) } : undefined}>
            {line}
          </p>
        );
      })}
    </>
  );
}

// Right-carousel "text slide" content (정보1/2/3 + 한글/영문캡션) — shared by
// DesktopCaption's two viewport-height variants (see CarouselButton).
function InfoAndCaption({ work }: { work: CaptionWork }) {
  const dimensionUnits = work.partsInfo.dimensions
    ? splitDimensionUnits(work.partsInfo.dimensions)
    : [];
  // work-14's exhibition is an explicit multi-line example ("모든 글은
  // 단위로 줄바꿈") rather than a single string — normalize both shapes to
  // an array so rendering doesn't need to branch.
  const exhibitionLines = work.exhibition
    ? Array.isArray(work.exhibition)
      ? work.exhibition
      : [work.exhibition]
    : ["TBD"];

  return (
    <div
      className="flex flex-col text-left text-black capitalize"
      style={{ fontSize: fontgrow(INFO_ROW_FONT_SIZE) }}
    >
      <div className="flex leading-[1.6]" style={{ marginBottom: growWith(INFO_ROW_FONT_SIZE, PARTS_ROW_GAP) }}>
        <div
          className="shrink-0 whitespace-nowrap"
          style={{ width: growWith(INFO_ROW_FONT_SIZE, INFO_LABEL_WIDTH) }}
        >
          <p>Parts</p>
          <p>type</p>
          <p>size</p>
        </div>
        <div>
          <p>{work.partsInfo.name}</p>
          {work.partsInfo.type && <p>{work.partsInfo.type}</p>}
          {dimensionUnits.map((unit, index) => (
            <p key={index}>{unit}</p>
          ))}
        </div>
      </div>

      <div className="flex leading-[1.5]" style={{ marginBottom: growWith(INFO_ROW_FONT_SIZE, FOR_ROW_GAP) }}>
        <div
          className="shrink-0 whitespace-nowrap"
          style={{ width: growWith(INFO_ROW_FONT_SIZE, INFO_LABEL_WIDTH) }}
        >
          for
        </div>
        <div>
          {exhibitionLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <div className="flex leading-[1.5]" style={{ marginBottom: growWith(INFO_ROW_FONT_SIZE, DATE_ROW_GAP) }}>
        <div
          className="shrink-0 whitespace-nowrap"
          style={{ width: growWith(INFO_ROW_FONT_SIZE, INFO_LABEL_WIDTH) }}
        >
          date
        </div>
        <div>{work.year ?? "TBD"}</div>
      </div>

      <div style={{ fontSize: fontgrow(CAPTION_FONT_SIZE) }} className="break-keep">
        <div className={`${pretendard.className} leading-[1.7]`}>
          <CaptionLines lines={work.captionKo ?? ["TBD"]} />
        </div>
        <div className="leading-[1.6]" style={{ marginTop: growWith(CAPTION_FONT_SIZE, CAPTION_KO_EN_GAP) }}>
          <CaptionLines lines={work.captionEn ?? ["TBD"]} />
        </div>
      </div>
    </div>
  );
}

// "작업제목"/"제목설명" pair. Title-subtitle gap 17px, get_metadata(168:57).
const TITLE_SUBTITLE_GAP = 17;
// Subtitle box's base width — holds at 173px, but on DesktopCaption's
// >=1200px stage (see titleSubtitleWidthCss below) narrows further once the
// shrinking carousels would otherwise leave less than
// TITLE_RIGHT_CLEARANCE_FLOOR of room on its right; MidCaption/MobileCaption
// (no second carousel closing in) just use this flat value directly.
const SUBTITLE_WIDTH_NATIVE = 173;
const TITLE_RIGHT_CLEARANCE_FLOOR = 22; // subtitle's right edge -> right carousel's left edge, DesktopCaption only
// `var(--cap-w)` is the SAME carousel width driving both carousels, set
// once on DesktopCaption's own root (see its `--cap-w` style var).
const titleSubtitleWidthCss = `min(${growWith(10, SUBTITLE_WIDTH_NATIVE)}, calc(100vw - 2 * var(--cap-w) - ${px(
  TITLE_LEFT_FLOOR + TITLE_RIGHT_CLEARANCE_FLOOR,
)}))`;

// Gap between the Korean and English subtitle sentences — two separate
// paragraphs (blank-line-sized gap), except work-12 ("Distribution Board"),
// whose short one-line-each Ko/En pair stays flush with no gap.
const SUBTITLE_KO_EN_GAP = 10;
function subtitleKoEnGap(work: CaptionWork): number {
  return work.slug === "work-12" ? 0 : SUBTITLE_KO_EN_GAP;
}

function TitleBlock({ work }: { work: CaptionWork }) {
  return (
    <>
      <div className="break-keep" style={{ width: growWith(10, TITLE_WIDTH) }}>
        {(work.workTitleLines ?? [work.title]).map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div
        className="break-keep"
        style={{ marginTop: growWith(10, TITLE_SUBTITLE_GAP), width: titleSubtitleWidthCss }}
      >
        <p className={`${pretendard.className} whitespace-pre-line leading-[1.4]`}>{work.workSubtitleKo ?? "TBD"}</p>
        <p className="leading-[1.4]" style={{ marginTop: growWith(10, subtitleKoEnGap(work)) }}>
          {work.workSubtitleEn ?? "TBD"}
        </p>
      </div>
    </>
  );
}

type CarouselButtonProps = {
  side: "left" | "right";
  work: CaptionWork;
  onAdvance: () => void;
  isTextSlide: boolean;
  item: CaptionMediaItem | undefined;
};

// One position for all of DesktopCaption's three width stages
// (CAROUSEL_TOP_OFFSET, fixed — see its own comment for why); only
// `--cap-w`/`--cap-h` (set on the ancestor, width-driven) differ between
// stages.
function CarouselButton({ side, work, onAdvance, isTextSlide, item }: CarouselButtonProps) {
  return (
    <button
      type="button"
      onClick={onAdvance}
      aria-label={side === "left" ? "Previous left image" : "Next right image"}
      // touch-manipulation: this button sits inside an overflow-y-auto
      // scrolling page — without it, mobile browsers can wait to see
      // whether a tap turns into a scroll/double-tap-zoom gesture before
      // committing to a click, and any real-finger wobble during the tap
      // gets read as a scroll attempt, silently swallowing the tap
      // ("캐러셀 터치안됨 사진안넘어감"). Applied to every advance button in
      // this file for the same reason.
      className="absolute cursor-pointer touch-manipulation overflow-hidden bg-[#f8f8f8]"
      style={{
        [side]: 0,
        top: px(CAROUSEL_TOP_OFFSET),
        width: "var(--cap-w)",
        height: "var(--cap-h)",
      }}
    >
      {!isTextSlide && item && <MediaFrame item={item} />}
      {/* Below 750px viewport height: the fallback, carousel-box-relative
          responsive text position (cropping accepted below this height).
          Above 750px, DesktopCaption renders the real text slide as a
          `position:fixed` sibling instead — see its own comment for why
          that can't live in here (this button is overflow-hidden). Plain
          div, not its own button: it's already inside this clickable
          button, so a click on it bubbles up to `onAdvance` for free. */}
      {isTextSlide && (
        <div
          className="absolute flex flex-col [@media(min-height:750px)]:hidden"
          style={{
            right: captionRightMarginCss,
            bottom: bottomGapCss,
            width: growWith(CAPTION_FONT_SIZE, INFO_WIDTH),
          }}
        >
          <InfoAndCaption work={work} />
        </div>
      )}
    </button>
  );
}

function DesktopCaption({ work }: CaptionCarouselProps) {
  const media = CAPTION_MEDIA[work.slug] ?? { left: [], right: [] };
  const leftCount = media.left.length;
  const rightCount = media.right.length;
  // Right carousel has one extra "slide" beyond its photos: the text layer
  // (per spec, cycling 1 -> 2 -> 3 -> [text] -> 1 -> ...).
  const rightSlideCount = rightCount + 1;

  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  const advanceLeft = () => {
    if (leftCount === 0) return;
    setLeftIndex((current) => (current + 1) % leftCount);
  };
  const advanceRight = () => {
    setRightIndex((current) => (current + 1) % rightSlideCount);
  };

  const isRightTextSlide = rightIndex === rightCount;

  return (
    // "1200" here must match STAGE3_END_VW by hand (Tailwind needs a
    // literal string) — paired with CompactCaption's `max-[1200px]` below on
    // the SAME value so there's no 1px gap at exactly 1200 (max-[Npx]
    // compiles to strictly <N, so same-N pairing is what makes the two
    // ranges meet exactly — same fix as /info's breakpoint pairing bug).
    // overflow-y-auto (not hidden): lets a viewport shorter than the
    // carousel's own height scroll instead of clipping the photo — the
    // fixed header stays put regardless, since it's `position:fixed`,
    // independent of this container's scroll.
    <div
      className="relative hidden h-screen overflow-y-auto bg-[#f8f8f8] min-[1200px]:block"
      style={{
        ["--cap-w" as string]: carouselWidthCss,
        ["--cap-h" as string]: carouselHeightCss,
      }}
    >
      <CarouselButton
        side="left"
        work={work}
        onAdvance={advanceLeft}
        isTextSlide={false}
        item={leftCount > 0 ? media.left[leftIndex] : undefined}
      />
      <CarouselButton
        side="right"
        work={work}
        onAdvance={advanceRight}
        isTextSlide={isRightTextSlide}
        item={rightCount > 0 ? media.right[rightIndex] : undefined}
      />

      {/* Viewport height >= 750px: the right carousel's text slide, pinned
          to the real browser viewport (NOT nested inside CarouselButton's
          own overflow-hidden box, which would clip a `position:fixed` child
          right back down to the shrinking carousel's size). Below 750px,
          CarouselButton renders its own carousel-relative fallback instead.
          Own button + onClick: it lives outside CarouselButton entirely, so
          without this it isn't clickable at all — the earlier bug where
          clicking the caption text didn't advance the photo. */}
      {isRightTextSlide && (
        <button
          type="button"
          onClick={advanceRight}
          aria-label="Next right image"
          className="fixed hidden cursor-pointer touch-manipulation flex-col [@media(min-height:750px)]:flex"
          // will-change: forces its own compositor layer — reported to fix a
          // Chrome-only bug (works fine in Safari) where this `position:
          // fixed` box scrolled along with the carousel's photos instead of
          // staying pinned to the real viewport, even though no ancestor
          // sets transform/filter/perspective/contain (the usual causes of
          // a fixed element picking up the wrong containing block).
          style={{
            bottom: px(35),
            right: px(48),
            width: growWith(CAPTION_FONT_SIZE, INFO_WIDTH),
            willChange: "transform",
          }}
        >
          <InfoAndCaption work={work} />
        </button>
      )}

      {/* Center gap between the two carousels: clicking anywhere in it
          advances BOTH carousels together, while each carousel's own button
          still advances only itself. Two separate buttons per height
          variant rather than one wrapping the title: an invisible one spans
          the full carousel height/width-gap for the empty space, and the
          title itself is ALSO its own button, kept at its exact original
          position/size (left-aligned, fixed box — see TitleBlock/
          bottomGapCss) — wrapping it in a flex container to "advance
          both" broke that (turned it into a full-width flex item, which
          read as center-aligned instead of the fixed-size, left-aligned box
          it should stay). Both buttons call the identical handler, so which
          one a click lands on doesn't matter. */}
      <button
        type="button"
        onClick={() => {
          advanceLeft();
          advanceRight();
        }}
        aria-label="Next image (both)"
        className="fixed hidden cursor-pointer touch-manipulation [@media(min-height:750px)]:block"
        style={{
          left: "var(--cap-w)",
          right: "var(--cap-w)",
          top: px(CAROUSEL_TOP_OFFSET),
          height: "var(--cap-h)",
        }}
      />
      {/* Viewport height >= 750px: bottom-anchored to the real browser
          viewport (position:fixed, bottom:35 — NOT the carousel box), same
          as the info/caption text slide above. */}
      <button
        type="button"
        onClick={() => {
          advanceLeft();
          advanceRight();
        }}
        aria-label="Next image (both)"
        className="fixed hidden cursor-pointer touch-manipulation flex-col text-left leading-[1.5] capitalize [@media(min-height:750px)]:flex"
        // will-change: same Chrome-only "scrolls with the photos instead of
        // staying pinned" fix as the info/caption box above.
        style={{
          left: `calc(var(--cap-w) + ${titleLeftMarginCss})`,
          bottom: px(35),
          fontSize: fontgrow(10),
          willChange: "transform",
        }}
      >
        <TitleBlock work={work} />
      </button>

      <button
        type="button"
        onClick={() => {
          advanceLeft();
          advanceRight();
        }}
        aria-label="Next image (both)"
        className="absolute cursor-pointer touch-manipulation [@media(min-height:750px)]:hidden"
        style={{
          left: "var(--cap-w)",
          right: "var(--cap-w)",
          top: px(CAROUSEL_TOP_OFFSET),
          height: "var(--cap-h)",
        }}
      />
      {/* Below 750px viewport height: bottom-anchored to the LEFT carousel's
          own bottom edge (grows upward as content lengthens, per spec —
          never drops below the carousel), at the same bottomGapCss as the
          info/caption box above so the two stay flush with each other. */}
      <button
        type="button"
        onClick={() => {
          advanceLeft();
          advanceRight();
        }}
        aria-label="Next image (both)"
        className="absolute cursor-pointer touch-manipulation [@media(min-height:750px)]:hidden"
        style={{
          left: `calc(var(--cap-w) + ${titleLeftMarginCss})`,
          top: px(CAROUSEL_TOP_OFFSET),
          height: "var(--cap-h)",
        }}
      >
        <div
          className="absolute flex flex-col text-left leading-[1.5] capitalize"
          style={{ left: 0, bottom: bottomGapCss, fontSize: fontgrow(10) }}
        >
          <TitleBlock work={work} />
        </div>
      </button>
    </div>
  );
}

// Reorders one work's left+right media into a single list for the unified
// MidCaption/MobileCaption carousel: all photos first, then any video/gif,
// then the drawing (if any) last — "사진 - 영상,gif(있다면) - 드로잉". Per the
// user, the LAST item of the `left` array (if it's an image, not a video) is
// always the drawing — the same "drawing files sort last within left"
// convention the original import already applied (see captionMedia.ts),
// reused here rather than re-detected some other way (there's no explicit
// "this is a drawing" flag in the data).
function buildCompactMediaOrder(media: { left: CaptionMediaItem[]; right: CaptionMediaItem[] }) {
  const isVideoOrGif = (item: CaptionMediaItem) =>
    item.type === "video" || item.src.toLowerCase().endsWith(".gif");

  const lastLeft = media.left.length > 0 ? media.left[media.left.length - 1] : null;
  const drawing = lastLeft && !isVideoOrGif(lastLeft) ? lastLeft : null;

  const rest = [...media.left, ...media.right].filter((item) => item !== drawing);
  const photos = rest.filter((item) => !isVideoOrGif(item));
  const videosAndGifs = rest.filter(isVideoOrGif);

  return drawing ? [...photos, ...videosAndGifs, drawing] : [...photos, ...videosAndGifs];
}

type CompactStageProps = {
  work: CaptionWork;
  orderedMedia: CaptionMediaItem[];
  index: number;
  advance: () => void;
};

// --- 700px < 폭 <= 1200px ("caption 1200", node 168:111 — designed against
// an 800px lower edge, moved down to 700px like the rest of the site's
// mobile toggle, see TopBar.tsx) ---
const MID_CAROUSEL = { x: 0, y: 67, w: 600, h: 799 };
const MID_TITLE_X = 35;
const MID_CAROUSEL_TO_TITLE_GAP = 24; // image bottom(67+799) -> title top(890)
const MID_TITLE_SUBTITLE_GAP = 17; // title bottom(890+15) -> subtitle top(922)
const MID_SUBTITLE_TO_INFO_GAP = 104; // subtitle bottom(922+65) -> info row top(1091)
const MID_INFO_COLUMN_WIDTH = 339; // info column left(36) -> caption column left(375)
const MID_CAPTION_KO_WIDTH = 297;
const MID_CAPTION_EN_WIDTH = 317;
const MID_CAPTION_KO_EN_GAP = 19; // ko bottom(1091+119) -> en top(1229)

function MidCaption({ work, orderedMedia, index, advance }: CompactStageProps) {
  const dimensionUnits = work.partsInfo.dimensions
    ? splitDimensionUnits(work.partsInfo.dimensions)
    : [];
  const exhibitionLines = work.exhibition
    ? Array.isArray(work.exhibition)
      ? work.exhibition
      : [work.exhibition]
    : ["TBD"];

  return (
    <div className="hidden min-[700px]:block">
      <div className="relative pb-16">
        <button
          type="button"
          onClick={advance}
          aria-label="Next image"
          className="relative block cursor-pointer touch-manipulation overflow-hidden bg-[#f8f8f8]"
          style={{
            marginLeft: px(MID_CAROUSEL.x),
            marginTop: px(MID_CAROUSEL.y),
            width: px(MID_CAROUSEL.w),
            height: px(MID_CAROUSEL.h),
          }}
        >
          {orderedMedia.length > 0 && <MediaFrame item={orderedMedia[index]} />}
        </button>

        <div
          className="break-keep text-[10px] leading-[1.5] capitalize"
          style={{ marginLeft: px(MID_TITLE_X), marginTop: px(MID_CAROUSEL_TO_TITLE_GAP) }}
        >
          <div style={{ width: px(TITLE_WIDTH) }}>
            {(work.workTitleLines ?? [work.title]).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div style={{ marginTop: px(MID_TITLE_SUBTITLE_GAP), width: px(SUBTITLE_WIDTH_NATIVE) }}>
            <p className={`${pretendard.className} whitespace-pre-line leading-[1.4]`}>{work.workSubtitleKo ?? "TBD"}</p>
            <p className="leading-[1.4]" style={{ marginTop: px(subtitleKoEnGap(work)) }}>
              {work.workSubtitleEn ?? "TBD"}
            </p>
          </div>
        </div>

        {/* Info (Parts/for/date) and ko/en captions sit side by side at the
            same top edge (not stacked) — the info column's width is fixed at
            MID_INFO_COLUMN_WIDTH so the caption column always starts at the
            same x regardless of how wide the info values render. */}
        <div
          className="flex"
          style={{ marginLeft: px(MID_TITLE_X), marginTop: px(MID_SUBTITLE_TO_INFO_GAP) }}
        >
          <div
            className="flex flex-col text-left text-black capitalize"
            style={{ width: px(MID_INFO_COLUMN_WIDTH), fontSize: px(10) }}
          >
            <div className="flex leading-[1.6]" style={{ marginBottom: px(13) }}>
              <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
                <p>Parts</p>
                <p>type</p>
                <p>size</p>
              </div>
              <div>
                <p>{work.partsInfo.name}</p>
                {work.partsInfo.type && <p>{work.partsInfo.type}</p>}
                {dimensionUnits.map((unit, i) => (
                  <p key={i}>{unit}</p>
                ))}
              </div>
            </div>
            <div className="flex leading-[1.5]" style={{ marginBottom: px(10) }}>
              <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
                for
              </div>
              <div>
                {exhibitionLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            <div className="flex leading-[1.5]">
              <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
                date
              </div>
              <div>{work.year ?? "TBD"}</div>
            </div>
          </div>

          <div className="flex flex-col" style={{ fontSize: px(11) }}>
            <div
              className={`${pretendard.className} break-keep leading-[1.7]`}
              style={{ width: px(MID_CAPTION_KO_WIDTH) }}
            >
              <CaptionLines lines={work.captionKo ?? ["TBD"]} />
            </div>
            <div
              className="break-keep leading-[1.6]"
              style={{ marginTop: px(MID_CAPTION_KO_EN_GAP), width: px(MID_CAPTION_EN_WIDTH) }}
            >
              <CaptionLines lines={work.captionEn ?? ["TBD"]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 폭 < 700px ("cation 800", node 168:72 — designed against an 800px
// upper edge, moved down to 700px like the rest of the site's mobile
// toggle, see TopBar.tsx) ---
// The image's 615px width is a cap, not a fixed size: at viewport widths
// >=615px it renders at exactly 615 (matching the design), and below 615px
// it shrinks fluidly with the viewport (aspect-ratio preserved) — per
// explicit request, EVERY other element on this stage (gaps, text box
// widths, font sizes) stays literally fixed-px regardless of viewport width.
const MOBILE_CAROUSEL_MAX_WIDTH = 615;
const MOBILE_CAROUSEL_ASPECT = "615 / 820";
const MOBILE_CAROUSEL_TOP = 67;
const MOBILE_TITLE_X = 35;
const MOBILE_CAROUSEL_TO_TITLE_GAP = 30; // image bottom(67+820) -> title top(917)
const MOBILE_TITLE_WIDTH = 145;
const MOBILE_TITLE_SUBTITLE_GAP = 24; // title bottom(917+30) -> subtitle top(971)
const MOBILE_SUBTITLE_TO_INFO_GAP = 96; // subtitle bottom(971+65) -> info row top(1132)
// Explicit request: unified with Desktop/Mid's own values (INFO_ROW_FONT_SIZE
// / PARTS_ROW_GAP / FOR_ROW_GAP / DATE_ROW_GAP / CAPTION_KO_EN_GAP above) —
// the "cation 800" mobile frame's own measurements (11/23/31/46/35) are no
// longer used here. CAPTION_FONT_SIZE was already unified earlier.
const MOBILE_INFO_ROW_FONT_SIZE = INFO_ROW_FONT_SIZE;
const MOBILE_PARTS_ROW_GAP = PARTS_ROW_GAP;
const MOBILE_FOR_ROW_GAP = FOR_ROW_GAP;
const MOBILE_DATE_TO_CAPTION_GAP = DATE_ROW_GAP;
const MOBILE_CAPTION_FONT_SIZE = CAPTION_FONT_SIZE;
const MOBILE_CAPTION_KO_WIDTH = 305;
const MOBILE_CAPTION_EN_WIDTH = 325;
const MOBILE_CAPTION_KO_EN_GAP = CAPTION_KO_EN_GAP;

function MobileCaption({ work, orderedMedia, index, advance }: CompactStageProps) {
  const dimensionUnits = work.partsInfo.dimensions
    ? splitDimensionUnits(work.partsInfo.dimensions)
    : [];
  const exhibitionLines = work.exhibition
    ? Array.isArray(work.exhibition)
      ? work.exhibition
      : [work.exhibition]
    : ["TBD"];

  return (
    <div className="block min-[700px]:hidden">
      <div className="relative pb-16">
        <button
          type="button"
          onClick={advance}
          aria-label="Next image"
          className="relative block cursor-pointer touch-manipulation overflow-hidden bg-[#f8f8f8]"
          style={{
            marginTop: px(MOBILE_CAROUSEL_TOP),
            width: `min(${px(MOBILE_CAROUSEL_MAX_WIDTH)}, 100%)`,
            aspectRatio: MOBILE_CAROUSEL_ASPECT,
          }}
        >
          {orderedMedia.length > 0 && <MediaFrame item={orderedMedia[index]} />}
        </button>

        <div
          className="break-keep text-[10px] leading-[1.5] capitalize"
          style={{ marginLeft: px(MOBILE_TITLE_X), marginTop: px(MOBILE_CAROUSEL_TO_TITLE_GAP) }}
        >
          <div style={{ width: px(MOBILE_TITLE_WIDTH) }}>
            {(work.workTitleLines ?? [work.title]).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div style={{ marginTop: px(MOBILE_TITLE_SUBTITLE_GAP), width: px(SUBTITLE_WIDTH_NATIVE) }}>
            <p className={`${pretendard.className} whitespace-pre-line leading-[1.4]`}>{work.workSubtitleKo ?? "TBD"}</p>
            <p className="leading-[1.4]" style={{ marginTop: px(subtitleKoEnGap(work)) }}>
              {work.workSubtitleEn ?? "TBD"}
            </p>
          </div>
        </div>

        {/* Info rows AND captions stacked in one column below them — unlike
            MidCaption, there's no side-by-side caption column here. */}
        <div
          className="flex flex-col text-left text-black capitalize"
          style={{
            marginLeft: px(MOBILE_TITLE_X),
            marginTop: px(MOBILE_SUBTITLE_TO_INFO_GAP),
            fontSize: px(MOBILE_INFO_ROW_FONT_SIZE),
          }}
        >
          <div className="flex leading-[1.6]" style={{ marginBottom: px(MOBILE_PARTS_ROW_GAP) }}>
            <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
              <p>Parts</p>
              <p>type</p>
              <p>size</p>
            </div>
            <div>
              <p>{work.partsInfo.name}</p>
              {work.partsInfo.type && <p>{work.partsInfo.type}</p>}
              {dimensionUnits.map((unit, i) => (
                <p key={i}>{unit}</p>
              ))}
            </div>
          </div>
          <div className="flex leading-[1.5]" style={{ marginBottom: px(MOBILE_FOR_ROW_GAP) }}>
            <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
              for
            </div>
            <div>
              {exhibitionLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
          <div className="flex leading-[1.5]" style={{ marginBottom: px(MOBILE_DATE_TO_CAPTION_GAP) }}>
            <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
              date
            </div>
            <div>{work.year ?? "TBD"}</div>
          </div>

          <div style={{ fontSize: px(MOBILE_CAPTION_FONT_SIZE) }} className="break-keep">
            <div
              className={`${pretendard.className} leading-[1.7]`}
              style={{ width: px(MOBILE_CAPTION_KO_WIDTH) }}
            >
              <CaptionLines lines={work.captionKo ?? ["TBD"]} />
            </div>
            <div
              className="leading-[1.6]"
              style={{ marginTop: px(MOBILE_CAPTION_KO_EN_GAP), width: px(MOBILE_CAPTION_EN_WIDTH) }}
            >
              <CaptionLines lines={work.captionEn ?? ["TBD"]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// <1200px: MidCaption (700-1200px) and MobileCaption (<700px) share one
// carousel index/advance handler (computed once here) since both render the
// SAME current slide, just laid out differently.
function CompactCaption({ work }: CaptionCarouselProps) {
  const media = CAPTION_MEDIA[work.slug] ?? { left: [], right: [] };
  const orderedMedia = buildCompactMediaOrder(media);
  const [index, setIndex] = useState(0);

  const advance = () => {
    if (orderedMedia.length === 0) return;
    setIndex((current) => (current + 1) % orderedMedia.length);
  };

  return (
    // "1200" here must match STAGE3_END_VW by hand (Tailwind needs a
    // literal string) — see DesktopCaption's matching comment.
    <div className="hidden h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] max-[1200px]:block">
      <MidCaption work={work} orderedMedia={orderedMedia} index={index} advance={advance} />
      <MobileCaption work={work} orderedMedia={orderedMedia} index={index} advance={advance} />
    </div>
  );
}

export default function CaptionCarousel({ work }: CaptionCarouselProps) {
  return (
    <>
      <DesktopCaption work={work} />
      <CompactCaption work={work} />
    </>
  );
}
