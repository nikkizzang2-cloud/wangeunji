"use client";

import Image from "next/image";
import localFont from "next/font/local";
import { useState } from "react";
import type { CaptionWork } from "@/data/works";
import { CAPTION_MEDIA, type CaptionMediaItem } from "@/data/captionMedia";
import { splitDimensionUnits } from "@/data/partsInfo";
import { px } from "@/lib/figma-layout";

// Figma "caption" pages — 5 reference frames spanning 4 responsive stages
// (get_design_context nodeId 72:1167 / 126:464 / 162:65 / 154:47 / 154:63).
// Complete overhaul of the old single `.figma-contain-scale` canvas: each
// stage below has its own shrink rules (different margins floor at
// different points, the carousel's own aspect ratio changes once then
// holds), which a single uniform 2D transform can't express — same
// reasoning as /info's move to `clamp()`-driven custom CSS.
//
// TOPBAR_HEIGHT: matches TopBar.tsx's `h-16`.
const TOPBAR_HEIGHT = 64;
// Carousel top position across ALL of stages 1-3 — fixed, deliberately NOT
// a function of viewport height. An earlier revision instead vertically
// centered the pair within the space below the header (`100vh`-driven),
// and later added a `min()` safety clamp shrinking the box when height was
// short — both reverted per explicit user feedback: resizing the BROWSER
// WINDOW's height shouldn't move or resize the carousel at all — width
// changes drive width-based shrinking (the whole point of stages 1-3), but
// height is plain crop-via-`overflow-hidden`, the same way a normal
// non-scrolling page would behave, not an active reflow. 69 matches node
// 72:1167's own native y (64 + 5).
const CAROUSEL_TOP_OFFSET = TOPBAR_HEIGHT + 5;

// Three breakpoint anchors, read directly off the reference frames' own
// widths (each frame is named after its width): "caption 1920" (actual
// width 1885, not literally 1920 — the user's rounded verbal number),
// "caption 1512", "caption 1200". Below 1200, stage 4 takes over (single
// carousel, see STAGE4_* below) — this REPLACES the old 800px mobile
// breakpoint for this page specifically (the old separate <800
// `MobileCaption` is gone; stage 4 now covers the whole <1200 range).
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
const TITLE_BOTTOM_GAP_NATIVE = 30; // title box bottom -> its own carousel's bottom edge
const TITLE_BOTTOM_GAP_FLOOR = 4;
const CAPTION_RIGHT_MARGIN_NATIVE = 85; // explicit user number (Figma's own right-side box measures ~74, close but not exact)
const CAPTION_RIGHT_MARGIN_FLOOR = 50;
const CAPTION_BOTTOM_GAP_NATIVE = 55; // caption text block bottom -> its own carousel's bottom edge
const CAPTION_BOTTOM_GAP_FLOOR = 12;

// Title/subtitle block: the "작업제목"/"제목설명" pair. Width and the gap
// between them stay constant across every stage (151px / 21px, confirmed
// at all three reference frames) — only the subtitle's width additionally
// narrows during stage 3 once the shrinking carousels leave less than
// TITLE_RIGHT_CLEARANCE_FLOOR of room (see titleSubtitleWidthCss below).
const TITLE_WIDTH = 151;
const TITLE_SUBTITLE_GAP = 21;
const SUBTITLE_WIDTH_NATIVE = 173;
const TITLE_RIGHT_CLEARANCE_FLOOR = 22; // subtitle's right edge -> right carousel's left edge, stage 3 only

const INFO_LABEL_WIDTH = 91;
const INFO_GAP = 24; // Figma's own per-instance gaps are inconsistent (23/31/55px) — one uniform gap instead, same fix as the old implementation already used
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
const titleBottomGapCss = linearClamp(
  TITLE_BOTTOM_GAP_FLOOR,
  TITLE_BOTTOM_GAP_NATIVE,
  STAGE2_END_VW,
  STAGE1_MIN_VW,
);
const captionRightMarginCss = linearClamp(
  CAPTION_RIGHT_MARGIN_FLOOR,
  CAPTION_RIGHT_MARGIN_NATIVE,
  STAGE2_END_VW,
  STAGE1_MIN_VW,
);
const captionBottomGapCss = linearClamp(
  CAPTION_BOTTOM_GAP_FLOOR,
  CAPTION_BOTTOM_GAP_NATIVE,
  STAGE2_END_VW,
  STAGE1_MIN_VW,
);
// Subtitle width: stays at its native 173px until the shrinking carousels
// leave less than TITLE_RIGHT_CLEARANCE_FLOOR of room on its right, then
// narrows just enough to keep that clearance — same "derived margin falls
// out of other clamped values" trick as /info's row-mode right margin.
// `var(--cap-w)` is the SAME carousel width driving both carousels, set
// once on a shared ancestor (see DesktopCaption below).
const titleSubtitleWidthCss = `min(${px(SUBTITLE_WIDTH_NATIVE)}, calc(100vw - 2 * var(--cap-w) - ${px(
  TITLE_LEFT_FLOOR + TITLE_RIGHT_CLEARANCE_FLOOR,
)}))`;

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

type InfoAndCaptionProps = {
  work: CaptionWork;
  labelWidth: number;
  gap: string | number;
  fontSize: number;
  // TODO(work-01 트라이얼): get_metadata(nodeId 168:56, "caption.textframe"
  // 우측 박스)에서 뽑은 실측 폰트 크기/행간/그룹 간 간격을 그대로 재현한다.
  // 확인되면 다른 work에도 적용할지 결정 — 그전까지 나머지는 기존
  // fontSize/gap prop(11px, 균일 gap)을 그대로 쓴다.
  trialSpacing?: boolean;
};

// TRIAL_* below are all from get_metadata(168:56)'s raw x/y — e.g. "for"
// label top(307) - Parts row bottom(246+48=294) = 13.
const TRIAL_ROW_FONT_SIZE = 10;
const TRIAL_PARTS_ROW_GAP = 13; // Parts/type/size row -> for row
const TRIAL_FOR_ROW_GAP = 10; // for row -> date row
const TRIAL_DATE_ROW_GAP = 44; // date row -> ko/en caption block
const TRIAL_CAPTION_FONT_SIZE = 11;
const TRIAL_KO_EN_GAP = 19; // Korean caption bottom(391+119) -> English caption top(529)

// Shared right-carousel "text slide" content (정보1/2/3 + 한글/영문캡션) — one
// definition so desktop's three stages and stage 4's static layout can't
// drift apart. `gap`/`fontSize` differ per caller (stage 4 uses a plain
// number, desktop stages use the same INFO_GAP/11px throughout) unless
// `trialSpacing` overrides both with the work-01 trial's real numbers.
function InfoAndCaption({ work, labelWidth, gap, fontSize, trialSpacing = false }: InfoAndCaptionProps) {
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

  const rowFontSize = trialSpacing ? TRIAL_ROW_FONT_SIZE : 11;
  const captionFontSize = trialSpacing ? TRIAL_CAPTION_FONT_SIZE : fontSize;

  return (
    <div
      className="flex flex-col text-left text-black capitalize"
      style={{
        fontSize: px(rowFontSize),
        gap: trialSpacing ? undefined : typeof gap === "number" ? px(gap) : gap,
      }}
    >
      <div
        className={`flex ${trialSpacing ? "leading-[1.6]" : "leading-[1.5]"}`}
        style={trialSpacing ? { marginBottom: px(TRIAL_PARTS_ROW_GAP) } : undefined}
      >
        <div className="shrink-0 whitespace-nowrap" style={{ width: px(labelWidth) }}>
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

      <div
        className="flex leading-[1.5]"
        style={trialSpacing ? { marginBottom: px(TRIAL_FOR_ROW_GAP) } : undefined}
      >
        <div className="shrink-0 whitespace-nowrap" style={{ width: px(labelWidth) }}>
          for
        </div>
        <div>
          {exhibitionLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <div
        className="flex leading-[1.5]"
        style={trialSpacing ? { marginBottom: px(TRIAL_DATE_ROW_GAP) } : undefined}
      >
        <div className="shrink-0 whitespace-nowrap" style={{ width: px(labelWidth) }}>
          date
        </div>
        <div>{work.year ?? "TBD"}</div>
      </div>

      {/* TODO(work-01 트라이얼): break-keep(word-break:keep-all) — 단어(국문은
          어절) 경계에서만 줄바꿈, 단어 중간에서 깨지지 않도록. leading은 국문
          1.7 / 영문 1.6로 따로 간다(사용자 요청). 다른 work는 trialSpacing이
          false라 영향받지 않는다. */}
      <div style={{ fontSize: px(captionFontSize) }} className={trialSpacing ? "" : "leading-[1.5]"}>
        <div
          className={`${pretendard.className} ${trialSpacing ? "break-keep leading-[1.7]" : ""}`}
        >
          {(work.captionKo ?? ["TBD"]).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        <div
          className={trialSpacing ? "break-keep leading-[1.6]" : "mt-3"}
          style={trialSpacing ? { marginTop: px(TRIAL_KO_EN_GAP) } : undefined}
        >
          {(work.captionEn ?? ["TBD"]).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// TODO(work-01 트라이얼): get_metadata(168:57, "caption.textframe" 좌측
// 박스)에서 뽑은 실측 제목-설명 간격/설명 박스 너비. 확인되면 다른 work에도
// 적용할지 결정 — 그전까지 나머지는 기존 TITLE_SUBTITLE_GAP/
// titleSubtitleWidthCss를 그대로 쓴다 (subtitleGap/subtitleWidth 미전달 시
// 디폴트로 폴백).
const TRIAL_TITLE_SUBTITLE_GAP = 17; // subtitle top(612) - title bottom(580+15) = 17
const TRIAL_SUBTITLE_WIDTH = 218;

function TitleBlock({
  work,
  subtitleGap = TITLE_SUBTITLE_GAP,
  subtitleWidth = titleSubtitleWidthCss,
}: {
  work: CaptionWork;
  subtitleGap?: number;
  subtitleWidth?: string | number;
}) {
  return (
    <>
      <div style={{ width: px(TITLE_WIDTH) }}>
        {(work.workTitleLines ?? [work.title]).map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <div
        className={`${pretendard.className} leading-[1.4]`}
        style={{
          marginTop: px(subtitleGap),
          width: typeof subtitleWidth === "number" ? px(subtitleWidth) : subtitleWidth,
        }}
      >
        {work.workSubtitle ?? "TBD"}
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
  // TODO(work-01 트라이얼): 확인되면 모든 work로 일반화하고 이 prop과
  // captionRightMarginCss/captionBottomGapCss 분기를 정리할 예정.
  useFixedTextMargins?: boolean;
};

// One position for all of stages 1-3 (CAROUSEL_TOP_OFFSET, fixed — see its
// own comment for why); only `--cap-w`/`--cap-h` (set on the ancestor,
// width-driven) differ between stages.
function CarouselButton({
  side,
  work,
  onAdvance,
  isTextSlide,
  item,
  useFixedTextMargins = false,
}: CarouselButtonProps) {
  return (
    <button
      type="button"
      onClick={onAdvance}
      aria-label={side === "left" ? "Previous left image" : "Next right image"}
      className="absolute overflow-hidden bg-[#f8f8f8]"
      style={{
        [side]: 0,
        top: px(CAROUSEL_TOP_OFFSET),
        width: "var(--cap-w)",
        height: "var(--cap-h)",
      }}
    >
      {!isTextSlide && item && <MediaFrame item={item} />}
      {/* useFixedTextMargins (work-01 trial): above 750px viewport height,
          the text lives OUTSIDE this overflow-hidden button (see
          DesktopCaption's own `position:fixed` sibling) — this button's own
          overflow-hidden box would otherwise clip a fixed-position child to
          the shrinking carousel's box, defeating the point of pinning it to
          the viewport. Below 750px, this is the fallback: the original
          carousel-relative responsive margins, cropping accepted. */}
      {isTextSlide && useFixedTextMargins && (
        <div
          className="absolute flex flex-col [@media(min-height:750px)]:hidden"
          style={{ right: captionRightMarginCss, bottom: captionBottomGapCss, width: px(INFO_WIDTH) }}
        >
          <InfoAndCaption
            work={work}
            labelWidth={INFO_LABEL_WIDTH}
            gap={INFO_GAP}
            fontSize={12}
            trialSpacing
          />
        </div>
      )}
      {isTextSlide && !useFixedTextMargins && (
        <div
          className="absolute flex flex-col"
          style={{ right: captionRightMarginCss, bottom: captionBottomGapCss, width: px(INFO_WIDTH) }}
        >
          <InfoAndCaption work={work} labelWidth={INFO_LABEL_WIDTH} gap={INFO_GAP} fontSize={12} />
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

  // TODO(트라이얼, work-01 한정): 이 구간(양쪽 캐러셀이 같이 보이는 >=1200px
  // 전체)에서:
  // 1. 사진 캐러셀: 세로 스크롤을 허용해서(overflow-y-auto) 캐러셀 높이가
  //    뷰포트보다 클 때 사진이 잘리지 않게 한다 — 상단바는 `fixed`라 이
  //    컨테이너의 스크롤과 무관하게 계속 떠 있는다.
  // 2. 텍스트(정보/캡션, 제목/설명): 뷰포트 높이 >= 750px에서는 캐러셀 박스가
  //    아니라 실제 브라우저 뷰포트 기준(bottom:35, 정보/캡션은 우측 48px
  //    추가)으로 고정 위치시켜 화면이 줄어도 잘리지 않게 하고, 750px 밑으로는
  //    기존 캐러셀 상대 반응형 마진으로 되돌아가 잘림을 허용한다.
  // 3. 텍스트 프레임 내부 폰트 크기/행간/그룹 간 간격은 get_metadata(168:56,
  //    168:57)의 실측치를 그대로 쓴다.
  // 확인되면 모든 work로 일반화하고 이 분기들을 정리할 예정.
  const isTrial = work.slug === "work-01";

  return (
    // "1200" here must match STAGE3_END_VW by hand (Tailwind needs a
    // literal string) — paired with Stage4Caption's `max-[1200px]` below on
    // the SAME value so there's no 1px gap at exactly 1200 (max-[Npx]
    // compiles to strictly <N, so same-N pairing is what makes the two
    // ranges meet exactly — same fix as /info's breakpoint pairing bug).
    <div
      className={`relative hidden h-screen bg-[#f8f8f8] min-[1200px]:block ${
        isTrial ? "overflow-y-auto" : "overflow-hidden"
      }`}
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
        useFixedTextMargins={isTrial}
      />
      <CarouselButton
        side="right"
        work={work}
        onAdvance={advanceRight}
        isTextSlide={isRightTextSlide}
        item={rightCount > 0 ? media.right[rightIndex] : undefined}
        useFixedTextMargins={isTrial}
      />

      {/* work-01 trial, viewport height >= 750px: the right carousel's text
          slide, pinned to the real browser viewport (NOT nested inside
          CarouselButton's own overflow-hidden box, which would clip a
          `position:fixed` child right back down to the shrinking carousel's
          size — see CarouselButton's own comment). Below 750px height,
          CarouselButton renders its own carousel-relative fallback instead. */}
      {isTrial && isRightTextSlide && (
        <div
          className="fixed hidden flex-col [@media(min-height:750px)]:flex"
          style={{ bottom: px(35), right: px(48), width: px(INFO_WIDTH) }}
        >
          <InfoAndCaption
            work={work}
            labelWidth={INFO_LABEL_WIDTH}
            gap={INFO_GAP}
            fontSize={12}
            trialSpacing
          />
        </div>
      )}

      {/* Title/subtitle: bottom-anchored to the LEFT carousel's own bottom
          edge (grows upward as content lengthens, per spec — never drops
          below the carousel). This wrapper matches the carousel's own box
          exactly (same top + height), so the inner block's `bottom: X`
          resolves against `var(--cap-h)` — a plain CSS length, not the
          viewport — meaning it tracks the carousel's height (width-driven,
          correct) without also reacting to the viewport's OWN height (not
          correct — reverted per explicit feedback, see CAROUSEL_TOP_OFFSET's
          comment). work-01 trial overrides this below: same viewport-pin
          concept as the info/caption block above, left position unchanged. */}
      {isTrial ? (
        <>
          <div
            className="fixed hidden flex-col text-[10px] leading-[1.5] capitalize [@media(min-height:750px)]:flex"
            style={{ left: `calc(var(--cap-w) + ${titleLeftMarginCss})`, bottom: px(35) }}
          >
            <TitleBlock
              work={work}
              subtitleGap={TRIAL_TITLE_SUBTITLE_GAP}
              subtitleWidth={TRIAL_SUBTITLE_WIDTH}
            />
          </div>
          <div
            className="absolute [@media(min-height:750px)]:hidden"
            style={{
              left: `calc(var(--cap-w) + ${titleLeftMarginCss})`,
              top: px(CAROUSEL_TOP_OFFSET),
              height: "var(--cap-h)",
            }}
          >
            <div
              className="absolute flex flex-col text-[10px] leading-[1.5] capitalize"
              style={{ left: 0, bottom: titleBottomGapCss }}
            >
              <TitleBlock
                work={work}
                subtitleGap={TRIAL_TITLE_SUBTITLE_GAP}
                subtitleWidth={TRIAL_SUBTITLE_WIDTH}
              />
            </div>
          </div>
        </>
      ) : (
        <div
          className="absolute"
          style={{
            left: `calc(var(--cap-w) + ${titleLeftMarginCss})`,
            top: px(CAROUSEL_TOP_OFFSET),
            height: "var(--cap-h)",
          }}
        >
          <div
            className="absolute flex flex-col text-[12px] leading-[1.5] capitalize"
            style={{ left: 0, bottom: titleBottomGapCss }}
          >
            <TitleBlock work={work} />
          </div>
        </div>
      )}
    </div>
  );
}

// Stage 4 (viewport < 1200px, node 154:63 "caption 1121"): single carousel,
// title/info/caption stacked below it — same concept as the site's other
// pages' mobile treatment ("모바일에서 작업한 것처럼"), but with this frame's
// own numbers (NOT the old <800px MobileCaption's — that component and its
// separate breakpoint are retired; this stage now covers the whole <1200
// range). Purely fixed-px, no scaling of any kind ("화면이 줄어든다고 요소들의
// 크기가 바뀌지않아") — normal document flow handles the page's height
// (which genuinely varies with caption length), so no zoom/canvas
// mechanism is needed here at all, simpler than the old MobileCaption.
const STAGE4_CAROUSEL = { x: 0, y: 67, w: 645, h: 859 };
const STAGE4_TITLE_X = 35;
const STAGE4_CAROUSEL_TO_TITLE_GAP = 32; // carousel bottom -> title top
const STAGE4_SUBTITLE_WIDTH = 170;
const STAGE4_SUBTITLE_TO_INFO_GAP = 119;
const STAGE4_INFO_VALUE_WIDTH = 170; // Group257's own width (261) minus INFO_LABEL_WIDTH (91)
const STAGE4_CAPTION_GAP = 84; // info column's right edge -> caption column's left edge
const STAGE4_CAPTION_KO_WIDTH = 305;
const STAGE4_CAPTION_EN_WIDTH = 325;
const STAGE4_CAPTION_KO_EN_GAP = 35;

// Reorders one work's left+right media into a single list for the unified
// stage-4 carousel: all photos first, then any video/gif, then the drawing
// (if any) last — "사진 - 영상,gif(있다면) - 드로잉". Per the user, the LAST
// item of the `left` array (if it's an image, not a video) is always the
// drawing — the same "drawing files sort last within left" convention the
// original import already applied (see captionMedia.ts), reused here
// rather than re-detected some other way (there's no explicit "this is a
// drawing" flag in the data).
function buildStage4MediaOrder(media: { left: CaptionMediaItem[]; right: CaptionMediaItem[] }) {
  const isVideoOrGif = (item: CaptionMediaItem) =>
    item.type === "video" || item.src.toLowerCase().endsWith(".gif");

  const lastLeft = media.left.length > 0 ? media.left[media.left.length - 1] : null;
  const drawing = lastLeft && !isVideoOrGif(lastLeft) ? lastLeft : null;

  const rest = [...media.left, ...media.right].filter((item) => item !== drawing);
  const photos = rest.filter((item) => !isVideoOrGif(item));
  const videosAndGifs = rest.filter(isVideoOrGif);

  return drawing ? [...photos, ...videosAndGifs, drawing] : [...photos, ...videosAndGifs];
}

type Stage4TrialProps = {
  work: CaptionWork;
  orderedMedia: CaptionMediaItem[];
  index: number;
  advance: () => void;
};

// TODO(work-01 트라이얼): <1200px 구간을 800px에서 한 번 더 나눈다 —
// get_metadata(168:111, "caption 1200")가 이 상단(800px<폭<=1200px) 값,
// get_metadata(168:72, "cation 800")가 하단(폭<800px) 값. 확인되면 다른
// work에도 적용할지 결정 — 그전까지 나머지 16개 work는 기존 단일 Stage4
// 그대로 쓴다. 800 기준은 TopBar의 기존 MOBILE_BREAKPOINT=800과 동일한
// min-[800px] 페어링 관례를 따른다(800 자체는 상단 쪽).

// --- 800px < 폭 <= 1200px ("caption 1200", node 168:111) ---
const TRIAL_UPPER_CAROUSEL = { x: 0, y: 67, w: 600, h: 799 };
const TRIAL_UPPER_TITLE_X = 35;
const TRIAL_UPPER_CAROUSEL_TO_TITLE_GAP = 24; // image bottom(67+799) -> title top(890)
const TRIAL_UPPER_TITLE_SUBTITLE_GAP = 17; // title bottom(890+15) -> subtitle top(922)
const TRIAL_UPPER_SUBTITLE_WIDTH = 218;
const TRIAL_UPPER_SUBTITLE_TO_INFO_GAP = 104; // subtitle bottom(922+65) -> info row top(1091)
const TRIAL_UPPER_INFO_COLUMN_WIDTH = 339; // info column left(36) -> caption column left(375)
const TRIAL_UPPER_CAPTION_KO_WIDTH = 297;
const TRIAL_UPPER_CAPTION_EN_WIDTH = 317;
const TRIAL_UPPER_CAPTION_KO_EN_GAP = 19; // ko bottom(1091+119) -> en top(1229)

function Stage4CaptionTrialUpper({ work, orderedMedia, index, advance }: Stage4TrialProps) {
  const dimensionUnits = work.partsInfo.dimensions
    ? splitDimensionUnits(work.partsInfo.dimensions)
    : [];
  const exhibitionLines = work.exhibition
    ? Array.isArray(work.exhibition)
      ? work.exhibition
      : [work.exhibition]
    : ["TBD"];

  return (
    <div className="hidden min-[800px]:block">
      <div className="relative pb-16">
        <button
          type="button"
          onClick={advance}
          aria-label="Next image"
          className="relative block overflow-hidden bg-[#f8f8f8]"
          style={{
            marginLeft: px(TRIAL_UPPER_CAROUSEL.x),
            marginTop: px(TRIAL_UPPER_CAROUSEL.y),
            width: px(TRIAL_UPPER_CAROUSEL.w),
            height: px(TRIAL_UPPER_CAROUSEL.h),
          }}
        >
          {orderedMedia.length > 0 && <MediaFrame item={orderedMedia[index]} />}
        </button>

        <div
          className="text-[10px] leading-[1.5] capitalize"
          style={{ marginLeft: px(TRIAL_UPPER_TITLE_X), marginTop: px(TRIAL_UPPER_CAROUSEL_TO_TITLE_GAP) }}
        >
          <div style={{ width: px(TITLE_WIDTH) }}>
            {(work.workTitleLines ?? [work.title]).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div
            className={`${pretendard.className} leading-[1.4]`}
            style={{ marginTop: px(TRIAL_UPPER_TITLE_SUBTITLE_GAP), width: px(TRIAL_UPPER_SUBTITLE_WIDTH) }}
          >
            {work.workSubtitle ?? "TBD"}
          </div>
        </div>

        {/* Info (Parts/for/date) and ko/en captions sit side by side at the
            same top edge (not stacked) — the info column's width is fixed at
            TRIAL_UPPER_INFO_COLUMN_WIDTH so the caption column always starts
            at the same x regardless of how wide the info values render. */}
        <div
          className="flex"
          style={{ marginLeft: px(TRIAL_UPPER_TITLE_X), marginTop: px(TRIAL_UPPER_SUBTITLE_TO_INFO_GAP) }}
        >
          <div
            className="flex flex-col text-left text-black capitalize"
            style={{ width: px(TRIAL_UPPER_INFO_COLUMN_WIDTH), fontSize: px(10) }}
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
              style={{ width: px(TRIAL_UPPER_CAPTION_KO_WIDTH) }}
            >
              {(work.captionKo ?? ["TBD"]).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div
              className="break-keep leading-[1.6]"
              style={{ marginTop: px(TRIAL_UPPER_CAPTION_KO_EN_GAP), width: px(TRIAL_UPPER_CAPTION_EN_WIDTH) }}
            >
              {(work.captionEn ?? ["TBD"]).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 폭 < 800px ("cation 800", node 168:72) ---
// The image's 615px width is a cap, not a fixed size: at viewport widths
// >=615px it renders at exactly 615 (matching the design), and below 615px
// it shrinks fluidly with the viewport (aspect-ratio preserved) — per
// explicit request, EVERY other element on this stage (gaps, text box
// widths, font sizes) stays literally fixed-px regardless of viewport width.
const TRIAL_LOWER_CAROUSEL_MAX_WIDTH = 615;
const TRIAL_LOWER_CAROUSEL_ASPECT = "615 / 820";
const TRIAL_LOWER_CAROUSEL_TOP = 67;
const TRIAL_LOWER_TITLE_X = 35;
const TRIAL_LOWER_CAROUSEL_TO_TITLE_GAP = 30; // image bottom(67+820) -> title top(917)
const TRIAL_LOWER_TITLE_WIDTH = 145;
const TRIAL_LOWER_TITLE_SUBTITLE_GAP = 24; // title bottom(917+30) -> subtitle top(971)
const TRIAL_LOWER_SUBTITLE_WIDTH = 209;
const TRIAL_LOWER_SUBTITLE_TO_INFO_GAP = 96; // subtitle bottom(971+65) -> info row top(1132)
const TRIAL_LOWER_INFO_ROW_FONT_SIZE = 11;
const TRIAL_LOWER_PARTS_ROW_GAP = 23; // Parts row bottom(1132+51) -> for row top(1206)
const TRIAL_LOWER_FOR_ROW_GAP = 31; // for row bottom(1206+17) -> date row top(1254)
const TRIAL_LOWER_DATE_TO_CAPTION_GAP = 46; // date row bottom(1254+17) -> caption group top(1317)
const TRIAL_LOWER_CAPTION_FONT_SIZE = 12;
const TRIAL_LOWER_CAPTION_KO_WIDTH = 305;
const TRIAL_LOWER_CAPTION_EN_WIDTH = 325;
const TRIAL_LOWER_CAPTION_KO_EN_GAP = 35; // ko bottom(1317+126) -> en top(1478)

function Stage4CaptionTrialLower({ work, orderedMedia, index, advance }: Stage4TrialProps) {
  const dimensionUnits = work.partsInfo.dimensions
    ? splitDimensionUnits(work.partsInfo.dimensions)
    : [];
  const exhibitionLines = work.exhibition
    ? Array.isArray(work.exhibition)
      ? work.exhibition
      : [work.exhibition]
    : ["TBD"];

  return (
    <div className="block min-[800px]:hidden">
      <div className="relative pb-16">
        <button
          type="button"
          onClick={advance}
          aria-label="Next image"
          className="relative block overflow-hidden bg-[#f8f8f8]"
          style={{
            marginTop: px(TRIAL_LOWER_CAROUSEL_TOP),
            width: `min(${px(TRIAL_LOWER_CAROUSEL_MAX_WIDTH)}, 100%)`,
            aspectRatio: TRIAL_LOWER_CAROUSEL_ASPECT,
          }}
        >
          {orderedMedia.length > 0 && <MediaFrame item={orderedMedia[index]} />}
        </button>

        <div
          className="text-[10px] leading-[1.5] capitalize"
          style={{ marginLeft: px(TRIAL_LOWER_TITLE_X), marginTop: px(TRIAL_LOWER_CAROUSEL_TO_TITLE_GAP) }}
        >
          <div style={{ width: px(TRIAL_LOWER_TITLE_WIDTH) }}>
            {(work.workTitleLines ?? [work.title]).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div
            className={`${pretendard.className} leading-[1.4]`}
            style={{ marginTop: px(TRIAL_LOWER_TITLE_SUBTITLE_GAP), width: px(TRIAL_LOWER_SUBTITLE_WIDTH) }}
          >
            {work.workSubtitle ?? "TBD"}
          </div>
        </div>

        {/* Info rows AND captions stacked in one column below them — unlike
            the upper stage, there's no side-by-side caption column here. */}
        <div
          className="flex flex-col text-left text-black capitalize"
          style={{
            marginLeft: px(TRIAL_LOWER_TITLE_X),
            marginTop: px(TRIAL_LOWER_SUBTITLE_TO_INFO_GAP),
            fontSize: px(TRIAL_LOWER_INFO_ROW_FONT_SIZE),
          }}
        >
          <div className="flex leading-[1.5]" style={{ marginBottom: px(TRIAL_LOWER_PARTS_ROW_GAP) }}>
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
          <div className="flex leading-[1.5]" style={{ marginBottom: px(TRIAL_LOWER_FOR_ROW_GAP) }}>
            <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
              for
            </div>
            <div>
              {exhibitionLines.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
          <div className="flex leading-[1.5]" style={{ marginBottom: px(TRIAL_LOWER_DATE_TO_CAPTION_GAP) }}>
            <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
              date
            </div>
            <div>{work.year ?? "TBD"}</div>
          </div>

          <div style={{ fontSize: px(TRIAL_LOWER_CAPTION_FONT_SIZE) }} className="break-keep">
            <div
              className={`${pretendard.className} leading-[1.7]`}
              style={{ width: px(TRIAL_LOWER_CAPTION_KO_WIDTH) }}
            >
              {(work.captionKo ?? ["TBD"]).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div
              className="leading-[1.6]"
              style={{ marginTop: px(TRIAL_LOWER_CAPTION_KO_EN_GAP), width: px(TRIAL_LOWER_CAPTION_EN_WIDTH) }}
            >
              {(work.captionEn ?? ["TBD"]).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stage4Caption({ work }: CaptionCarouselProps) {
  const media = CAPTION_MEDIA[work.slug] ?? { left: [], right: [] };
  const orderedMedia = buildStage4MediaOrder(media);
  const [index, setIndex] = useState(0);

  const advance = () => {
    if (orderedMedia.length === 0) return;
    setIndex((current) => (current + 1) % orderedMedia.length);
  };

  const isTrial = work.slug === "work-01";

  return (
    // "1200" here must match STAGE3_END_VW by hand (Tailwind needs a
    // literal string) — see DesktopCaption's matching comment.
    <div className="hidden h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] max-[1200px]:block">
      {isTrial ? (
        <>
          <Stage4CaptionTrialUpper work={work} orderedMedia={orderedMedia} index={index} advance={advance} />
          <Stage4CaptionTrialLower work={work} orderedMedia={orderedMedia} index={index} advance={advance} />
        </>
      ) : (
        <div className="relative pb-16">
          <button
            type="button"
            onClick={advance}
            aria-label="Next image"
            className="relative block overflow-hidden bg-[#f8f8f8]"
            style={{
              marginLeft: px(STAGE4_CAROUSEL.x),
              marginTop: px(STAGE4_CAROUSEL.y),
              width: px(STAGE4_CAROUSEL.w),
              height: px(STAGE4_CAROUSEL.h),
            }}
          >
            {orderedMedia.length > 0 && <MediaFrame item={orderedMedia[index]} />}
          </button>

          <div
            className="text-[12px] leading-[1.5] capitalize"
            style={{ marginLeft: px(STAGE4_TITLE_X), marginTop: px(STAGE4_CAROUSEL_TO_TITLE_GAP) }}
          >
            <div style={{ width: px(TITLE_WIDTH) }}>
              {(work.workTitleLines ?? [work.title]).map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div
              className={`${pretendard.className} leading-[1.4]`}
              style={{ marginTop: px(TITLE_SUBTITLE_GAP), width: px(STAGE4_SUBTITLE_WIDTH) }}
            >
              {work.workSubtitle ?? "TBD"}
            </div>
          </div>

          <div
            className="flex"
            style={{ marginLeft: px(STAGE4_TITLE_X), marginTop: px(STAGE4_SUBTITLE_TO_INFO_GAP) }}
          >
            <div style={{ width: px(INFO_LABEL_WIDTH + STAGE4_INFO_VALUE_WIDTH) }}>
              <InfoAndCaption work={work} labelWidth={INFO_LABEL_WIDTH} gap={INFO_GAP} fontSize={12} />
            </div>

            <div className="flex flex-col text-[12px] leading-[1.5]" style={{ marginLeft: px(STAGE4_CAPTION_GAP) }}>
              <div className={pretendard.className} style={{ width: px(STAGE4_CAPTION_KO_WIDTH) }}>
                {(work.captionKo ?? ["TBD"]).map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              <div style={{ marginTop: px(STAGE4_CAPTION_KO_EN_GAP), width: px(STAGE4_CAPTION_EN_WIDTH) }}>
                {(work.captionEn ?? ["TBD"]).map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaptionCarousel({ work }: CaptionCarouselProps) {
  return (
    <>
      <DesktopCaption work={work} />
      <Stage4Caption work={work} />
    </>
  );
}
