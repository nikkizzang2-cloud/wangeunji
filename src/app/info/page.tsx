import Image from "next/image";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { fontgrow, growWith, px } from "@/lib/figma-layout";

// Figma "info" frame (get_metadata nodeId 16:2 / 48:105): width=1920,
// height=1731. Below the site-wide mobile toggle width (700px, see
// TopBar.tsx), a separate "info mobile" frame (nodeId 95:2287,
// width=800, height=2074 — its own native reference width, unrelated to the
// 700px toggle) is used instead — not a scaled-down copy of the desktop
// numbers. Both variants render at all times (`hidden`/`min-[700px]:hidden`
// toggles which is visible), same approach as intro/page.tsx.
//
// Every element keeps its raw Figma x/y/width, and the whole frame is
// scaled uniformly by the same min(1, viewport/referenceWidth) factor as
// TopBar and the /main pages (`.figma-canvas-*`, globals.css) — so font
// sizes, gaps, and text-wrap widths all shrink/grow together and the
// composition matches Figma exactly at any viewport width, same as
// everywhere else on the site.
//
// An earlier revision used a fluid flexbox layout instead (fixed font
// sizes, `flex-wrap` letting the text column reflow/wrap onto more lines as
// the viewport narrowed) specifically to avoid the older `figma-pin`
// mismatch — that approach scaled x-position as a % of viewport width while
// leaving font-size fixed, so a narrower screen wrapped text more than
// Figma intended and it could collide with the section below. The unified
// canvas here doesn't have that problem (font-size scales right along with
// position/width), so text always wraps exactly as it does in Figma.
//
// Mobile stacks label-above-content (both columns start at the same x=46)
// instead of desktop's side-by-side label/content columns — a real layout
// difference in the mobile frame, not just narrower numbers. Per explicit
// request, the Introduction paragraphs' manual line breaks are mirrored
// verbatim from the desktop node (154:130)'s own break points rather than
// re-wrapped for the mobile frame's own (smaller, 13px) width — mobile's
// own paragraph *grouping* (which sentences share a `<p>`, and the gaps
// between them) is unchanged, only where each line wraps inside a group.
//
// The Korean body copy is set in Pretendard Regular (changed from Medium
// per explicit request), distinct from the Helvetica used everywhere else
// on the site (both breakpoints).
const pretendard = localFont({
  src: "../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Regular.woff2",
  weight: "400",
  display: "swap",
});

const MOBILE_CANVAS_WIDTH = 800;
const MOBILE_CANVAS_HEIGHT = 2074;

// Introduction/Exhibition/Contact block geometry (Figma get_metadata node
// 117:139, the 1512px reference frame). Explicit brief from the user: below
// the design's native 1512px viewport width, first shrink the gap between
// the label column and content column (176.38px -> 38px floor) while font
// size, image size and every text block's own width stay fixed; once that
// gap bottoms out, shrink the cv image instead (592.92px -> 440px floor)
// while the 38px gap stays fixed; once the image also bottoms out
// (~1220.7px), restructure into a stacked column (image restored to native
// size, on top; the label+content row below it at the original 176.38px
// gap and a 95px vertical gap; the whole block at a 35px left margin) until
// the mobile toggle width (700px) takes over with its own separate Figma
// frame ("info mobile", 95:2287) — unchanged, see MobileInfo below.
const INTRO_VIEWPORT_NATIVE = 1512;
const INTRO_IMAGE_NATIVE_W = 592.9234619140625;
const INTRO_IMAGE_NATIVE_H = 407.8809509277344;
const INTRO_IMAGE_FLOOR_W = 440;
const INTRO_IMAGE_LABEL_GAP_NATIVE = 93.7034912109375; // image right edge -> label column
const INTRO_IMAGE_LABEL_GAP_FLOOR = 53;
const INTRO_LABEL_COL_W = 53.54421615600586; // "introduction", the longest label — node 154:130's own width
// Content column block widths (node 154:130) — each text block keeps its
// own native width/font-size pair so its wrap points (and therefore its
// rendered height, which the vertical gaps below assume) match Figma.
const INTRO_ENGLISH_PARA_W = 416;
const INTRO_KOREAN_PARA_W = 383;
const INTRO_EXHIBITION_W = 472.448974609375; // the widest content block — governs the row's own right edge
const INTRO_CONTACT_W = 158;
const INTRO_LABEL_CONTENT_GAP_NATIVE = 176.38156509399414; // label column -> content column
const INTRO_LABEL_CONTENT_GAP_FLOOR = 38;
const INTRO_RIGHT_MARGIN_FLOOR = 40; // viewport right edge -> content column's right edge

// Two shrink phases:
//   A. label<->content gap: 176.38 -> 38, alone (native width down to
//      PHASE_B_START) — this one stays sequential/first, per the user's own
//      "텍스트박스끼리 38px 줄고나서" ("after the text boxes finish").
//   B. image width (592.92->440), image<->label gap (93.70->53), and the
//      row's own right margin (viewport - row's right edge, ~123->40) all
//      move TOGETHER, in lockstep, across the SAME viewport range — not
//      sequentially. An earlier revision did these three one after another
//      (each fully bottoming out before the next started), which read as
//      distinctly staggered/jerky while resizing ("덜그럭거리는 느낌") — three
//      separate "now THIS moves" handoffs. Moving them on one shared linear
//      progress fraction removes two of those three handoffs; the algebra
//      guarantees the right margin comes out correctly interpolated with NO
//      clamp() of its own, since (viewport - rowWidth) is linear whenever
//      viewport and rowWidth both are: right margin's own start (123, at
//      PHASE_B_START) and end (40, at PHASE_B_END) values are exactly what
//      they'd be regardless of path, so this doesn't change PHASE_B_END.
const INTRO_PHASE_B_START =
  INTRO_VIEWPORT_NATIVE - (INTRO_LABEL_CONTENT_GAP_NATIVE - INTRO_LABEL_CONTENT_GAP_FLOOR); // 1373.62
const INTRO_ROW_WIDTH_AT_FLOORS =
  INTRO_IMAGE_FLOOR_W +
  INTRO_IMAGE_LABEL_GAP_FLOOR +
  INTRO_LABEL_COL_W +
  INTRO_LABEL_CONTENT_GAP_FLOOR +
  INTRO_EXHIBITION_W; // 1056.99
// Where the row layout's right margin would hit its own 40px floor — below
// this, switch to the stacked layout (min-[1097px]/max-[1097px] below —
// paired on the SAME value since Tailwind compiles `max-[Npx]` to
// `not (min-width: Npx)`, i.e. strictly < N — pairing it with `min-[N+1px]`
// left a 1px gap at exactly N where neither layout showed (caught via
// browser preview, same bug as the earlier 1220px breakpoint fix) —
// same "no 1px gap" fix as the earlier min/max-width pairing bug).
const INTRO_PHASE_B_END = INTRO_ROW_WIDTH_AT_FLOORS + INTRO_RIGHT_MARGIN_FLOOR; // 1096.99
const INTRO_PHASE_B_RANGE = INTRO_PHASE_B_START - INTRO_PHASE_B_END; // 276.62 — shared denominator

const INTRO_STACK_GAP = 95; // image bottom -> label/content row, stacked layout only
const INTRO_STACK_MARGIN = 0; // left margin of the image, stacked layout only
const INTRO_STACK_TEXT_MARGIN = 40; // left margin of the label/content row, stacked layout only — NOT the same as the image's (reuses the row layout's own right-margin floor value, coincidentally)
// content column bottom -> logo, both layouts — flow-positioned (not
// absolute px) so it never overlaps whichever layout is taller. Desktop
// only (explicit request): shifted up 40px from the original 206 — logo
// moves up, INTRO_BOTTOM_PADDING (page bottom -> copyright) stays the same
// 25px it always was, so the page's total scroll length shrinks by the same
// 40px. Mobile is unaffected (MobileInfo positions its own footer via
// absolute px, not this constant).
const INTRO_LOGO_GAP = 166;
const INTRO_BOTTOM_PADDING = 25; // page bottom -> copyright text, matches PartsGallery/FurnitureGallery's footer

// Footer group ("Group 264" equivalent) — same logo/copyright size and
// local layout as PartsGallery.tsx/FurnitureGallery.tsx's own footer
// (node 117:139's own "Group 264", w=54/h=68.087, text at x=6.26/y=62.6).
// Those pages track a uniform `--fcol-scale` transform for `top`; /info has
// no such transform (this block's height is real, unscaled text), so this
// stays flow-positioned via INTRO_LOGO_GAP above instead of a calc() — but
// the group's own internal layout, size, and horizontal centering
// (`left:50vw` + `-translate-x-1/2`, viewport-relative rather than
// parent-relative) match theirs exactly.
const INTRO_FOOTER_LOGO = { w: 54, h: 68.08695983886719 };
const INTRO_FOOTER_TEXT = { x: 6.26171875, y: 62.609375, w: 47 };
const INTRO_FOOTER_GROUP_WIDTH = 54;
// Taller than the logo image alone — the copyright text sits inside this
// group as `position: absolute` (out of flow) at y=62.6, so without an
// explicit height here the group's auto height stops at the logo's own
// 68.087px and INTRO_BOTTOM_PADDING ends up measured ~7px short of the
// text's real visual bottom (caught via browser preview).
const INTRO_FOOTER_GROUP_HEIGHT = 74.609375;

const introGapCss = `clamp(${px(INTRO_LABEL_CONTENT_GAP_FLOOR)}, calc(${px(INTRO_LABEL_CONTENT_GAP_NATIVE)} - (${px(INTRO_VIEWPORT_NATIVE)} - 100vw)), ${px(INTRO_LABEL_CONTENT_GAP_NATIVE)})`;
// Phase B: image width and image<->label gap both move on the SAME linear
// progress fraction (PHASE_B_START - 100vw) / PHASE_B_RANGE — see the
// constants block above for why this makes the row's right margin come out
// correctly interpolated too, with no clamp() of its own.
const introImageWidthCss = `clamp(${px(INTRO_IMAGE_FLOOR_W)}, calc(${px(INTRO_IMAGE_NATIVE_W)} - (${INTRO_IMAGE_NATIVE_W - INTRO_IMAGE_FLOOR_W}) * (${px(INTRO_PHASE_B_START)} - 100vw) / ${INTRO_PHASE_B_RANGE}), ${px(INTRO_IMAGE_NATIVE_W)})`;
const introImageLabelGapCss = `clamp(${px(INTRO_IMAGE_LABEL_GAP_FLOOR)}, calc(${px(INTRO_IMAGE_LABEL_GAP_NATIVE)} - (${INTRO_IMAGE_LABEL_GAP_NATIVE - INTRO_IMAGE_LABEL_GAP_FLOOR}) * (${px(INTRO_PHASE_B_START)} - 100vw) / ${INTRO_PHASE_B_RANGE}), ${px(INTRO_IMAGE_LABEL_GAP_NATIVE)})`;

type ExhibitionEntry = {
  year: string;
  text: string;
  href?: string;
};

const EXHIBITION_ENTRIES: ExhibitionEntry[] = [
  {
    year: "2026",
    text: "Monthly Rent: Notes on Housing Anxiety, Bluecabinet.gallery, Seoul, South Korea",
  },
  { year: "2026", text: "Melbourne Design Week, A member of YGM, Melbourne,Australia" },
  {
    year: "2026",
    text: "collectiblefair, A member of egardingrelations,Espace Vanderborght, Brussels, Belgium",
    href: "https://www.dezeen.com/2026/03/16/seating-designs-collectible-brussels-2026/",
  },
  { year: "2025", text: "Small Sculpture, Space B-E Gallery, Seoul, South Korea" },
  { year: "2025", text: "Dental Critique, Towels and Funeral Wreaths, Seoul, South Korea" },
  { year: "2025", text: "Hypothesisium, Towels and Funeral Wreaths Gallery, Seoul, South Korea" },
  {
    year: "2025",
    text: "Milan Design Week, A member of Commune, Superspatial Gallery, Milan, Italy",
    href: "https://comuneobj.com/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAcGRvZgJleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA85MzY2MTk3NDMzOTI0NTkAAaeZfPaHaKhCqcQJnBY205dCb-OZo_hzAGe3zBxKI02VK_DP_uDPBzC3tqEOjw_aem_cfxJ6qliB2uKFxH2Oh2Pgg",
  },
  { year: "2024", text: "Seoul Design Festival- Young designer" },
  {
    year: "2023",
    text: "Sulwhasoo Cultural Project, Sulwhasoo Bukchon Store, Seoul, South Korea",
  },
  { year: "2023", text: "Here or There, Sinchon Cultural Center, Seoul, South Korea" },
];

function ExhibitionList({ fontSize }: { fontSize: number }) {
  return (
    <>
      {EXHIBITION_ENTRIES.map((entry, index) => (
        <p key={index} style={{ fontSize: fontgrow(fontSize) }} className="leading-[2]">
          {entry.year}
          {"  "}
          {entry.href ? (
            <a
              href={entry.href}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer transition-colors hover:text-[#b9b9b9]"
            >
              {entry.text}
            </a>
          ) : (
            entry.text
          )}
        </p>
      ))}
    </>
  );
}

function ContactBlock({ fontSize }: { fontSize: number }) {
  return (
    <div className="lowercase leading-[1.5]" style={{ fontSize: fontgrow(fontSize) }}>
      <p>+82 01091395405</p>
      <p>eunji.wang.0@gmail.com</p>
      <a
        href="https://www.instagram.com/wang.eunjj/"
        target="_blank"
        rel="noreferrer"
        className="block cursor-pointer transition-colors hover:text-[#b9b9b9]"
      >
        wang.eunjj@instagram
      </a>
    </div>
  );
}

const SECTION_LABEL_TEXT_CLASS = "font-normal capitalize text-[#656565]";

// One section's label + content, side by side as ONE flex row so they
// share the exact same top edge (`items-start`) no matter how tall the
// content actually renders — label and content used to be two independent
// marginTop chains computed from Figma's own assumed paragraph heights,
// which drifted out of sync from the real (natural-CSS-wrap) rendered
// height and made "Exhibition"/"contact" visibly misaligned from their
// content. `marginTop` on the row itself (not per-column) is the gap from
// the PREVIOUS row's actual bottom (always driven by content, the taller
// column) to this row's top — read off node 117:139.
function IntroSectionRow({
  label,
  gap,
  marginTop,
  children,
}: {
  label: string;
  gap: string;
  marginTop?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start" style={marginTop ? { marginTop } : undefined}>
      <div style={{ width: growWith(10, INTRO_LABEL_COL_W), flexShrink: 0 }}>
        <h2 className={SECTION_LABEL_TEXT_CLASS} style={{ fontSize: fontgrow(10) }}>
          {label}
        </h2>
      </div>
      <div style={{ width: gap, flexShrink: 0 }} />
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function IntroColumns({ gap }: { gap: string }) {
  return (
    <div>
      <IntroSectionRow label="introduction" gap={gap}>
        <div
          className="leading-[1.75]"
          style={{ fontSize: fontgrow(11), width: growWith(11, INTRO_ENGLISH_PARA_W) }}
        >
          <p>
            Furniture serves a clear purpose as a tool that supports everyday life,
            <br />
            yet it also exists in a state of hypothesis, as its purpose can shift through
            <br />
            interaction with the user. The functions and forms designed around the
            <br />
            tentative expectation of “how it will be used” are continually redefined
            <br />
            through the user’s everyday life.
          </p>
          <p style={{ marginTop: growWith(11, 7) }}>
            This leads to the concept of Hypothesis Furniture, in which the maker and
            <br />
            the user share the agency to determine how the furniture is used, and its
            <br />
            existence is ultimately affirmed through use in everyday life. Hypothesis
            <br />
            Furniture is not simply about transforming form. Rather, it requires structural
            <br />
            devices that suspend a singular function and leave room for multiple
            <br />
            possibilities. I conceive of these devices as &apos;parts&apos;.
          </p>
        </div>
        <div
          className={`${pretendard.className} leading-[1.8]`}
          style={{
            fontSize: fontgrow(11),
            width: growWith(11, INTRO_KOREAN_PARA_W),
            marginTop: growWith(11, 38),
          }}
        >
          <p>
            가구는 인간의 생활을 보조하는 도구라는 점에서 명확한 목적성을 담보하고 있으면서도,
            <br />
            사용자와의 상호작용에 따라 그 목적이 변모할 가능성을 지니기에 일종의 가설 상태에
            <br />
            놓여 있다. &lsquo;이렇게 쓰일 것이다&rsquo; 라는 잠정적 기대나 전제로 설계된 기능과 형태는 쓰는
            <br />
            이의 생활 속에서 끊임없이 갱신된다.
          </p>
          <p style={{ marginTop: growWith(11, 7) }}>
            이는 가구를 만드는 이와 쓰는 이가 공동의 결정 권한을 가진 채, 일상에서 쓰임을 통해
            <br />
            가구의 존재가 증명되는 가설 가구 (Hypothesis Furniture) 의 개념으로 이어진다.
            <br />
            이때 가설 가구는 단순한 조형의 전환이 아니라 단일한 쓰임을 유예하고 다양한
            <br />
            가능성을 열어두는 구조적 장치를 필요로 하는데, 나는 그것을 &lsquo;파츠&rsquo;로 상정하였다.
          </p>
        </div>
      </IntroSectionRow>
      <IntroSectionRow label="Exhibition" gap={gap} marginTop={px(133)}>
        <div style={{ width: growWith(11, INTRO_EXHIBITION_W) }}>
          <ExhibitionList fontSize={11} />
        </div>
      </IntroSectionRow>
      <IntroSectionRow label="contact" gap={gap} marginTop={px(57)}>
        <div style={{ width: growWith(11, INTRO_CONTACT_W) }}>
          <ContactBlock fontSize={11} />
        </div>
      </IntroSectionRow>
    </div>
  );
}

// Phases A+B (viewport >= 1097px): image beside the label/content pair.
// Pure CSS `clamp()` covers both phases continuously — each of
// introImageWidthCss/introImageLabelGapCss/introGapCss stays clamped to its
// own native max above its own phase's start width, so nothing extra is
// needed here to tell the phases apart; the row's right margin shrinking to
// 40 needs no clamp() of its own at all — see INTRO_PHASE_B_END's comment.
//
// marginTop 208 (both here and IntroStackedLayout below): shifted up 3px
// from Figma's 211 per explicit request to move the topbar up 3px, desktop
// only (see TopBar.tsx) — MobileInfo's own top offset is untouched.
function IntroRowLayout() {
  return (
    <div className="hidden min-[1097px]:flex min-[1097px]:items-start" style={{ marginTop: px(208) }}>
      <div
        className="info-image-grow relative shrink-0"
        style={{
          width: introImageWidthCss,
          aspectRatio: `${INTRO_IMAGE_NATIVE_W} / ${INTRO_IMAGE_NATIVE_H}`,
        }}
      >
        <Image src="/info/cv.png" alt="" fill className="object-cover" priority />
      </div>
      <div className="info-image-gap-grow" style={{ width: introImageLabelGapCss, flexShrink: 0 }} />
      <div style={{ marginTop: px(13) }}>
        <IntroColumns gap={introGapCss} />
      </div>
    </div>
  );
}

// Stage 5 (viewport 700px-1096px): image restored to native size, on top,
// flush left (marginLeft 0 — an explicit correction: an earlier revision
// used 35px here); label/content pair below it, back at their original
// (uncompressed) gap and its own separate 40px left margin (not the same
// as the image's — the image stays at 0).
function IntroStackedLayout() {
  return (
    <div className="hidden max-[1097px]:block" style={{ marginTop: px(208) }}>
      <div
        className="relative"
        style={{
          width: px(INTRO_IMAGE_NATIVE_W),
          height: px(INTRO_IMAGE_NATIVE_H),
          marginLeft: px(INTRO_STACK_MARGIN),
        }}
      >
        <Image src="/info/cv.png" alt="" fill className="object-cover" priority />
      </div>
      <div style={{ marginTop: px(INTRO_STACK_GAP), marginLeft: px(INTRO_STACK_TEXT_MARGIN) }}>
        <IntroColumns gap={px(INTRO_LABEL_CONTENT_GAP_NATIVE)} />
      </div>
    </div>
  );
}

function DesktopInfo() {
  return (
    <div className="hidden h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[700px]:block">
      <div className="relative" style={{ paddingBottom: px(INTRO_BOTTOM_PADDING) }}>
        <IntroRowLayout />
        <IntroStackedLayout />

        {/* Fixed size, always viewport-centered (left:50vw + -translate-x-1/2,
            same technique as PartsGallery/FurnitureGallery's footer — see
            INTRO_FOOTER_LOGO's comment), flow-positioned below whichever
            layout above is actually visible/tallest — never a hardcoded
            absolute y (would overlap the much taller stacked layout, which
            has no single Figma-designed y to read off). */}
        <div
          className="relative -translate-x-1/2"
          style={{
            left: "50vw",
            width: px(INTRO_FOOTER_GROUP_WIDTH),
            height: px(INTRO_FOOTER_GROUP_HEIGHT),
            marginTop: px(INTRO_LOGO_GAP),
          }}
        >
          <div
            className="relative"
            style={{ width: px(INTRO_FOOTER_LOGO.w), height: px(INTRO_FOOTER_LOGO.h) }}
          >
            <Image src="/main/logo.png" alt="" fill className="object-contain" />
          </div>
          <p
            className="absolute whitespace-nowrap text-[8px] text-[#818181]"
            style={{ left: px(INTRO_FOOTER_TEXT.x), top: px(INTRO_FOOTER_TEXT.y), width: px(INTRO_FOOTER_TEXT.w) }}
          >
            Eunji Wang©
          </p>
        </div>
      </div>
    </div>
  );
}

const MOBILE_SECTION_LABEL_CLASS = "absolute text-[13px] font-normal capitalize text-[#656565]";

function MobileInfo() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8] min-[700px]:hidden">
      <div
        className="figma-canvas-frame"
        style={{
          ["--fc-width" as string]: px(MOBILE_CANVAS_WIDTH),
          ["--fc-height" as string]: px(MOBILE_CANVAS_HEIGHT),
        }}
      >
        <div className="figma-canvas-scaler">
          <div className="figma-canvas-content">
            <div
              className="absolute overflow-hidden"
              style={{ left: px(-1), top: px(150), width: px(655), height: px(451) }}
            >
              <Image src="/info/cv.png" alt="" fill className="object-cover object-bottom" priority />
            </div>

            <h2 className={MOBILE_SECTION_LABEL_CLASS} style={{ left: px(46), top: px(677) }}>
              introduction
            </h2>
            <div
              className="absolute text-[13px] leading-[1.75]"
              style={{ left: px(46), top: px(728), width: px(538), height: px(237) }}
            >
              <p>
                Furniture serves a clear purpose as a tool that supports everyday life,
                <br />
                yet it also exists in a state of hypothesis, as its purpose can shift through
                <br />
                interaction with the user. The functions and forms designed around the
                <br />
                tentative expectation of “how it will be used” are continually redefined
                <br />
                through the user’s everyday life.
              </p>
              <p className="mt-3">
                This leads to the concept of Hypothesis Furniture, in which the maker and
                <br />
                the user share the agency to determine how the furniture is used, and its
                <br />
                existence is ultimately affirmed through use in everyday life. Hypothesis
                <br />
                Furniture is not simply about transforming form. Rather, it requires structural
                <br />
                devices that suspend a singular function and leave room for multiple
                <br />
                possibilities. I conceive of these devices as &apos;parts&apos;.
              </p>
            </div>

            <div
              className={`${pretendard.className} absolute text-[13px] leading-[1.8]`}
              style={{ left: px(45), top: px(1006), width: px(546), height: px(223) }}
            >
              <p>
                가구는 인간의 생활을 보조하는 도구라는 점에서 명확한 목적성을 담보하고 있으면서도,
                <br />
                사용자와의 상호작용에 따라 그 목적이 변모할 가능성을 지니기에 일종의 가설 상태에
                <br />
                놓여 있다. &lsquo;이렇게 쓰일 것이다&rsquo; 라는 잠정적 기대나 전제로 설계된 기능과 형태는 쓰는
                <br />
                이의 생활 속에서 끊임없이 갱신된다.
              </p>
              <p className="mt-3">
                이는 가구를 만드는 이와 쓰는 이가 공동의 결정 권한을 가진 채, 일상에서 쓰임을 통해
                <br />
                가구의 존재가 증명되는 가설 가구 (Hypothesis Furniture) 의 개념으로 이어진다.
                <br />
                이때 가설 가구는 단순한 조형의 전환이 아니라 단일한 쓰임을 유예하고 다양한
                <br />
                가능성을 열어두는 구조적 장치를 필요로 하는데, 나는 그것을 &lsquo;파츠&rsquo;로 상정하였다.
              </p>
            </div>

            <h2 className={MOBILE_SECTION_LABEL_CLASS} style={{ left: px(46), top: px(1297) }}>
              Exhibition
            </h2>
            <div className="absolute" style={{ left: px(46), top: px(1348), width: px(546), height: px(260) }}>
              <ExhibitionList fontSize={13} />
            </div>

            <h2 className={MOBILE_SECTION_LABEL_CLASS} style={{ left: px(46), top: px(1686) }}>
              contact
            </h2>
            <div
              className="absolute"
              style={{ left: px(45), top: px(1737), width: px(150), height: px(60) }}
            >
              <ContactBlock fontSize={13} />
            </div>

            <div
              className="absolute"
              style={{ left: px(387), top: px(1960), width: px(64), height: px(81) }}
            >
              <Image src="/main/logo.png" alt="" fill className="object-contain" />
            </div>
            <p
              className="absolute whitespace-nowrap text-[10px] text-[#818181]"
              style={{ left: px(389), top: px(2034), width: px(59) }}
            >
              Eunji Wang©
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <>
      <DesktopInfo />
      <MobileInfo />
    </>
  );
}
