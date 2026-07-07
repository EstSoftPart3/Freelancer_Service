import type { Metadata } from 'next'
import CategoryTabs from '@/components/community/CategoryTabs'
import PopularWidget from '@/components/community/PopularWidget'
import QuickPostCard from '@/components/community/hub/QuickPostCard'
import CommunityBestSection from '@/components/community/hub/CommunityBestSection'
import LatestFeed from '@/components/community/hub/LatestFeed'
import CommunitySearchSidebar from '@/components/community/hub/CommunitySearchSidebar'
import { fetchCommunityBest, fetchLatestBoards, fetchSkillTagShortcuts } from '@/lib/community'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: '커뮤니티',
  description: '개발자 커뮤니티 허브 — 베스트글, 최신글, 인기 기술 태그를 한눈에.',
  path: '/community',
})

export default async function CommunityHubPage() {
  const [bestMonthly, bestWeekly, bestDaily, latest, skillTags] = await Promise.all([
    fetchCommunityBest('monthly', 5),
    fetchCommunityBest('weekly', 5),
    fetchCommunityBest('daily', 10),
    fetchLatestBoards(10),
    fetchSkillTagShortcuts(),
  ])

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <CategoryTabs />

      <div className="lg:flex lg:gap-6">
        <main className="min-w-0 flex-1">
          <QuickPostCard />
          <CommunityBestSection items={bestMonthly} />
          <LatestFeed items={latest} />
        </main>

        <aside className="mt-6 space-y-4 lg:mt-0 lg:w-[300px] lg:shrink-0">
          <CommunitySearchSidebar tags={skillTags} />
          <PopularWidget title="추천글" size={5} showTabs={false} initialPeriod="weekly" initialItems={bestWeekly} />
          <PopularWidget initialPeriod="daily" initialItems={bestDaily} />
        </aside>
      </div>
    </div>
  )
}
