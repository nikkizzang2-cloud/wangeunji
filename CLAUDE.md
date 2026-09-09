@AGENTS.md

# CLAUDE.md

이 파일은 이 저장소에서 작업하는 Claude Code에게 프로젝트 맥락을 제공합니다.

## 프로젝트 개요

상업용 가구 작업물을 아카이빙하는 포트폴리오 웹사이트. 사용자 데이터를 다루지 않는 정적 콘텐츠 중심 사이트이며, 별도 백엔드/DB 없이 프론트엔드만으로 구성한다.

디자인은 별도로 진행 중인 Figma 작업물을 그대로 연동할 예정이다. Figma 디자인이 완료되기 전까지는 시각적 구현(정확한 레이아웃, 애니메이션, 스타일)을 만들지 않고, 라우팅·상태·데이터 구조 등 기능적 뼈대만 보수적으로 구현한다.

## 기술 스택

- **프레임워크**: Next.js (App Router) + TypeScript
- **렌더링**: 정적 생성(SSG) — 서버 API, DB 없음
- **스타일링**: Tailwind CSS
- **이미지 최적화**: `next/image`
- **콘텐츠 관리**: 코드베이스 내 로컬 데이터 파일(`/src/data`)로 이미지·캡션 메타데이터 관리. CMS 미사용
- **배포**: Vercel

## 페이지 구조

| 라우트 | 설명 | 페이지 수 |
|---|---|---|
| `/intro` | 루트 도메인 접속 시 자동 연결되는 공통 인트로 | 1 |
| `/main` | `/main/parts`로 리다이렉트 | - |
| `/main/parts` | parts 이미지 53개 그리드 (Figma 연동 완료) | 1 |
| `/main/furniture` | furniture 이미지 17개 그리드 (Figma 연동 완료) | 1 |
| `/caption/[slug]` | parts/furniture가 공유하는 개별 작품 설명 페이지 | 17 |
| `/info` | `/main` 상단 Info 버튼으로 접근하는 작가·작업물 공통 정보 페이지 (Figma 연동 완료) | 1 |

루트(`/`)는 `/intro`로 리다이렉트한다.

## 기능 요구사항 (현재까지 전달받은 내용)

### 공통 (모든 페이지)

- 상단바(TopBar)가 모든 화면에 공통으로 존재한다. `position: fixed`로 페이지 콘텐츠 위에 떠 있는 오버레이이며 배경 없음(투명) — 스크롤하면 콘텐츠가 헤더 뒤로 실제로 지나가면서 비쳐 보인다(문서 흐름에서 공간을 차지하는 sticky 방식이 아님). 각 페이지의 최상위 스크롤 컨테이너는 `h-screen` + `pt-16`으로 헤더 높이만큼 초기 여백을 확보한다. 텍스트는 Wang eun ji만 볼드 14px, 나머지(home/info/contact)는 레귤러 13px.
  - **Wang eun ji**: 클릭 시 `/intro`로 라우팅
  - **home**: 클릭 시 `/main/parts`로 라우팅. 기존 About 팝업은 `/main` Figma 연동 시 이 버튼으로 대체되어 제거됨
  - **info**: 클릭 시 `/info`로 라우팅
  - **contact**: 클릭 시 `mailto:` 링크로 메일 작성 창 실행. 수신 주소는 `src/lib/constants.ts`의 `CONTACT_EMAIL` 상수로 관리 (현재 플레이스홀더, 확정 시 교체)

### `/intro`
- 2개의 이미지가 배치되어 있고, 오른쪽 파츠를 왼쪽으로 드래그해 일정 거리 이동시켜 정렬되면 `/main/parts`로 이동 (드래그 인터랙션은 구현, 실제 이미지·정확한 간격/정렬 기준은 Figma 연동 시 교체 예정)
- 스크롤 불가

### `/main/parts`
- 오른쪽 사이드에 parts / furniture 내비게이션이 있고, 클릭하면 각각 `/main/parts` / `/main/furniture`로 이동한다 (현재 페이지는 굵게 표시). 두 페이지가 이 내비게이션을 공유한다 (`src/components/MainSideNav.tsx`)
- 53개의 불규칙한 크기 이미지를 직사각형 공간 내에 배치 (Figma 연동 완료)
- 53개 중 17개는 `/caption/[slug]`로 연결되며, 호버 시 이미지 전환 + 텍스트 레이어 노출
- 나머지 36개는 캡션 페이지가 없고, 호버 시 이미지가 어두워지며 텍스트 레이어 노출, 클릭 시 Instagram(`src/lib/constants.ts`의 `INSTAGRAM_URL`, 현재 플레이스홀더)으로 새 탭 이동
- 세로 스크롤 가능
- 상단에 작가 소개 문구, 하단에 로고·저작권 텍스트 포함

### `/main/furniture`
- `/main/parts`와 동일한 parts / furniture 내비게이션 공유
- 17개의 이미지가 배치되어 있고, 전부 `/caption/[slug]`로 연결 (parts의 17개 캡션과 동일한 슬러그를 공유) (Figma 연동 완료, `src/components/FurnitureGallery.tsx`)
- 각 이미지 호버 시 이미지 전환 + 텍스트 레이어 노출
- 연도 구분 라벨(2026/2025/2024/2021) 포함
- 상단에 작가 소개 문구, 하단에 로고·저작권 텍스트 포함 (parts와 동일)
- 실제 사진은 아직 전달되지 않아 회색 placeholder 상태

### `/caption/[slug]` (Figma 연동 완료, get_metadata nodeId 72:1167 "caption" / 72:1145 "caption.textframe" — 후자는 우측 캐러셀이 이미지를 다 돌고 텍스트 레이어가 뜬 상태)
- parts(17개)와 furniture(17개, 동일한 작품)가 공유하는 17개 개별 페이지. `src/components/CaptionCarousel.tsx`
- 중앙 구분 영역을 기준으로 좌우에 큰 이미지/영상 스택 배치. 좌측은 끝까지 넘기면 바로 처음으로 순환하고, 우측은 끝까지 넘기면 이미지 스택 개수+1번째 "칸"에서 정보1(Parts/type/size)·정보2(for+전시)·정보3(date)·국영문 캡션 텍스트 레이어가 뜬 뒤 처음으로 순환한다 (`src/data/captionMedia.ts`가 각 work의 left/right 이미지 개수를 그대로 캐러셀 길이로 씀)
- 이미지 크롭: 기본은 object-cover(꽉 채움), 가로가 세로보다 긴(landscape) 이미지만 예외로 가로 크기에 맞춰 object-contain (비율 왜곡 없이, 위아래 레터박스 허용)
- 텍스트 레이어의 정보1~정보2~정보3~캡션 그룹 간 간격은 Figma의 개별 좌표(23px/31px/55px, 인스턴스마다 들쭉날쭉)를 그대로 옮기지 않고, 콘텐츠 길이가 달라져도 간격이 유지되도록 균일한 flex gap(24px)으로 통일했다 — 여백(아래 55px/오른쪽 78px)은 Figma 값 그대로 고정.
- 사각형/디렉토리 규칙: 사용자가 `/Users/isihyeon/Documents/eunji/image/caption/workNN-이름/{left,right}/`에 넣어준 파일을 파일명 앞자리 숫자 순으로 정렬(`left`는 `drawing*` 파일을 항상 마지막으로), `public/caption/work-NN/{left|right}-K.ext`로 리사이즈(최대 2400px)·재압축(JPEG q85, PNG→JPEG 변환 포함, 애니메이션 GIF·영상은 원본 유지)해서 옮긴다 — 원본이 개별 파일 최대 100MB대(총 1.2GB)라 그대로 커밋할 수 없었다.
- `workTitleLines`/`workSubtitle`/`exhibition`/`year`/`captionKo`/`captionEn`은 아직 사용자가 실제 콘텐츠를 전달하지 않아 `null`(placeholder "TBD") 상태 — `partsInfo`(Parts/type/size)만 기존 `PARTS_INFO`를 그대로 재사용해 실제 값이 채워져 있다.
- 스크롤 불가

### `/info`
- 좌측 CV 이미지 + 우측 Introduction(영문/국문)·Exhibition·Contact 섹션 (Figma 연동 완료, get_metadata nodeId 16:2)
- 국문 본문은 Pretendard Medium(`pretendard` npm 패키지, `next/font/local`로 로드), 그 외 전부 Helvetica — 폰트 크기·줄간격은 Figma 값 그대로(예: 영문 13px/leading 1.7, 국문 13px/leading 1.75, Exhibition 14px/leading 2)
- Exhibition 목록 중 일부 항목은 외부 링크 포함, Contact의 인스타그램도 외부 링크
- 스크롤 가능

## 데이터 구조 (`src/data/works.ts`)

- `captionWorks` (17개): 캡션 페이지의 원본 데이터(slug/title + `/caption` 텍스트 레이어용 workTitleLines/workSubtitle/partsInfo/exhibition/year/captionKo/captionEn). parts와 furniture 갤러리가 이 슬러그를 공유한다.
- `partsGallery` (53개): 앞 17개는 `captionWorks`와 1:1로 연결(`slug` 존재), 나머지 36개는 `instagramUrl`만 존재.
- `furnitureGallery` (17개): `captionWorks` 전체와 1:1로 연결.
- 모든 `image`/`hoverImage`는 현재 `null` 플레이스홀더 — 실제 이미지는 Figma 연동 시 채운다.

## Figma 연동

Figma Dev Mode MCP Server를 통해 실제 디자인을 코드로 옮긴다.

- 프로젝트 루트의 `.mcp.json`에 `figma-desktop` 서버가 `http://127.0.0.1:3845/mcp`로 등록되어 있다.
- 사용 전제: Figma 데스크톱 앱에서 해당 파일을 열고 Dev Mode를 켜야 로컬 서버가 뜬다. 새 세션을 열 때 이 MCP 서버 연결 승인 프롬프트가 뜨면 승인한다.
- 작업 방식: Figma에서 프레임/컴포넌트를 선택한 뒤 "이 프레임 코드로 만들어줘"처럼 요청하면, 선택된 노드의 코드/스타일/변수/이미지를 가져와 기존 컴포넌트(`src/components`, `src/app/*/page.tsx`)에 반영한다.
- 페이지별로 디자인이 완료되는 대로 하나씩 순서대로 연동한다 (전체를 한 번에 하지 않는다).

### 배치/크기 정확도 (비율 어긋남 방지)

Figma 디자인을 코드로 옮길 때 `get_design_context`가 주는 `left-[calc(8.33%+78px)]` 같은 값이나, 직접 flex/grid로 간격을 눈대중 추정하지 말고 아래 순서를 따른다:

1. `get_metadata`로 대상 프레임과 각 노드의 정확한 `x`, `y`, `width`, `height`(프레임 기준 로컬 좌표)를 가져온다.
2. `src/lib/figma-layout.ts`의 `createFigmaGeom(frameWidth, topBarHeight)` 헬퍼로 좌표를 변환한다.
   - 가로(`left`, `width`)는 프레임 너비 대비 `%`로 변환 — 화면 폭에 비례해서 스케일된다.
   - 세로(`top`)는 고정 `px` 오프셋으로 변환 — 페이지 높이는 프레임 높이가 아니라 콘텐츠 길이로 결정되므로 `%`로 만들지 않는다.
3. 요소에 `.figma-pin` 클래스(`globals.css`에 정의)를 붙이고 `style={geom(x, y, w?)}`로 좌표를 넣는다. 이 클래스는 `lg`(1024px) 이상에서만 `position: absolute`로 정확한 배치를 적용하고, 그 아래에서는 `position: static`으로 자연스러운 문서 흐름을 유지한다 — 모바일 디자인이 별도로 없기 때문.
4. `figma-pin`은 페이지 콘텐츠 요소 배치에 쓴다. TopBar는 예외로 아래 참고 — 위치·크기 비율이 항상 Figma와 정확히 일치해야 하는 오버레이라 `container query units` 방식을 쓴다.

이 패턴을 벗어나 좌표/간격을 직접 추정하는 방식은 지양한다 — 실제로 한 번 이 문제로 상단바/본문 배치가 디자인과 어긋난 적이 있다.

**예외 — `PartsGallery`/`FurnitureGallery`/`/info` 전체**: 화면 폭이 줄어도 요소 크기·배치·폰트 크기 비율이 Figma와 정확히 일치해야 하면서 동시에 가로 스크롤도, 텍스트 줄바꿈에 따른 겹침도 생기면 안 된다는 요청에 따라, 이 페이지들은 `figma-pin`(퍼센트 스케일링 + `lg` 반응형 폴백)을 전혀 쓰지 않는다. 대신:

1. 모든 요소를 Figma의 실제 `x`/`y`/`width`/`height`(get_metadata 원본값)로 고정 `px` 캔버스(예: parts는 1920×7030, furniture는 1920×3147, info는 1920×1670) 안에 `position:absolute`로 배치한다 — 좌표를 %로 변환하지 않는다. 폰트 크기도 Figma 값 그대로 고정 px로 쓴다. 디자인이 개정되면(사각형 크기/배치가 바뀌면) `get_metadata`로 새 좌표를 다시 받아 `TILE_GEOM` 등을 통째로 교체한다 — parts는 Rectangle N ↔ `PARTS_RECTANGLE_NUMBERS`(works.ts) 순서가, furniture는 Rectangle fN ↔ id 1:1 매핑이 유지되는 한 사진 파일은 그대로 두고 크기(`object-cover`)만 새 박스에 맞게 자동으로 다시 크롭된다.
2. 이 고정 캔버스를 `.figma-canvas-frame`/`.figma-canvas-scaler`/`.figma-canvas-content`(`globals.css`, `src/lib/figma-layout.ts`의 `px()` 헬퍼와 함께 사용)로 감싸서, 캔버스 전체(폰트 크기 포함)를 화면 폭에 맞게 CSS `container query units`로 균일하게 축소/확대한다 — 이미지가 화면에 맞춰 줄어드는 것처럼, 내부 배치·줄바꿈·폰트 비율이 전혀 바뀌지 않고 항상 화면에 정확히 맞는다.

(처음엔 `flex-wrap + gap:15px`로 만들었다가 화면 폭에 따라 재배열되어 디자인과 달라지는 문제가 있었고, 그다음엔 고정 1920px 캔버스 + 가로 스크롤로 바꿨다가 가로 스크롤 자체가 문제가 되어 스케일링 방식으로 정착했다. `/info`는 처음엔 `figma-pin`으로 만들었는데, 좌우 위치는 %로 스케일되면서 폰트 크기는 고정이라 좁은 화면에서 본문이 의도보다 더 줄바꿈되어 아래 섹션과 겹치는 문제가 생겨 같은 캔버스 스케일링 방식으로 교체했다.) `MainSideNav`는 이 모드를 위해 `pinned`/`topbarHeight` prop을 지원한다 — `figma-canvas-content` 내부에 렌더링되므로 좌표는 캔버스와 함께 통째로 스케일된다.

**TopBar**: 콘텐츠 캔버스와 별도로 `position: fixed`인 오버레이라 위 `figma-canvas-*` 스케일링에 얹혀가지 못한다. 처음엔 `figma-pin`(left만 %, top은 고정 px)을 쓰고 폰트 크기만 별도로 `cqw`로 스케일했는데, top이 스케일되지 않아 화면 폭이 좁아질수록 콘텐츠 캔버스는 통째로 줄어드는데 툴바만 제자리에 남아 툴바-본문 간격이 Figma 비율과 어긋나는 문제가 있었다(1920px 기준으로는 정확히 맞아 보여서 발견이 늦었다). 그래서 `figma-pin`을 버리고 left/top/font-size 전부를 `cqw(px) = calc(100cqw * (px/1920))` 하나로 통일했다 — `TopBar.tsx` 참고. 헤더 자체 박스 높이(`h-16`)와 페이지의 `pt-16`은 고정으로 유지한다(헤더가 스크롤 콘텐츠 위에 뜨는 별도 레이어라는 요구사항 자체는 그대로이므로).

## 작업 원칙

- 사용자가 채팅으로 명시한 내용만 구현한다. 요청받지 않은 기능·페이지·추상화를 미리 만들지 않는다.
- 단계별로 순차 진행하며, 각 단계 완료 후 다음 지시를 기다린다.
- Figma 디자인이 연동되기 전까지는 정확한 시각적 레이아웃을 임의로 만들지 않는다. 기능/구조 골격 위주로 구현한다.
- 백엔드/DB/사용자 인증은 현재 요구사항에 없으므로 추가하지 않는다.
