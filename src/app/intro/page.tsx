import Link from "next/link";

export default function IntroPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
      {/* TODO: 파츠 조립 애니메이션 연동 예정. 아래 버튼은 애니메이션 없이 바로 이동하는 대체 경로 */}
      <Link
        href="/main"
        className="rounded border border-neutral-300 px-6 py-2 text-sm"
      >
        Enter
      </Link>
    </div>
  );
}
