"use client";

import Image from "next/image";
import localFont from "next/font/local";
import { useState } from "react";
import type { CaptionWork } from "@/data/works";
import { CAPTION_MEDIA, type CaptionMediaItem } from "@/data/captionMedia";
import { splitDimensionUnits } from "@/data/partsInfo";
import { px } from "@/lib/figma-layout";
import { useContainScale } from "@/lib/useContainScale";

// Figma "caption" / "caption.textframe" frames (get_metadata nodeId 72:1167 /
// 72:1145 — two states of the same page: with vs without the right
// carousel's image, i.e. what shows once the right side has cycled through
// all its photos). width=1920, height=1080, includes the header region like
// /intro. Raw Figma y-coordinates are used as-is below — no TOPBAR_HEIGHT
// subtraction/pt-16 reservation (see PartsGallery.tsx / TopBar.tsx for why).
// Scaled via `useContainScale` (not the `.figma-canvas-*` classes' width-only
// `cqw`), since this is a no-scroll page: see that hook's doc comment for why
// width-only scaling clips the bottom on a viewport wider than 16:9.
const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const LEFT_BOX = { x: 0, y: 69, w: 795, h: 1011 };
const RIGHT_BOX = { x: 1125, y: 69, w: 795, h: 1011 };

// Center title block ("Group 248"). "작업제목" gets an enforced 181px max
// width (explicit user spec — Figma's own instance is narrower for this one
// title, so it isn't a reliable max on its own); "제목설명" width(218) and
// the gap between the two (49px, derived from the Figma instance) aren't
// user-specified, so those are carried over from the reference as-is.
const TITLE_X = 815;
const TITLE_Y = 836;
const TITLE_MAX_WIDTH = 181;
const SUBTITLE_WIDTH = 218;
const TITLE_GROUP_GAP = 49;

// Right-carousel text layer (visible once its image stack is exhausted —
// Group 249 + 정보1/2/3). Figma's own per-instance gaps between these four
// groups are inconsistent (23px/31px/55px) since they're just eyeballed
// absolute positions for one example string length; the user explicitly
// asked for one uniform gap that holds even as e.g. 정보2's text grows, so
// this is a flex column with a single fixed gap instead of copying those
// numbers. The label column width (91px) IS a faithful Figma value — it's
// how far label text sits from its value column (x=1513 -> x=1604).
const INFO_RIGHT_MARGIN = 78;
const INFO_BOTTOM_MARGIN = 55;
const INFO_WIDTH = 795 - (1513 - 1125) - INFO_RIGHT_MARGIN; // = 329, matches Figma's observed caption widths
const INFO_GAP = 24;
const INFO_LABEL_WIDTH = 91;

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

export default function CaptionCarousel({ work }: CaptionCarouselProps) {
  const scale = useContainScale(CANVAS_WIDTH, CANVAS_HEIGHT);
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
    <div className="relative h-screen overflow-hidden bg-[#f8f8f8]">
      <div
        className="absolute top-0 left-0"
        style={{
          width: px(CANVAS_WIDTH),
          height: px(CANVAS_HEIGHT),
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <button
          type="button"
          onClick={advanceLeft}
          aria-label="Previous left image"
          className="absolute overflow-hidden bg-[#f8f8f8]"
          style={{
            left: px(LEFT_BOX.x),
            top: px(LEFT_BOX.y),
            width: px(LEFT_BOX.w),
            height: px(LEFT_BOX.h),
          }}
        >
          {leftCount > 0 && <MediaFrame item={media.left[leftIndex]} />}
        </button>

        <button
          type="button"
          onClick={advanceRight}
          aria-label="Next right image"
          className="absolute overflow-hidden bg-[#f8f8f8]"
          style={{
            left: px(RIGHT_BOX.x),
            top: px(RIGHT_BOX.y),
            width: px(RIGHT_BOX.w),
            height: px(RIGHT_BOX.h),
          }}
        >
          {!isRightTextSlide && rightCount > 0 && (
            <MediaFrame item={media.right[rightIndex]} />
          )}

          {isRightTextSlide && (
            <div
              className="absolute flex flex-col text-left text-[11px] text-black capitalize leading-[1.5]"
              style={{
                right: px(INFO_RIGHT_MARGIN),
                bottom: px(INFO_BOTTOM_MARGIN),
                width: px(INFO_WIDTH),
                gap: px(INFO_GAP),
              }}
            >
              <div className="flex">
                <div
                  className="shrink-0 whitespace-nowrap"
                  style={{ width: px(INFO_LABEL_WIDTH) }}
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

              <div className="flex">
                <div
                  className="shrink-0 whitespace-nowrap"
                  style={{ width: px(INFO_LABEL_WIDTH) }}
                >
                  for
                </div>
                <div>
                  {exhibitionLines.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex">
                <div
                  className="shrink-0 whitespace-nowrap"
                  style={{ width: px(INFO_LABEL_WIDTH) }}
                >
                  date
                </div>
                <div>{work.year ?? "TBD"}</div>
              </div>

              <div className="text-[12px] leading-[1.5]">
                <div className={pretendard.className}>
                  {(work.captionKo ?? ["TBD"]).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="mt-3">
                  {(work.captionEn ?? ["TBD"]).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </button>

        <div
          className="absolute flex flex-col text-[12px] leading-[1.5] capitalize"
          style={{
            left: px(TITLE_X),
            top: px(TITLE_Y),
            gap: px(TITLE_GROUP_GAP),
          }}
        >
          <div style={{ maxWidth: px(TITLE_MAX_WIDTH) }}>
            {(work.workTitleLines ?? [work.title]).map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <div
            className={`${pretendard.className} leading-[1.4]`}
            style={{ width: px(SUBTITLE_WIDTH) }}
          >
            {work.workSubtitle ?? "TBD"}
          </div>
        </div>
      </div>
    </div>
  );
}
