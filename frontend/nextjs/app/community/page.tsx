import type { Metadata } from 'next'
import CategoryTabs from '@/components/community/CategoryTabs'
import PopularWidget from '@/components/community/PopularWidget'
import QuickPostCard from '@/components/community/hub/QuickPostCard'
import CommunityBestSection from '@/components/community/hub/CommunityBestSection'
import LatestFeed from '@/components/community/hub/LatestFeed'
import CommunitySearchSidebar from '@/components/community/hub/CommunitySearchSidebar'
import CommunitySearchForm from '@/components/community/hub/CommunitySearchForm'
import NoticeRollingBanner from '@/components/community/hub/NoticeRollingBanner'
import { fetchCommunityBest, fetchLatestBoards, fetchNotices, fetchSkillTagShortcuts } from '@/lib/community'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: '커뮤니티',
  description: '개발자 커뮤니티 허브 — 베스트글, 최신글, 인기 기술 태그를 한눈에.',
  path: '/community',
})

export default async function CommunityHubPage() {
  const [bestMonthly, bestWeekly, notices, latest, skillTags] = await Promise.all([
    fetchCommunityBest('monthly', 5),
    fetchCommunityBest('weekly', 20),
    fetchNotices(10),
    fetchLatestBoards(10),
    fetchSkillTagShortcuts(),
  ])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <CategoryTabs />

      {/* 좌: 검색+태그 / 중앙: 공지·베스트·글쓰기·새글 / 우: 추천글
          모바일은 order로 본문 → 검색·태그 → 추천글 순 세로 스택 */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="order-2 lg:order-none lg:w-[240px] lg:shrink-0">
          <CommunitySearchSidebar tags={skillTags} />
        </aside>

        <main className="order-1 min-w-0 flex-1 lg:order-none">
          <div className="mb-4 lg:hidden">
            <CommunitySearchForm />
          </div>
          <NoticeRollingBanner notices={notices} />
          <CommunityBestSection items={bestMonthly} />
          <QuickPostCard />
          <LatestFeed items={latest} />
        </main>

        <aside className="order-3 lg:order-none lg:w-[280px] lg:shrink-0">
          <PopularWidget title="추천글" size={20} showTabs={false} initialPeriod="weekly" initialItems={bestWeekly} scrollable />
        </aside>
      </div>
    </div>
  )
}
