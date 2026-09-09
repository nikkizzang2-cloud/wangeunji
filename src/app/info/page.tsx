import Image from "next/image";
import localFont from "next/font/local";
import { px } from "@/lib/figma-layout";

// Figma "info" frame (get_metadata nodeId 16:2 / 48:105): width=1920,
// height=1731.
//
// Same single-canvas approach as PartsGallery.tsx/FurnitureGallery.tsx: every
// element keeps its raw Figma x/y/width, and the whole frame is scaled
// uniformly by the same min(1, viewport/1920) factor as TopBar and the
// /main pages (`.figma-canvas-*`, globals.css) — so font sizes, gaps, and
// text-wrap widths all shrink/grow together and the composition matches
// Figma exactly at any viewport width, same as everywhere else on the site.
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
// The Korean body copy is set in Pretendard Medium in the design, distinct
// from the Helvetica used everywhere else on the site.
const pretendard = localFont({
  src: "../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
  weight: "500",
  display: "swap",
});

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1731;

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

const SECTION_LABEL_CLASS = "absolute w-[68px] text-[13px] font-normal capitalize text-[#656565]";

export default function InfoPage() {
  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#f8f8f8]">
      <div
        className="figma-canvas-frame"
        style={{
          ["--fc-width" as string]: px(CANVAS_WIDTH),
          ["--fc-height" as string]: px(CANVAS_HEIGHT),
        }}
      >
        <div className="figma-canvas-scaler">
          <div className="figma-canvas-content">
            <div
              className="absolute overflow-hidden"
              style={{ left: px(0), top: px(253), width: px(753), height: px(518) }}
            >
              <Image src="/info/cv.png" alt="" fill className="object-cover" priority />
            </div>

            <h2 className={SECTION_LABEL_CLASS} style={{ left: px(872), top: px(270) }}>
              introduction
            </h2>
            <div
              className="absolute text-[13px] leading-[1.7]"
              style={{ left: px(1164), top: px(270), width: px(564), height: px(237) }}
            >
              <p>
                Furniture serves a clear purpose as a tool that supports everyday life, yet it
                also exists in a state of hypothesis, as its purpose can shift through interaction
                with the user. The functions and forms designed around the tentative expectation
                of “how it will be used” are continually redefined through the user’s everyday
                life.
              </p>
              <p className="mt-4">
                This leads to the concept of Hypothesis Furniture, in which the maker and the user
                share the agency to determine how the furniture is used, and its existence is
                ultimately affirmed through use in everyday life. Hypothesis Furniture is not
                simply about transforming form. Rather, it requires structural devices that
                suspend a singular function and leave room for multiple possibilities. I conceive
                of these devices as &apos;parts&apos;.
              </p>
            </div>
            <div
              className={`${pretendard.className} absolute text-[13px] leading-[1.75]`}
              style={{ left: px(1164), top: px(558), width: px(546), height: px(223) }}
            >
              <p>
                가구는 인간의 생활을 보조하는 도구라는 점에서 명확한 목적성을 담보하고 있으면서도,
                사용자와의 상호작용에 따라 그 목적이 변모할 가능성을 지니기에 일종의 가설 상태에
                놓여 있다. &lsquo;이렇게 쓰일 것이다&rsquo; 라는 잠정적 기대나 전제로 설계된 기능과
                형태는 쓰는 이의 생활 속에서 끊임없이 갱신된다.
              </p>
              <p className="mt-5">
                이는 가구를 만드는 이와 쓰는 이가 공동의 결정 권한을 가진 채, 일상에서 쓰임을 통해
                가구의 존재가 증명되는 가설 가구 (Hypothesis Furniture) 의 개념으로 이어진다. 이때
                가설 가구는 단순한 조형의 전환이 아니라 단일한 쓰임을 유예하고 다양한 가능성을
                열어두는 구조적 장치를 필요로 하는데, 나는 그것을 &lsquo;파츠&rsquo;로 상정하였다.
              </p>
            </div>

            <h2 className={SECTION_LABEL_CLASS} style={{ left: px(872), top: px(971) }}>
              Exhibition
            </h2>
            <div
              className="absolute text-[14px] leading-[2]"
              style={{ left: px(1164), top: px(971), width: px(600), height: px(308) }}
            >
              {EXHIBITION_ENTRIES.map((entry, index) => (
                <p key={index}>
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
            </div>

            <h2 className={SECTION_LABEL_CLASS} style={{ left: px(872), top: px(1338) }}>
              contact
            </h2>
            <div
              className="absolute text-[14px] lowercase leading-[1.5]"
              style={{ left: px(1166), top: px(1338), width: px(161), height: px(63) }}
            >
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

            <div
              className="absolute"
              style={{ left: px(925), top: px(1608), width: px(69), height: px(87) }}
            >
              <Image src="/main/logo.png" alt="" fill className="object-contain" />
            </div>
            <p
              className="absolute whitespace-nowrap text-[10px] text-[#818181]"
              style={{ left: px(933), top: px(1688), width: px(59) }}
            >
              Eunji Wang©
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
