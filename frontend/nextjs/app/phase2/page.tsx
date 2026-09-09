// 🔴 임시 데모용 — Phase2 리뷰가 끝나고 실제로 반영하기로 결정되면 가장 먼저 지울 파일.
// 새로 만들거나 바뀐 화면을 한 곳에서 훑어볼 수 있게 링크만 모아둔 목록 페이지.
import Link from 'next/link'

const SCREENS: { group: string; items: { label: string; href: string; note: string }[] }[] = [
  {
    group: '헤더 · 메인',
    items: [
      { label: '홈 (헤더 2단 구성 확인)', href: '/', note: '완료' },
    ],
  },
  {
    group: '연봉',
    items: [
      { label: '연봉계산기', href: '/salary/calculator', note: '완료' },
      { label: 'AI 분석 중', href: '/salary/analyzing', note: '완료(자동으로 리포트로 이동)' },
      { label: '연봉 리포트', href: '/salary/report', note: '완료(계산기부터 진행해야 값이 보임)' },
      { label: '연봉순위표', href: '/salary/ranking', note: '준비 중' },
    ],
  },
  {
    group: '커뮤니티',
    items: [
      { label: '커뮤니티 홈 (헤더 메가메뉴로 진입)', href: '/community', note: '기존 화면 재사용' },
      { label: '투표', href: '/vote', note: '준비 중' },
    ],
  },
  {
    group: '면접후기',
    items: [
      { label: '면접후기 목록', href: '/interview', note: '준비 중' },
      { label: '면접후기 작성', href: '/interview/write', note: '준비 중' },
    ],
  },
]

export default function Phase2DemoHubPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="mb-2 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        임시 데모 허브 — 반영 전 삭제
      </p>
      <h1 className="mb-8 text-2xl font-bold">Phase2 화면 모음</h1>
      <div className="flex flex-col gap-8">
        {SCREENS.map((g) => (
          <div key={g.group}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{g.group}</h2>
            <div className="flex flex-col gap-2">
              {g.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border bg-white p-4 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.note}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
