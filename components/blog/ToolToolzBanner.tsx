export default function ToolToolzBanner() {
  return (
    <div className="my-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
      <p className="mb-1 font-semibold text-purple-800">ToolToolz — 내가 만든 도구 모음</p>
      <p className="mb-3 text-sm text-purple-600">
        개발하다가 필요한 도구가 없어서 직접 만들었어요. 무료로 사용할 수 있습니다.
      </p>
      <a
        href="https://tooltoolz.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
      >
        tooltoolz.com 방문하기 →
      </a>
    </div>
  )
}
