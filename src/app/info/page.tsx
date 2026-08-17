import Image from "next/image";
import { createFigmaGeom } from "@/lib/figma-layout";

// Figma "/info" frame (get_metadata nodeId 1:416): width=1920, height=1471.
const FRAME_WIDTH = 1920;
// Matches TopBar's h-16; Figma's nav row lives inside the same frame, so every
// content y-coordinate below has this subtracted to land relative to the page
// content that sits below the shared TopBar.
const TOPBAR_HEIGHT = 64;
const geom = createFigmaGeom(FRAME_WIDTH, TOPBAR_HEIGHT);

type PressLine = string | { text: string; href: string };

type PressRow = {
  tag: string;
  y: number;
  contentWidth: number;
  lines: PressLine[];
};

type ExhibitionRow = {
  year: string;
  y: number;
  contentWidth: number;
  lines: string[];
};

const INTRO_TEXT =
  "Wang Eunji is an emerging Korean designer who explores the relationship between objects and space through furniture. She collects, disassembles, and observes the small components of everyday objects—“parts” that often go unnoticed—and transforms their formal potential into furniture.";

// x/y/width for every row below are read directly off get_metadata (node ids
// 1:423-1:436) — not hand-tuned.
const PRESS_ROWS: PressRow[] = [
  {
    tag: "interview",
    y: 501,
    contentWidth: 300,
    lines: [
      "[2025.2, young meet interview]",
      "<Design+>, 2025 February, designer Wangeunji",
    ],
  },
  {
    tag: "press",
    y: 631,
    contentWidth: 308,
    lines: [
      { text: "interview", href: "https://saasaakunkun.com/interview-elle-decor" },
      "2022.3, magazine interview",
      "<Elle Decor>, 2022 March, by Kim chohye Editor",
    ],
  },
  {
    tag: "press",
    y: 773,
    contentWidth: 308,
    lines: [
      { text: "interview", href: "https://saasaakunkun.com/interview-elle-decor" },
      "2022.3, magazine interview",
      "<Elle Decor>, 2022 March, by Kim chohye Editor",
    ],
  },
];

const EXHIBITION_ROWS: ExhibitionRow[] = [
  {
    year: "2026",
    y: 1049,
    contentWidth: 423,
    lines: [
      "Collectible Brussels 2026, Vanderborght Building, Brussels, Belgium",
      "Presented Level Vase",
    ],
  },
  {
    year: "2025",
    y: 1128,
    contentWidth: 405,
    lines: [
      "Parts Hypothesisum, Sugeon and Hwahwan, Seoul, South Korea",
      "Solo exhibition; presented CT01 Table and installation works",
    ],
  },
  {
    year: "2024",
    y: 1205,
    contentWidth: 405,
    lines: ["Seoul Design Festival 2024: Young Designer Promotion, COEX, Seoul, South Korea"],
  },
];

export default function InfoPage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto bg-[#f8f8f8]">
      <div className="relative mx-auto w-full max-w-[1920px] px-6 py-12 lg:min-h-[1300px] lg:px-0 lg:py-0">
        <div
          className="figma-pin relative mx-auto mb-10 aspect-[813/1017] w-full max-w-[420px] overflow-hidden lg:mx-0 lg:mb-0 lg:max-w-none"
          style={geom(-4, 250, 813)}
        >
          <Image
            src="/info/intro-photo.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 43vw, 100vw"
            priority
          />
        </div>

        <section className="mb-10 lg:mb-0">
          <h2 className="figma-pin mb-2 text-sm font-bold lg:mb-0" style={geom(882, 270)}>
            Introduction
          </h2>
          <p
            className="figma-pin max-w-xl text-[13px] leading-relaxed lg:max-w-none"
            style={geom(1199, 273, 560)}
          >
            {INTRO_TEXT}
          </p>
        </section>

        <section className="mb-10 space-y-8 lg:mb-0 lg:space-y-0">
          <h2 className="figma-pin mb-2 text-sm font-bold lg:mb-0" style={geom(889, 501)}>
            Press
          </h2>
          {PRESS_ROWS.map((row, index) => (
            <div key={index} className="flex flex-col gap-1 lg:contents">
              <span className="figma-pin text-[14px]" style={geom(1199, row.y)}>
                {row.tag}
              </span>
              <div
                className="figma-pin space-y-0.5 text-[14px] leading-relaxed"
                style={geom(1354, row.y, row.contentWidth)}
              >
                {row.lines.map((line, lineIndex) =>
                  typeof line === "string" ? (
                    <p key={lineIndex}>{line}</p>
                  ) : (
                    <a
                      key={lineIndex}
                      href={line.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block underline"
                    >
                      {line.text}
                    </a>
                  ),
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-8 lg:space-y-0">
          <h2 className="figma-pin mb-2 text-sm font-bold lg:mb-0" style={geom(889, 1049)}>
            Exhibition
          </h2>
          {EXHIBITION_ROWS.map((row) => (
            <div key={row.year} className="flex flex-col gap-1 lg:contents">
              <span className="figma-pin text-[14px]" style={geom(1199, row.y)}>
                {row.year}
              </span>
              <div
                className="figma-pin space-y-0.5 text-[14px] leading-relaxed"
                style={geom(1354, row.y, row.contentWidth)}
              >
                {row.lines.map((line, lineIndex) => (
                  <p key={lineIndex}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
