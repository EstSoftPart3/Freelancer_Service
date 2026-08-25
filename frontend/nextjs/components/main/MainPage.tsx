'use client'
// Mirrors vue_js/src/fo/views/MainPage.vue
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

export interface PopularProject {
  projectSq: number
  projectTtl: string
  companyNm: string
  projectAddress?: string
  projectExperience?: string
  formattedSalary: string
  projectSkills: string[]
  userTypeCd?: number
}

type SortType = 'views' | 'scraps' | 'apps'

type Slide = {
  title: string
  subtitle: string
  action: 'calendar' | 'ad'
  /** 배너 이미지 경로. 있으면 이미지로, 없으면 텍스트로 렌더한다 */
  imageUrl?: string
  /** 클릭 시 열 외부 링크. 없으면 "준비중입니다" 알러트 */
  linkUrl?: string
}

// 광고 3장은 현재 임시 소재(public/img/ads/*.svg)다.
// 실제 소재가 나오면 이미지 파일과 linkUrl 만 교체하면 된다.
const SLIDES: Slide[] = [
  {
    title: '관심있는 프로젝트 공고 일정\n달력에서 바로 확인하세요',
    subtitle: '스크랩한 기업 프로젝트의 모집 일정 캘린더에서 한눈에 확인하세요',
    action: 'calendar',
  },
  {
    title: '프리랜서 단가 협상 가이드',
    subtitle: '임시 광고 배너 1',
    action: 'ad',
    imageUrl: '/img/ads/ad-1.svg',
  },
  {
    title: 'IT 프리랜서 세무 상담',
    subtitle: '임시 광고 배너 2',
    action: 'ad',
    imageUrl: '/img/ads/ad-2.svg',
  },
  {
    title: '개발자 채용 브랜딩',
    subtitle: '임시 광고 배너 3',
    action: 'ad',
    imageUrl: '/img/ads/ad-3.svg',
  },
]

const FAQS = [
  {
    q: '프로젝트 지원은 어떻게 하나요?',
    a: '상세보기 페이지에서 지원하기 버튼을 클릭하여 포트폴리오와 함께 지원하실 수 있습니다.',
  },
  {
    q: '회원가입은 필수인가요?',
    a: '공고 열람은 비회원도 가능하나, 프로젝트 지원 및 스크랩 기능을 이용하시려면 회원가입이 필요합니다.',
  },
]

interface Props {
  // 서버에서 미리 조회한 인기 프로젝트(조회순) — SEO용으로 초기 HTML에 포함시킨다.
  initialProjects?: PopularProject[]
}

export default function MainPage({ initialProjects }: Props = {}) {
  const router = useRouter()
  const { getUserType, userTypeCd, isLoggedIn } = useUserStore()
  const userType = getUserType()

  const [currentSlide, setCurrentSlide] = useState(0)
  const [projects, setProjects] = useState<PopularProject[]>(initialProjects ?? [])
  // 모집중 공고만 노출하므로 정말 0건일 수 있다 — "불러오는 중"과 "없음"을 구분한다
  const [loading, setLoading] = useState(!initialProjects?.length)
  const [currentSort, setCurrentSort] = useState<SortType>('views')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = SLIDES.length

  const nextSlide = useCallback(() => setCurrentSlide((s) => (s + 1) % total), [total])
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + total) % total)

  // 자동 슬라이드 (Vue 원본에는 없으나 UX 개선)
  useEffect(() => {
    autoRef.current = setInterval(nextSlide, 5000)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [nextSlide])

  const handleSlideClick = (slide: Slide) => {
    if (slide.action === 'calendar') {
      if (!isLoggedIn()) {
        alertStore.show('로그인이 필요한 서비스입니다.', 'danger')
        router.push('/login')
        return
      }
      router.push('/mypage/calendar')
      return
    }
    // 광고 — 링크가 있으면 새 탭으로. noopener 는 열린 페이지가 window.opener 로
    // 우리 탭을 조작하는 것(탭네비깅)을 막는다.
    if (slide.linkUrl) {
      window.open(slide.linkUrl, '_blank', 'noopener,noreferrer')
      return
    }
    alertStore.show('준비중입니다.', 'danger')
  }

  const fetchPopularProjects = useCallback(async (sortType: SortType) => {
    setCurrentSort(sortType)
    setLoading(true)
    try {
      // /projects/popular 는 ApiResponse 없이 List<> 직접 반환
      const { data } = await api.get<PopularProject[]>('/projects/popular', {
        params: { sortType },
      })
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      console.error('[MainPage] 인기 프로젝트 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPopularProjects('views')
  }, [fetchPopularProjects])

  const goToProject = (project: PopularProject) => {
    // userTypeCd 302 = COMPANY → company spec, else user spec
    const path = userTypeCd === 302
      ? `/projects/company/${project.projectSq}`
      : `/projects/user/${project.projectSq}`
    router.push(path)
  }

  // userType 사용 억제 (Vue 원본과 동일하게 userType 기반 라우팅)
  void userType

  const toggleFaq = (i: number) => setActiveFaq(activeFaq === i ? null : i)

  return (
    <div className="bg-[#f8f9fa]">
      {/* 페이지 대표 h1 — 슬라이드 제목은 h2로 강등(페이지당 h1 1개 원칙), 시각적으로는 숨김 */}
      <h1 className="sr-only">Ctrl + F — IT 프리랜서와 기업을 연결하는 프로젝트 매칭 플랫폼</h1>

      {/* ── 배너 캐러셀 ── */}
      <section className="relative h-[64vh] w-full overflow-hidden">
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            onClick={() => handleSlideClick(slide)}
            className={cn(
              'absolute inset-0 cursor-pointer bg-white transition-opacity duration-500',
              i === currentSlide ? 'z-10 opacity-100' : 'z-0 opacity-0',
            )}
          >
            {slide.imageUrl ? (
              // object-cover 라 좌우가 잘린다 — 소재의 핵심은 가운데에 두어야 한다.
              <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center px-8 md:px-[140px]">
                <h2 className="mb-6 whitespace-pre-line text-center text-3xl font-bold leading-snug text-[#2c3e50] md:text-4xl">
                  {slide.title}
                </h2>
                <p className="text-center text-base text-muted-foreground md:text-lg">
                  {slide.subtitle}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* 이전/다음 버튼 */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* 도트 */}
        <div className="absolute bottom-6 right-12 z-20 flex gap-3">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                'h-3 cursor-pointer rounded-full border-2 border-muted-foreground transition-all',
                i === currentSlide ? 'w-8 bg-muted-foreground' : 'w-3 bg-transparent',
              )}
            />
          ))}
        </div>
      </section>

      {/* ── 인기 프로젝트 ── */}
      <section className="border-t border-[#e9ecef] bg-[#f8f9fa] px-4 py-10 md:px-[140px]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mb-0 text-xl font-bold">인기 프로젝트</h2>
            <p className="text-sm text-muted-foreground">지금 모집 중인 공고 가운데 관심이 높은 프로젝트입니다</p>
          </div>
          <div className="flex gap-2">
            {(['views', 'scraps', 'apps'] as SortType[]).map((sort) => (
              <button
                key={sort}
                onClick={() => fetchPopularProjects(sort)}
                className={cn(
                  'cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  currentSort === sort
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background text-muted-foreground hover:bg-muted',
                )}
              >
                {sort === 'views' ? '조회순' : sort === 'scraps' ? '스크랩순' : '지원순'}
              </button>
            ))}
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {projects.map((p) => (
              <div
                key={p.projectSq}
                onClick={() => goToProject(p)}
                className="cursor-pointer rounded-xl border bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <h5 className="mb-1 truncate text-base font-bold">{p.projectTtl}</h5>
                <p className="mb-1 text-sm text-muted-foreground">{p.companyNm}</p>
                {(p.projectAddress || p.projectExperience) && (
                  <p className="mb-2 text-xs text-muted-foreground">
                    {[p.projectAddress, p.projectExperience].filter(Boolean).join(' / ')}
                  </p>
                )}
                <div className="mb-3 inline-block rounded bg-blue-50 px-2 py-1 text-sm font-extrabold text-primary">
                  {p.formattedSalary}
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.projectSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1 text-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getSkillIconUrl(skill)} alt={skill} width={14} height={14} />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">프로젝트를 불러오는 중...</p>
        ) : (
          // 모집중 공고가 하나도 없을 때. 가짜로 채우지 않고 다음 행동을 제시한다
          <div className="rounded-xl border border-dashed bg-white py-12 text-center">
            <p className="text-sm font-medium">지금 모집 중인 프로젝트가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">
              새 공고가 등록되면 이곳에 바로 노출됩니다.
            </p>
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="mt-4 cursor-pointer rounded-full border border-input bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              전체 프로젝트 보기
            </button>
          </div>
        )}
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-[#e9ecef] bg-white px-4 py-12 md:px-[140px]">
        <div className="mb-6">
          <h2 className="text-xl font-bold">FAQ</h2>
          <p className="text-sm text-muted-foreground">궁금한 점이 있으시면 FAQ를 확인해보세요</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <button
                onClick={() => toggleFaq(i)}
                className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-muted/30"
              >
                {faq.q}
                <ChevronRight
                  className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', activeFaq === i && 'rotate-90')}
                />
              </button>
              {activeFaq === i && (
                <div className="border-t bg-[#fafafa] px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
