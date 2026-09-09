import Image from "next/image";
import localFont from "next/font/local";
import type { ReactNode } from "react";

// Figma "info" frame (get_metadata nodeId 16:2 / 48:105): width=1920,
// height=1731. Per the responsive rules in CLAUDE.md, this page no longer
// scales as one fixed canvas: the CV photo stays fixed-size and
// fixed-position at every viewport width, and the right-hand text column
// keeps a fixed right margin (`pr-*` below) while its own width — and so its
// left-hand gap from the CV — is what shrinks as the viewport narrows. Font
// sizes stay fixed throughout; a narrower column just wraps onto more
// lines, same as any ordinary fluid paragraph. `flex-wrap` on the row lets
// the column drop below the CV rather than overflow if it ever runs out of
// room to shrink.
//
// All the margins/gaps/widths below are read directly off get_metadata (not
// hand-tuned), same convention as PartsGallery.tsx/FurnitureGallery.tsx. A
// content block that another element's margin is computed from (e.g. the EN
// paragraph, 237px tall in Figma) gets an explicit CSS height matching that
// Figma height, so the margin math is a fixed number, not dependent on how
// the browser happens to wrap/measure the text.
//
// The Korean body copy is set in Pretendard Medium in the design, distinct
// from the Helvetica used everywhere else on the site.
const pretendard = localFont({
  src: "../../../node_modules/pretendard/dist/web/static/woff2/Pretendard-Medium.woff2",
  weight: "500",
  display: "swap",
});

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

// Label width: 68px, the widest label ("introduction"). Label-to-content
// gap: 1164 (content x) - 872 (label x) - 68 (label width) = 224px.
const SECTION_LABEL_CLASS = "w-[68px] shrink-0 text-[13px] font-normal capitalize text-[#656565]";

function InfoSection({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-wrap gap-x-[224px] gap-y-3 ${className}`}>
      <h2 className={SECTION_LABEL_CLASS}>{label}</h2>
      <div className="min-w-[280px] flex-1">{children}</div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <div className="h-screen overflow-y-auto bg-[#f8f8f8] pt-16">
      {/* Row top margin: cv's own top (253) - header height (64) = 189.
          Row gap: label x (872) - cv right edge (0+753) = 119. Row right
          margin: frame width (1920) - Exhibition's right edge (1164+600),
          the widest content column, = 156. */}
      <div className="mt-[189px] flex flex-wrap items-start gap-x-[119px] gap-y-12 pr-[156px]">
        <div className="relative h-[518px] w-[753px] shrink-0 overflow-hidden">
          <Image src="/info/cv.png" alt="" fill className="object-cover" priority />
        </div>

        {/* The text column's own top (270) sits 17px below the cv's top
            (253) in Figma — they aren't top-aligned. */}
        <div className="mt-[17px] min-w-[320px] flex-1">
          <InfoSection label="introduction">
            {/* Fixed to Figma's own box height (237) so the Korean
                paragraph's margin-top below is a deterministic 51px
                (558 - 270 - 237), not dependent on how the browser wraps
                this text. */}
            <div className="h-[237px] text-[13px] leading-[1.7]">
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
            {/* Fixed to Figma's box height (223) so the next section's
                margin-top (190px, computed below) is deterministic too. */}
            <div
              className={`${pretendard.className} mt-[51px] h-[223px] text-[13px] leading-[1.75]`}
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
          </InfoSection>

          {/* Gap from the introduction section's bottom (270+237+51+223=781)
              to Exhibition's top (971) = 190. */}
          <InfoSection label="Exhibition" className="mt-[190px]">
            {/* Fixed to Figma's box height (308) so contact's margin-top
                below is deterministic (59px = 1338 - 971 - 308). */}
            <div className="h-[308px] text-[14px] leading-[2]">
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
          </InfoSection>

          {/* Gap from Exhibition's bottom (971+308=1279) to contact's top
              (1338) = 59. */}
          <InfoSection label="contact" className="mt-[59px]">
            <div className="max-w-[161px] text-[14px] lowercase leading-[1.5]">
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
          </InfoSection>
        </div>
      </div>

      {/* Contact content's bottom (1338+63=1401) to logo top (1620, the
          pre-existing bottom-preserving 87->75 height crop — see
          PartsGallery.tsx's footer) = 219. Logo top to copyright top
          (1688-1620=68), i.e. -7px from the logo box's own bottom
          (1620+75) — same convention as every other page's footer. */}
      <div className="mt-[219px] flex flex-col items-center pb-16">
        <div className="relative h-[75px] w-[69px]">
          <Image src="/main/logo.png" alt="" fill className="object-contain" />
        </div>
        <p className="mt-[-7px] text-[10px] whitespace-nowrap text-[#818181]">Eunji Wang©</p>
      </div>
    </div>
  );
}
