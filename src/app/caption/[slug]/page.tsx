import { notFound } from "next/navigation";
import CaptionCarousel from "@/components/CaptionCarousel";
import { getAllCaptionSlugs, getWorkBySlug } from "@/data/works";

export function generateStaticParams() {
  return getAllCaptionSlugs().map((slug) => ({ slug }));
}

type CaptionPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CaptionPage({ params }: CaptionPageProps) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  return <CaptionCarousel work={work} />;
}
