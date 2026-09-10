// Real per-work content for /caption/[slug] — the center title block
// (workTitle/workSubtitleKo/workSubtitleEn) and the right-carousel text
// layer (정보1 Parts/type/size, 정보2 "for", 정보3 date, Group 249 캡션) —
// transcribed directly from the user's Pages/PDF document
// (/Users/isihyeon/Documents/eunji/text.pdf). "×" is used uniformly for the
// dimensions' multiplication sign even where the user typed a plain "x"
// (work-16/17), matching every other work here and the rest of the site.
//
// `workTitle` is the single title line (e.g. "Caster, 2026");
// `workSubtitleKo`/`workSubtitleEn` are the Korean/English sentences right
// below it — two separate fields (rather than one mixed string) so
// TitleBlock can render Korean in Pretendard and English in the page's
// default font, same split as captionKo/captionEn.
//
// `exhibition` is a string, except work-14 where the user gave it as an
// explicit 4-line example of "모든 글은 단위로 줄바꿈" — kept as that array.
// `captionKo`/`captionEn` lines render TIGHT (no gap) by default — most of
// the user's own line breaks here are just the source document's column
// wrap, not real paragraph breaks (e.g. work-16/17's two lines are one
// continuous sentence). An explicit `""` entry marks an actual blank line in
// the source and adds a real paragraph gap before the next line (see
// CaptionLines in CaptionCarousel.tsx) — used only where the user
// specifically called it out: work-01 (before "• •..."), work-07 (before
// "작업일지 서문"), work-08 (before "작업일지 中"). Every other work's
// multi-line captions stay tight on purpose, even where a heading-like
// "작업일지 中" line appears — only touch this where explicitly instructed.
// work-17 has no "For:" line in the source, so `exhibition` is omitted
// there.

export type CaptionContent = {
  workTitle: string;
  workSubtitleKo: string;
  workSubtitleEn: string;
  name: string;
  type: string;
  dimensions: string;
  exhibition?: string | string[];
  year: string;
  captionKo: string[];
  captionEn: string[];
};

export const CAPTION_CONTENT: Record<string, CaptionContent> = {
  "work-01": {
    workTitle: "Caster, 2026",
    workSubtitleKo: "연결된 구조 속에서 그들의 질문을 담고 굴러갈 구르마 세 대.",
    workSubtitleEn: "Three Gurumas that will roll through the interconnected structure, carrying their questions.",
    name: "caster",
    type: "wagon",
    dimensions: "550 × 270 × 770 mm",
    exhibition: "Offline Interview of Online Magazine",
    year: "2026",
    captionKo: [
      "작업일지 中",
      "텍스트 기반 미디어인 아워익스프레스의 콘텐츠에는 흐름이 있다. 이 문장을 읽은 뒤에 다음 문장을 읽을 수 있고, 이 페이지를 넘겨야 다음 페이지에 도달한다. 텍스트는 이러한 순서 속에서 소화되며 의미를 형성한다. 아워익스프레스가 결과보다 과정 속의 인물들을 기록하는 이유 역시 그러한데, (중략)",
      "",
      "• • 한 칸 한 칸 연결된 구조 속에서 그들의 질문을 담고 굴러갈 구르마 세 대.",
    ],
    captionEn: [
      "The content of Our Express, a text-based media, has a flow. Once you read one sentence, you can move on to the next; you have to turn the page to reach the one that follows. Text is absorbed in this sequence, and meaning emerges through it. This is also why Our Express chooses to document people in the midst of their processes rather than their outcomes. (…)",
      "",
      "• •Three guruma carts, rolling along within a structure of interconnected cells, carrying their questions with them.",
    ],
  },
  "work-02": {
    workTitle: "Channel, 2026",
    workSubtitleKo: "도자 유약 시편공을 거치하는 벽 선반.",
    workSubtitleEn: "A wall rack for displaying ceramic glaze test pieces.",
    name: "steel channel",
    type: "a rack",
    dimensions: "700 × 1800 × 180 mm",
    exhibition: "ceramic studio",
    year: "2026",
    captionKo: [
      "도자 유약 시편공을 거치하는 벽 선반.",
      "곡면에서 유약이 빛을 받을 때 어떤 흐름으로 색과 광택을 드러내는지 보이도록, 당구공 모양의 시편을 만드는 바바리안 스튜디오의 섬세한 시선에서 시작된 작업.",
    ],
    captionEn: [
      "This piece began with the careful observation of Barbarian ceramic studio, who creates billiard-ball–shaped samples to better see how glaze flows and how its color and sheen appear when light hits the curved surface.",
    ],
  },
  "work-03": {
    workTitle: "Muffler, 2026",
    workSubtitleKo: "구미코의 옷장은 아홉 개의 원이 안과 밖을 넘나드는 서커스와 같길 바랐다.",
    workSubtitleEn: "Gumiko's wardrobe was imagined as a circus where nine circles move freely between inside and outside.",
    name: "muffler",
    type: "system hanger",
    dimensions: "100 × 100 × 1800 mm (main)",
    exhibition: "miko",
    year: "2026",
    captionKo: [
      "작업일지 中",
      "구미코의 옷장은 아홉 개의 원이 안과 밖을 넘나드는 서커스와 같길 바랐다.",
      "원을 안으로 움푹 파 깊이를 만드니 구멍이 생겼다. 그 구멍 사이로 원을 통과시키니 길이를 지닌 기둥이 되었고, 툭 치니 짤뚱한 공이 나왔다. 이때 원은 옷을 보조하는 도형으로 상정했는데, 행거의 갈고리와 합이 좋았다.",
    ],
    captionEn: [
      "Gumiko's wardrobe was imagined as a circus, where nine circles move freely between the inside and the outside.",
      "Pushing the circles inward to create depth formed holes. Passing circles through those openings turned them into columns with length, and with a light tap, a stubby ball emerged. Here, the circle was conceived as a geometric element that supports the clothes, and it happened to work particularly well with the hooks of a clothes hanger.",
    ],
  },
  "work-04": {
    workTitle: "Level, 2026",
    workSubtitleKo: "수평기의 기울임으로 읽어내 돌봄의 때를 알려주는 화병.",
    workSubtitleEn: "A vase that signals the time for care by reading the tilt of a spirit level.",
    name: "level",
    type: "vase",
    dimensions: "600 × 20 × 1500 mm",
    exhibition: "flowers / water care",
    year: "2026",
    captionKo: [
      "The Level Vase는 '돌봄'을 무언가를 측정하는 행위가 아니라, 변화를 세심하게 읽어내는 행위로 새롭게 바라본다. 수평기를 기능적 장치이자 상징적 제스처로 결합했다. 꽃이 물을 흡수하면서 무게가 미세하게 달라지고, 이에 따라 수평기가 기울어진다.",
      "변화하는 각도는 조용한 신호가 되어, 다시 돌봄이 필요한 순간을 알려준다.",
    ],
    captionEn: [
      "The Level Vase reframes 'care' as an attentive act of reading change rather than measuring it. It integrates a spirit level as both a functional device and a symbolic gesture. As the flowers take in water, their weight subtly shifts, causing the level to tilt.",
      "The changing angle becomes a quiet signal, indicating when care is needed once again.",
    ],
  },
  "work-05": {
    workTitle: "Pipe Bracket, 2026",
    workSubtitleKo: "작업복과 일상복을 함께 걸 수 있는 한 쌍의 행거.",
    workSubtitleEn: "A pair of hangers for both workwear and everyday clothes.",
    name: "a pipe bracket",
    type: "a hanger",
    dimensions: "900 × 200 × 200 mm",
    exhibition: "creator's everyday lives",
    year: "2026",
    captionKo: [
      "작업복과 일상복을 함께 걸 수 있는 한 쌍 행거.",
      "지금도 손으로 무언가 만들고 있을 그녀의 일상을 지지하는 가구가 되렴 - - !",
    ],
    captionEn: [
      "A pair of clothes racks for hanging both workwear and everyday clothes.",
      "May you be a piece of furniture that supports her everyday life, as she continues to make things by hand even now.",
    ],
  },
  "work-06": {
    workTitle: "Vessel Lock, 2026",
    workSubtitleKo: "Eimalive 개인전 <LAYERED WORKS>를 위한 아카이빙북 기물 디자인.",
    workSubtitleEn: "Archival book display furniture designed for Eimalive's solo exhibition, <LAYERED WORKS>",
    name: "a vessel lock",
    type: "a bookshelf",
    dimensions: "340 × 1940 × 600 mm",
    exhibition: "Eimalive Layered Works Exhibition",
    year: "2026",
    captionKo: [
      "Eimalive 개인전 <LAYERED WORKS>를 위한 아카이빙북 기물 디자인.",
      "작가로부터 12권의 아카이빙 북을 받았다. 한 장 한 장이 쌓여 한 권이 되고, 하나의 전시가 열리기까지의 시간들이 중첩되어 있었다. 가구는 그 시간들이 각기 독자적으로 읽히면서도, 밀도가 흩어지지 않는 구조여야 했다.",
    ],
    captionEn: [
      "A furniture piece designed for the archiving book of Eimalive's solo exhibition, LAYERED WORKS.",
      "I received twelve copies of the archiving book from the artist. Each page had accumulated into a single volume, while the layers of time leading up to the exhibition had overlapped within it. The furniture needed to hold these layers in a structure where each moment could be read independently, without allowing their density to disperse.",
    ],
  },
  "work-07": {
    workTitle: "Swivel, 2025",
    workSubtitleKo: "종이를 투과하는 빛으로 직접 조도를 조절하는 조명.",
    workSubtitleEn: "A lamp that allows direct control of illuminance through light penetrating paper.",
    name: "swivel",
    type: "lamp, or paper rack",
    dimensions: "865 × 460 × 350 mm",
    exhibition: "Papers",
    year: "2025",
    captionKo: [
      "Swivel Lamp는 페이지를 넘기듯, 종이에 투과되는 빛의 양을 조절하여 감상자가 직접 독서 환경의 조도를 형성할 수 있는 조명입니다. 노출 제본 원리를 구현하는 swivel 파츠를 통해 12개의 원고를 한 권의 가구로 열람하실 수 있습니다.",
      "",
      "작업일지 서문",
      "덴탈 크리틱 기획서를 읽고 내가 해석한 이번 비평장은 일종의 대화장이었다. 각 가구는 비평의 대화를 돕는 도구로서, 어떻게 독자를 대화장으로 유도할 것인지에 집중하여 디자인하였다. 가구의 형태는 어떠한 행위를 이끌고, 그 행위가 반복되면 태도가 된다는 단순한 원리를 생각해보자. 내가 고려해야 할 사실은 다음과 같다. 원고를 발견하고, 집어 들고, 읽고, 다시 놓는 그 일련의 독해 행위들이 가구에서 일어난다는 사실과 이곳은 비평이 실천적 태도로 이루어지는 비평장이라는 것. 나의 가구는 이를 돕는 도구여야 한다.",
    ],
    captionEn: [
      "Swivel Lamp is an interactive light that transforms the act of reading into a sensory experience. Like turning pages, its adjustable swivel parts control the light passing through paper, shaping the atmosphere of viewing. It compiles 12 manuscripts into a single, book-like piece of furniture.",
      "After reading the proposal for Dental Critic, I understood the site of this critique as a kind of space for dialogue. Each piece of furniture was designed as a tool to facilitate this dialogue, focusing on how it could invite the reader into the space of conversation. Let us consider a simple principle: the form of furniture prompts an action, and when that action is repeated, it becomes an attitude. There were two things I needed to keep in mind. First, the act of reading—the process of discovering a manuscript, picking it up, reading it, and placing it back—would take place through the furniture itself. Second, this was a space of critique where criticism is practiced as an active attitude. My furniture, therefore, needed to be a tool that could support this process.",
    ],
  },
  "work-08": {
    workTitle: "T Track, 2025",
    workSubtitleKo: "벽기둥과 일체화되어 전면 문을 움직여 텍스트 노출을 조절하는 선반.",
    workSubtitleEn: "A shelf integrated with a wall column, adjusting text exposure by moving the front door.",
    name: "T track",
    type: "paper shelf",
    dimensions: "210 × 1700 × 20 mm",
    exhibition: "Papers",
    year: "2025",
    captionKo: [
      "벽기둥과 일체화된 Hide&Seek shelf는 선반 전면을 따라 움직이는 앞문과 그에 따라 달라지는 텍스트 노출 면적을 통해 보는 이의 호기심을 유도한다.",
      "",
      "작업일지 中",
      "폐관된 은우미술관의 잔재로 남아 있는 실내대문과 벽기둥은 이곳이 지닌 고유한 몰입장치처럼 보였다. 입구를 입구답게..",
    ],
    captionEn: [
      "The Hide&Seek Shelf is a bookshelf featuring a front-facing sliding door that moves along the shelf's facade. As the door shifts, it reveals or conceals varying portions of text, guiding the viewer's gaze in a playful, hide-and-seek manner. It functions as a visual device that captures and directs attention. As the front panel slides across the shelf, it alters the amount of visible text—inviting curiosity and engagement from the viewer.",
      "The interior gate and wall columns, remnants of the now-closed Eunwoo Museum, seemed to function as a unique device for immersion, belonging inherently to this place. To make the entrance feel like an entrance…",
    ],
  },
  "work-09": {
    workTitle: "Piano Hinge, 2025",
    workSubtitleKo: "개폐되는 텍스트 캐비넷.",
    workSubtitleEn: "An opening and closing text cabinet.",
    name: "piano hinge (180° rotation rate)",
    type: "display, or cabinet",
    dimensions: "700 × 1300 × 300 mm",
    exhibition: "Papers",
    year: "2025",
    captionKo: [
      "개폐되는 텍스트 캐비넷. 비치된 원고 아래에는 텍스트 삽입을 위한 틈이 있다. 틈을 통해 들어온 텍스트는 내부에 보관되었다가, 비평장이 막을 내리는 날, 캐비넷의 문이 열리며 유통된다.",
      "작업일지 中",
      "'전시 중(보관)'과 '전시 후(유통)'라는 두 가지 쓰임이 형태에서부터 읽히도록, 두 조각이 서로를 밀고 당기며 호흡하는 삼각꼴로 디자인하였다. 두 조각을 연결하는 수직면은 구조가 완전히 갈라졌을 때, 벽에 밀착되어 공간을 확보해주는 기특한 접착면으로 작동한다.",
      "(중략)",
    ],
    captionEn: [
      "The two-piece cabinet is a text receptacle that opens and closes. Beneath the manuscripts on display, a subtle slit invites new texts to be inserted. Once inside, the texts remain stored—until the closing day of the exhibition, when the cabinet opens, and circulation begins.",
      "Designed so that its two uses—\"during the exhibition (storage)\" and \"after the exhibition (distribution)\"—can be read directly from its form, the piece takes the shape of a triangular form in which two parts push and pull against each other, breathing together.",
      "When the two parts are fully separated, the vertical surface that connects them functions as a clever adhesive plane, sitting flush against the wall to secure additional space.",
    ],
  },
  "work-10": {
    workTitle: "Metaball, 2025",
    workSubtitleKo: "문이 벽이 되고, 벽이 문이 되는 공간.",
    workSubtitleEn: "A room where doors become walls and walls become doors.",
    name: "a stainless steel ball",
    type: "a fitting room",
    dimensions: "1440 × 1400 × 2010 mm",
    exhibition: "two — staff and guest",
    year: "2025",
    captionKo: [
      "작업일지 中",
      "문이 벽이 되고, 벽이 문이 되는 공간. 평소에는 문을 개방하여 거울을 노출시키고, 옷을 피팅할 때에는 문을 닫아 방으로 만든다. 안과 밖을 굴러가는 앙증맞은 스덴볼을 달고 데구르르- -",
    ],
    captionEn: [
      "A room where doors become walls, and walls become doors. In everyday use, the doors are opened to reveal mirrors, and when trying on clothes, they close to form a private room. Adorable stainless steel balls roll smoothly between inside and outside, adding a playful clatter-clatter movement.",
    ],
  },
  "work-11": {
    workTitle: "Foot Sole, 2025",
    workSubtitleKo: "책가도에서 튀어 나온 사형제 파티션.",
    workSubtitleEn: "A four-brothers partition emerging from the Chaekgado.",
    name: "a foot sole",
    type: "a space divider",
    dimensions:
      "a. 770 × 2000 × 80 mm, b. 770 × 1900 × 40 mm, c. 770 × 1895 × 40 mm, d. 770 × 1545 × 40 mm",
    exhibition: "mask hanging / display",
    year: "2025",
    captionKo: [
      "책가도에서 튀어 나온 사형제 파티션.",
      "가면의 양각(정면)과 음각(후면)의 매력이 동시에 보일 수 있도록 행잉 디피와 창의 열고 닫음을 활용하였다. 장남인 녀석에게는 발바닥을 달아 입구를 지키는 장승으로- -",
    ],
    captionEn: [
      "The \"Four Brothers Partition\" emerges boldly from the Chaekgado. By suspending the masks and playing with the opening and closing of the Changho screens, the display reveals the charm of both the embossed front and the engraved back at once.",
    ],
  },
  "work-12": {
    workTitle: "Distribution Board, 2025",
    workSubtitleKo: "발 달린 조각 기둥.",
    workSubtitleEn: "A column with feet.",
    name: "a distribution board",
    type: "a storage cabinet",
    dimensions: "335 × 400 × 2300 mm",
    exhibition: "a small pizza shop",
    year: "2025",
    captionKo: ["발 달린 조각 기둥."],
    captionEn: ["A column with feet."],
  },
  "work-13": {
    workTitle: "Socket Coupling, 2025",
    workSubtitleKo: "보관의 형태는 그 대상의 물성이 정한다는 것을 생각해보자.",
    workSubtitleEn: "Let us consider that the form of storage is determined by the materiality of its object.",
    name: "a socket coupling",
    type: "a carpet carrier",
    dimensions: "200 × 200 × 670 mm",
    exhibition: "Everything that can be rolled up",
    year: "2025",
    captionKo: [
      "작업일지 中",
      "보관의 형태는 그 대상의 물성이 정한다는 것을 생각해보자. 부피가 작고, 훼손이 적으며, 이동이 용이한 상태를 찾아야 한다.",
      "(중략)",
      "사람 손으로 직조한 튠드의 직물은 짜임이 단단하면서 동시에 유연했다. 이것의 두루마리 상태가 가장 자연스러운 이유였다.",
    ],
    captionEn: [
      "Let us consider that the form of storage is determined by the materiality of what is being stored. One must find a state in which the object occupies little volume, is less vulnerable to damage, and can be moved with ease.",
      "(…)",
      "Handwoven by people, Tuned's textile was both tightly woven and remarkably flexible. This was why its most natural state was as a roll.",
    ],
  },
  "work-14": {
    workTitle: "Snap Ring, 2025",
    workSubtitleKo: "스냅링의 고리를 끼워 층을 쌓아올리는 모듈 구조의 선반.",
    workSubtitleEn: "A modular shelf that stacks layers by connecting snap ring loops.",
    name: "Snap ring",
    type: "Shelf / Display",
    dimensions: "440 × 600 × 60 mm",
    exhibition: [
      "Preface Rack of",
      "@younhyun_official, @spacebe_official",
      "윤현상재의 'Small Sculpture' 시리즈 전시를",
      "위한 서문 집기",
    ],
    year: "2025",
    captionKo: [
      "스냅링의 고리를 끼워 층을 쌓아올리는 모듈 구조로, A1–A5의 규격 내에서 다양한 조합으로 구성할 수 있는 서문 선반입니다. 측면에는 동일 규격의 A series 용지를 보관할 수 있는 수납 간격을 두어 다음 전시 서문들이 함께 기록될 수 있는 공간으로 마련하였습니다. 창을 열어 너머의 서문을 함께 감상하실 수 있습니다.",
    ],
    captionEn: [
      "An introductory shelving system built as a modular structure, with layers stacked by connecting snap rings. It can be configured in various combinations within A1–A5 paper sizes.",
      "Along the side, storage compartments sized for A-series paper provide a space where the introductions of future exhibitions can be archived together. Open the window to discover and view the introduction beyond.",
    ],
  },
  "work-15": {
    workTitle: "Doorpin, 2025",
    workSubtitleKo: "교차하는 파이프 구조 속 책등을 통해 원고를 가장 먼저 보여주는 테이블.",
    workSubtitleEn: "A table that first reveals the manuscript through the book spine within an intersecting pipe structure.",
    name: "doorpin",
    type: "table",
    dimensions: "850 × 850 × 1100 mm",
    exhibition: "Papers",
    year: "2025",
    captionKo: [
      "작업일지 中",
      "등뼈에 해당하는 책등은 낱장의 종이를 하나로 엮어 책 전체를 단단히 지탱하며, 그 굴곡은 테이블 하단에 무늬로 드러난다.",
      "테이블 하단에는 수직의 철제 파이프와 수평의 종이 파이프가 교차하는데, 이때 교차점에 배치된 원고는 상판 아래에서 책등을 통해 가장 먼저 독자의 시선에 닿는다.",
    ],
    captionEn: [
      "The book's spine, like a backbone, binds individual sheets into a single, solid volume. Its curve reveals itself as a pattern beneath the table.",
      "Under the table, vertical steel pipes intersect with horizontal paper pipes, and at their crossing point lies a manuscript—its spine visible just below the tabletop, meeting the reader's gaze first.",
    ],
  },
  "work-16": {
    workTitle: "Clamp, 2024",
    workSubtitleKo: "지류를 임시 제본하여 수납하고, 수납공간의 각도를 조절할 수 있는 아카이빙 책상.",
    workSubtitleEn: "An archiving desk that temporarily binds and stores paper, with adjustable storage angles.",
    name: "clamp",
    type: "table",
    dimensions: "985 × 1425 × 800 mm",
    exhibition: "Papers",
    year: "2024",
    captionKo: [
      "CT01는 원고 단위의 아카이빙 지류들이 가구를 매개로 임시 제본되어 완결된 형태로 수납되고,",
      "창작 과정에서 늘어나는 종이 두께만큼 수납 공간의 각도를 조정할 수 있는 독특한 인터랙션을 지닌 수납형 책상이다. 이 인터랙션은 책상에서의 창작 활동을 집중시키고, 반복에서 오는 경직을 피하게 해준다.",
    ],
    captionEn: [
      "CT01 is a storage desk designed to archive and temporarily bind paper materials on a per-manuscript basis, presenting them in a complete form. The storage angle can be adjusted to accommodate the increasing thickness of paper that accumulates during the creative process. This interaction helps alleviate the inertia often experienced in repetitive creative activities.",
    ],
  },
  "work-17": {
    workTitle: "Pulley, 2021",
    workSubtitleKo: "자작시 <하나인 동시에 모두를>를 가구의 형태로 전환한 사이드 테이블.",
    workSubtitleEn: "A side table that translates the self-written poem One and All at Once into furniture form.",
    name: "pulley",
    type: "side table",
    dimensions: "400 × 400 × 750 mm",
    year: "2021",
    captionKo: [
      "작가의 자작시 <하나인 동시에 모두를>에서 비롯되어 시의 언어를 가구의 형태로 전환한 작품으로,",
      "꽃 한송이와의 교감을 보조하는 도르래 구조는 시간의 변화에 따른 물의 무게에 반응하여, 인사를 건네듯 올라오는 꽃의 움직임을 통해 꽃이 물을 필요로 하는 시점을 알아차릴 수 있도록 한다.",
    ],
    captionEn: [
      "Originating from the artist's own poem, One and All at Once, this work translates the language of the poem into the form of furniture. A pulley mechanism that facilitates an interaction with a single flower responds to the changing weight of water over time. As the flower rises as if offering a greeting, its movement allows us to notice when it needs water.",
    ],
  },
};
