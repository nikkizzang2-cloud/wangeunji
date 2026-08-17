export type Work = {
  id: number;
  slug: string | null;
  year: number;
  title: string;
  category: string;
  image: string | null;
  hoverImage: string | null;
  credit: string;
};

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];
const CATEGORIES = ["category-1", "category-2", "category-3", "category-4"];

// TODO: 실제 작업물 데이터(이미지, 연도, 카테고리, 캡션 보유 여부, 크레딧)로 교체 예정.
// 현재는 총 60개 중 앞 20개(id 1~20)에 캡션 페이지가 연결되어 있다고 가정한 placeholder 데이터.
export const works: Work[] = Array.from({ length: 60 }, (_, index) => {
  const id = index + 1;
  const hasCaption = id <= 20;

  return {
    id,
    slug: hasCaption ? `work-${String(id).padStart(2, "0")}` : null,
    year: YEARS[index % YEARS.length],
    title: `Work ${String(id).padStart(2, "0")}`,
    category: CATEGORIES[index % CATEGORIES.length],
    image: null,
    hoverImage: null,
    credit: "Credit — TBD",
  };
});

export const categories = CATEGORIES;

export function getWorkBySlug(slug: string) {
  return works.find((work) => work.slug === slug);
}

export function getAllCaptionSlugs() {
  return works
    .filter((work): work is Work & { slug: string } => work.slug !== null)
    .map((work) => work.slug);
}
