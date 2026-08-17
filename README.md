# eunji

상업용 가구 작업물 아카이빙 웹사이트

## 소개

작가의 상업용 가구 작업물을 아카이빙하는 정적 웹사이트입니다. 사용자 데이터나 서버 로직 없이, 이미지와 텍스트 콘텐츠를 정적으로 제공합니다. 디자인은 별도 Figma 작업물을 그대로 연동할 예정이며, 현재는 라우팅·기능 구조 위주로 구현되어 있습니다.

## 기술 스택

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Vercel (배포)

## 페이지 구조

- `/intro` — 공통 인트로 페이지
- `/main` — 약 60개 작업물 이미지를 비정형 배치로 보여주는 메인 페이지
- `/caption/[slug]` — 작품 개별 설명 페이지 (20개)
- `/info` — 작가 및 작업물 공통 정보 페이지

루트(`/`) 접속 시 `/intro`로 자동 연결됩니다.

## 개발 환경

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.
