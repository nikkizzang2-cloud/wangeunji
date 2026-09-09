"use client";

import Image from "next/image";
import localFont from "next/font/local";
import { useState } from "react";
import type { CaptionWork } from "@/data/works";
import { CAPTION_MEDIA, type CaptionMediaItem } from "@/data/captionMedia";
import { splitDimensionUnits } from "@/data/partsInfo";
import { px } from "@/lib/figma-layout";

// Figma "caption" / "caption.textframe" frames (get_metadata nodeId 72:1167 /
// 72:1145 — two states of the same page: with vs without the right
// carousel's image, i.e. what shows once the right side has cycled through
// all its photos). width=1920, height=1080, includes the header region like
// /intro. Raw Figma y-coordinates are used as-is below — no TOPBAR_HEIGHT
// subtraction/pt-16 reservation (see PartsGallery.tsx / TopBar.tsx for why).
// Scaled via `.figma-contain-scale` (globals.css) — not the `.figma-canvas-*`
// classes' width-only `cqw`, since this is a no-scroll page and width-only
// scaling would clip the bottom on a viewport wider than 16:9. Used to be a
// JS hook (`useContainScale`) instead, but that read
// `window.innerWidth`/`innerHeight` in a `useEffect` after mount, which
// turned out unreliable in KakaoTalk's in-app browser — see
// `.figma-contain-scale`'s comment in globals.css for the full story.
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
      className="figma-contain-scale relative hidden h-dvh overflow-hidden bg-[#f8f8f8] min-[800px]:block"
      style={{
        ["--fcs-width" as string]: px(CANVAS_WIDTH),
        ["--fcs-height" as string]: px(CANVAS_HEIGHT),
      }}
    >
      <div
        className="figma-contain-scale-inner absolute top-0 left-0"
        style={{
          width: px(CANVAS_WIDTH),
          height: px(CANVAS_HEIGHT),
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

// Figma "cation mobile" (nodeId 95:2398): width=800, height=1591 (a single
// reference screen — the mobile design doesn't split into separate
// left/right carousels like desktop; per the user, one carousel cycles
// through every image, and the title/info/caption text sits statically
// below it rather than being gated behind cycling through all the photos
// like desktop's right-carousel text slide).
//
// This page's *height* genuinely varies with content (caption length
// differs per work), which none of the site's other Figma-canvas
// mechanisms handle — see `.figma-zoom-frame`/`.figma-zoom-content` in
// globals.css for why this needed a new one (`zoom`, not `transform`).
const MOBILE_CANVAS_WIDTH = 800;

const MOBILE_IMAGE_BOX = { x: 46, y: 123, w: 597, h: 759 };
const MOBILE_TITLE = { x: 46, y: 909, w: 151 };
const MOBILE_SUBTITLE = { x: 45, y: 963, w: 218 };
// Figma's own "제목설명" (작업제목/workSubtitle) node in this frame has its
// example content wrongly duplicated from the KO/EN caption (a much longer
// string than a subtitle should ever be), so its declared box height/the
// literal gap down to the info row below it aren't trustworthy — this gap
// is a reasonable stand-in (matching INFO_GAP below) rather than a faithful
// Figma number.
const MOBILE_SUBTITLE_TO_INFO_GAP = 24;
// Image box has a fixed, content-independent height, so this gap (image
// bottom -> title top) is a faithful Figma number: 909 - (123+759) = 27.
const MOBILE_IMAGE_TO_TITLE_GAP = MOBILE_TITLE.y - (MOBILE_IMAGE_BOX.y + MOBILE_IMAGE_BOX.h);
// Title's own rendered height varies with content (1 vs 2 lines), so —
// unlike the image gap above — Figma's raw top-to-top distance (963-909=54)
// isn't a usable margin-top (that would double-count the title's height).
// 18px is a reasonable stand-in matching the title block's Figma-declared
// 2-line height (36px) against that same 54px top-to-top distance.
const MOBILE_TITLE_TO_SUBTITLE_GAP = 18;

// 정보1/2/3 (Group 257) sit in a left column at x=46; 한글/영문캡션 (Group
// 258) sit in a separate column beside it at x=358 — genuinely two side-by
// side columns in this frame, not one stacked column like desktop's single
// right-carousel text layer. Both start at the same y (1170), so a flex
// row with each side as its own flex column (INFO_GAP between 정보1/2/3,
// matching desktop's same "Figma's own gaps are inconsistent, use one
// uniform gap" fix; 35px between KO/EN, a real Figma number here) keeps
// both readable regardless of how long any individual piece of text runs.
const MOBILE_INFO_X = 46;
const MOBILE_INFO_VALUE_WIDTH = 170; // Group 257's own width (261) minus INFO_LABEL_WIDTH (91)
const MOBILE_CAPTION_X = 358;
const MOBILE_CAPTION_GAP = MOBILE_CAPTION_X - MOBILE_INFO_X - (INFO_LABEL_WIDTH + MOBILE_INFO_VALUE_WIDTH);
const MOBILE_CAPTION_KO_WIDTH = 305;
const MOBILE_CAPTION_EN_WIDTH = 325;
const MOBILE_CAPTION_KO_EN_GAP = 35;

// Reorders one work's left+right media into a single list for the mobile
// carousel: all photos first, then any video/gif, then the drawing (if
// any) last — "사진 - 영상,gif(있다면) - 드로잉". Per the user, the LAST
// item of the `left` array (if it's an image, not a video) is always the
// drawing — the same "drawing files sort last within left" convention the
// original import already applied (see captionMedia.ts), reused here
// rather than re-detected some other way (there's no explicit "this is a
// drawing" flag in the data).
function buildMobileMediaOrder(media: { left: CaptionMediaItem[]; right: CaptionMediaItem[] }) {
  const isVideoOrGif = (item: CaptionMediaItem) =>
    item.type === "video" || item.src.toLowerCase().endsWith(".gif");

  const lastLeft = media.left.length > 0 ? media.left[media.left.length - 1] : null;
  const drawing = lastLeft && !isVideoOrGif(lastLeft) ? lastLeft : null;

  const rest = [...media.left, ...media.right].filter((item) => item !== drawing);
  const photos = rest.filter((item) => !isVideoOrGif(item));
  const videosAndGifs = rest.filter(isVideoOrGif);

  return drawing ? [...photos, ...videosAndGifs, drawing] : [...photos, ...videosAndGifs];
}

function MobileCaption({ work }: CaptionCarouselProps) {
  const media = CAPTION_MEDIA[work.slug] ?? { left: [], right: [] };
  const orderedMedia = buildMobileMediaOrder(media);
  const [index, setIndex] = useState(0);

  const advance = () => {
    if (orderedMedia.length === 0) return;
    setIndex((current) => (current + 1) % orderedMedia.length);
  };

  const dimensionUnits = work.partsInfo.dimensions
    ? splitDimensionUnits(work.partsInfo.dimensions)
    : [];
  const exhibitionLines = work.exhibition
    ? Array.isArray(work.exhibition)
      ? work.exhibition
      : [work.exhibition]
    : ["TBD"];

  return (
    <div className="figma-zoom-frame h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[800px]:hidden">
      <div
        className="figma-zoom-content pb-16"
        style={{ ["--fz-width" as string]: px(MOBILE_CANVAS_WIDTH) }}
      >
        <button
          type="button"
          onClick={advance}
          aria-label="Next image"
          className="relative block overflow-hidden bg-[#f8f8f8]"
          style={{
            marginLeft: px(MOBILE_IMAGE_BOX.x),
            marginTop: px(MOBILE_IMAGE_BOX.y),
            width: px(MOBILE_IMAGE_BOX.w),
            height: px(MOBILE_IMAGE_BOX.h),
          }}
        >
          {orderedMedia.length > 0 && <MediaFrame item={orderedMedia[index]} />}
        </button>

        <div
          className="text-[12px] leading-[1.5] capitalize"
          style={{
            marginLeft: px(MOBILE_TITLE.x),
            marginTop: px(MOBILE_IMAGE_TO_TITLE_GAP),
            width: px(MOBILE_TITLE.w),
          }}
        >
          {(work.workTitleLines ?? [work.title]).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div
          className={`${pretendard.className} text-[12px] leading-[1.4]`}
          style={{
            marginLeft: px(MOBILE_SUBTITLE.x),
            marginTop: px(MOBILE_TITLE_TO_SUBTITLE_GAP),
            width: px(MOBILE_SUBTITLE.w),
          }}
        >
          {work.workSubtitle ?? "TBD"}
        </div>

        <div
          className="flex"
          style={{ marginLeft: px(MOBILE_INFO_X), marginTop: px(MOBILE_SUBTITLE_TO_INFO_GAP) }}
        >
          <div
            className="flex flex-col text-left text-[11px] text-black capitalize leading-[1.5]"
            style={{ gap: px(INFO_GAP) }}
          >
            <div className="flex">
              <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
                <p>Parts</p>
                <p>type</p>
                <p>size</p>
              </div>
              <div style={{ width: px(MOBILE_INFO_VALUE_WIDTH) }}>
                <p>{work.partsInfo.name}</p>
                {work.partsInfo.type && <p>{work.partsInfo.type}</p>}
                {dimensionUnits.map((unit, index) => (
                  <p key={index}>{unit}</p>
                ))}
              </div>
            </div>

            <div className="flex">
              <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
                for
              </div>
              <div style={{ width: px(MOBILE_INFO_VALUE_WIDTH) }}>
                {exhibitionLines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>

            <div className="flex">
              <div className="shrink-0 whitespace-nowrap" style={{ width: px(INFO_LABEL_WIDTH) }}>
                date
              </div>
              <div>{work.year ?? "TBD"}</div>
            </div>
          </div>

          <div
            className="flex flex-col text-[12px] leading-[1.5]"
            style={{ marginLeft: px(MOBILE_CAPTION_GAP) }}
          >
            <div className={pretendard.className} style={{ width: px(MOBILE_CAPTION_KO_WIDTH) }}>
              {(work.captionKo ?? ["TBD"]).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <div
              style={{ marginTop: px(MOBILE_CAPTION_KO_EN_GAP), width: px(MOBILE_CAPTION_EN_WIDTH) }}
            >
              {(work.captionEn ?? ["TBD"]).map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CaptionCarousel({ work }: CaptionCarouselProps) {
  return (
    <>
      <DesktopCaption work={work} />
      <MobileCaption work={work} />
    </>
  );
}
