export default function InfoPage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed text-neutral-700">
        {/* TODO: 실제 작가/작업물 소개 텍스트 및 이미지로 교체 예정 */}
        <p>작가 및 작업물에 대한 소개 텍스트가 이 영역에 들어갑니다.</p>
        <p>
          관련 자료는{" "}
          <a
            href="https://example.com"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            이 링크
          </a>
          에서 확인할 수 있습니다.
        </p>
        <div className="aspect-video w-full bg-neutral-200" />
      </div>
    </div>
  );
}
