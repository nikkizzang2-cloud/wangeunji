"use client";

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="mb-4 text-sm text-neutral-400">
          Close
        </button>
        {/* TODO: About 팝업 디자인/콘텐츠 연동 예정 */}
        <p className="text-sm text-neutral-500">
          About 내용은 추후 디자인 연동 시 채워질 예정입니다.
        </p>
      </div>
    </div>
  );
}
