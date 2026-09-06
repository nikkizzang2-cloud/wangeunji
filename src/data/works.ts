import { INSTAGRAM_URL } from "@/lib/constants";

export type CaptionWork = {
  slug: string;
  title: string;
  credit: string;
};

export type GalleryItem = {
  id: number;
  image: string | null;
  hoverImage: string | null;
  title: string;
  slug: string | null;
  instagramUrl: string | null;
};

const CAPTION_COUNT = 17;
const PARTS_COUNT = 53;

// TODO: 실제 캡션 콘텐츠(제목, 크레딧)로 교체 예정.
// parts/furniture 갤러리는 이 17개 캡션을 공유한다 (총 캡션 페이지 수 = 17).
export const captionWorks: CaptionWork[] = Array.from({ length: CAPTION_COUNT }, (_, index) => {
  const id = index + 1;
  return {
    slug: `work-${String(id).padStart(2, "0")}`,
    title: `Work ${String(id).padStart(2, "0")}`,
    credit: "Credit — TBD",
  };
});

// TODO: 실제 parts 이미지 53장으로 교체 예정.
// 앞 17개는 captionWorks와 1:1로 연결되고, 나머지 36개는 캡션 페이지 대신 Instagram으로 링크된다.
export const partsGallery: GalleryItem[] = Array.from({ length: PARTS_COUNT }, (_, index) => {
  const id = index + 1;
  const linkedCaption = captionWorks[index];

  return {
    id,
    image: null,
    hoverImage: null,
    title: linkedCaption ? linkedCaption.title : `Part ${String(id).padStart(2, "0")}`,
    slug: linkedCaption ? linkedCaption.slug : null,
    instagramUrl: linkedCaption ? null : INSTAGRAM_URL,
  };
});

// TODO: 실제 furniture 이미지 17장으로 교체 예정. captionWorks와 1:1로 연결된다.
export const furnitureGallery: GalleryItem[] = captionWorks.map((caption, index) => ({
  id: index + 1,
  image: null,
  hoverImage: null,
  title: caption.title,
  slug: caption.slug,
  instagramUrl: null,
}));

export function getCaptionBySlug(slug: string) {
  return captionWorks.find((caption) => caption.slug === slug);
}

export function getAllCaptionSlugs() {
  return captionWorks.map((caption) => caption.slug);
}
