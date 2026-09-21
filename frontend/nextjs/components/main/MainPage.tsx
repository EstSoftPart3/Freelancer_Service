'use client'
// Mirrors vue_js/src/fo/views/MainPage.vue
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, Info, MessageSquare, ThumbsUp, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import BestCriteriaInfo from '@/components/community/BestCriteriaInfo'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { BOARD_TYPE_LABEL, type BoardType } from '@/components/community/boardMeta'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import type { CommunityBestItem } from '@/types'

export interface PopularProject {
  projectSq: number
  projectTtl: string
  companyNm: string
  projectAddress?: string
  projectExperience?: string
  formattedSalary: string
  projectSkills: string[]
  userTypeCd?: number
  viewCnt?: number
  candidateCnt?: number
}

type Slide = {
  title: string
  subtitle: string
  action: 'ad' | 'salary'
  /** 배너 이미지 경로. 있으면 이미지로, 없으면 텍스트로 렌더한다 */
  imageUrl?: string
  /** 클릭 시 열 외부 링크. 없으면 "준비중입니다" 알러트 */
  linkUrl?: string
  /** 이미지가 없는 슬라이드의 배경색 — 미지정 시 흰 배경(bg-white) */
  bgClassName?: string
  /** 이미지가 없는 슬라이드의 글자색 — 미지정 시 기존 다크 텍스트 */
  textClassName?: string
}

// 광고 3장은 실소재(public/img/ads/*.webp, 2400x900).
// 광고주 랜딩 URL 이 아직 없어 linkUrl 은 비워 둔다 — 클릭하면 "준비중입니다" 가 뜬다.
// URL 을 받으면 각 슬라이드에 linkUrl 만 채우면 된다.
// Phase2: 캘린더 유도 슬라이드는 빼고, 연봉계산기 유도 슬라이드를 1번으로 올렸다.
const SLIDES: Slide[] = [
  {
    title: '내 연봉, 같은 연차 개발자 중 상위 몇 %일까?',
    subtitle: '직무·연차·기술스택 6가지만 입력하면 바로 확인할 수 있어요',
    action: 'salary',
    bgClassName: 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700',
    textClassName: 'text-white',
  },
  {
    title: '단가, 제대로 받고 계신가요? — 프리랜서 단가 협상 가이드 무료 배포',
    subtitle: '프리랜서 단가 협상 가이드 무료 배포',
    action: 'ad',
    imageUrl: '/img/ads/ad-1.webp',
  },
  {
    title: '종합소득세, 혼자 하지 마세요 — IT 프리랜서 전문 세무 상담 첫 달 무료',
    subtitle: 'IT 프리랜서 전문 세무 상담 첫 달 무료',
    action: 'ad',
    imageUrl: '/img/ads/ad-2.webp',
  },
  {
    title: '좋은 개발자, 어떻게 만나세요? — 개발자 채용 브랜딩 컨설팅',
    subtitle: '개발자 채용 브랜딩 컨설팅',
    action: 'ad',
    imageUrl: '/img/ads/ad-3.webp',
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

// 실제 모집 중인 공고가 하나도 없을 때 카드 그리드가 어떻게 보이는지 시연하기 위한 예시(더미) 세트.
// 실제 데이터가 있으면 절대 쓰이지 않는다 — projects.length === 0 && !loading 일 때만 렌더된다.
// 50건을 손으로 다 적는 대신, 조합 풀을 인덱스로 순환시켜 만든다(자연스러운 다양성 + 유지보수 용이).
const DUMMY_POOL = {
  companies: ['넥스트코어', '블루하버', '시프트랩스', '그리드포인트', '웨이브포지', '코드하버', '파인트리', '오르빗웍스', '클리어사인', '스카이라인테크', '브릿지웍스', '테라핀', '한빛소프트랩', '아이언메이플', '블랙박스랩', '퍼플섹터', '에이스포인트', '노바테크', '실버라인', '골든게이트'],
  titles: ['커머스 결제 시스템 백엔드 개발자', 'React 기반 어드민 프론트엔드 구축', '추천 시스템 데이터 파이프라인 구축', '쿠버네티스 인프라 자동화 DevOps', 'iOS/Android 하이브리드 앱 개발', '사내 데이터 대시보드 프론트엔드', '사내 ERP 고도화 백엔드', 'AI 챗봇 서비스 백엔드', '전자계약 플랫폼 프론트엔드', '물류 관제 시스템 DevOps', '실시간 알림 시스템 백엔드', '사내 CI/CD 파이프라인 구축', '헬스케어 예약 플랫폼 프론트엔드', '금융 리포트 자동화 백엔드', '사내 검색엔진 고도화'],
  locations: ['서울 강남구', '경기 판교', '원격', '서울', '서울 성수', '서울 여의도', '인천', '서울 을지로', '대전', '부산'],
  experiences: ['경력 2년 이상', '경력 3년 이상', '경력 4년 이상', '경력 5년 이상', '경력 6년 이상'],
  salaries: ['월 470만원', '월 480만원', '월 510만원', '월 560만원', '월 600만원', '월 630만원', '월 650만원', '월 690만원', '월 700만원', '월 720만원'],
  skillSets: [['Java', 'Spring', 'AWS'], ['React', 'TypeScript'], ['Python', 'AWS'], ['Kubernetes', 'AWS'], ['Kotlin', 'TypeScript'], ['Next.js', 'TypeScript'], ['Vue.js', 'TypeScript'], ['Docker', 'Kubernetes'], ['Node.js', 'TypeScript'], ['Python', 'FastAPI']],
}

function buildDummyProjects(count: number): PopularProject[] {
  return Array.from({ length: count }, (_, i) => ({
    projectSq: -(i + 1),
    projectTtl: DUMMY_POOL.titles[i % DUMMY_POOL.titles.length],
    companyNm: DUMMY_POOL.companies[i % DUMMY_POOL.companies.length],
    projectAddress: DUMMY_POOL.locations[i % DUMMY_POOL.locations.length],
    projectExperience: DUMMY_POOL.experiences[i % DUMMY_POOL.experiences.length],
    formattedSalary: DUMMY_POOL.salaries[i % DUMMY_POOL.salaries.length],
    projectSkills: DUMMY_POOL.skillSets[i % DUMMY_POOL.skillSets.length],
    viewCnt: 200 + ((i * 53) % 900),
    candidateCnt: 2 + ((i * 7) % 30),
  }))
}

const DUMMY_PROJECTS: PopularProject[] = buildDummyProjects(50)

interface Props {
  // 서버에서 미리 조회한 인기 프로젝트(조회순) — SEO용으로 초기 HTML에 포함시킨다.
  initialProjects?: PopularProject[]
}

// 프로젝트·게시글 카드는 서로 다른 그리드(좌/우 컬럼)에 있어 그리드 자동 늘어남으로는
// 높이가 안 맞는다 — 둘 다 같은 고정 높이에 flex-col + 하단 mt-auto 로 맞춘다.
// 프로젝트 카드는 원래 내용이 짧아 h-60에선 가운데가 비어 보였다 — h-52로 줄여 여백을 정리했다.
const MINI_CARD_HEIGHT = 'h-52'
// 카드 폭(2열 기준 약 300px 안쪽)에서 뱃지 2개 + "+N" 까지는 한 줄에 안전하게 들어간다.
const MAX_SHOWN_SKILLS = 2

function ProjectMiniCard({ p, onClick }: { p: PopularProject; onClick: () => void }) {
  const shownSkills = p.projectSkills.slice(0, MAX_SHOWN_SKILLS)
  const extraSkills = p.projectSkills.length - shownSkills.length
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex cursor-pointer flex-col rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
        MINI_CARD_HEIGHT,
      )}
    >
      <h5 className="mb-1 truncate text-sm font-bold">{p.projectTtl}</h5>
      <p className="mb-1 truncate text-sm text-muted-foreground">{p.companyNm}</p>
      <p className="mb-2 min-h-[1rem] truncate text-xs text-muted-foreground">
        {[p.projectAddress, p.projectExperience].filter(Boolean).join(' / ')}
      </p>
      <div className="mb-2">
        <span className="inline-block rounded bg-blue-50 px-2 py-1 text-sm font-extrabold text-primary">
          {p.formattedSalary}
        </span>
      </div>
      {/* 한 줄 높이로 고정 — 뱃지 개수를 얼마를 넣든 절대 잘리지 않고, 넘치는 건 항상 +N 으로만 보인다 */}
      <div className="flex h-6 flex-nowrap gap-1 overflow-hidden">
        {shownSkills.map((skill) => (
          <Badge key={skill} variant="secondary" className="flex shrink-0 items-center gap-1 text-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={getSkillIconUrl(skill)} alt={skill} width={14} height={14} />
            {skill}
          </Badge>
        ))}
        {extraSkills > 0 && <Badge variant="secondary" className="shrink-0 text-xs">+{extraSkills}</Badge>}
      </div>
      {(p.viewCnt != null || p.candidateCnt != null) && (
        <div className="mt-auto flex items-center gap-3 border-t pt-2 text-xs text-muted-foreground">
          {p.viewCnt != null && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              조회 {p.viewCnt}
            </span>
          )}
          {p.candidateCnt != null && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              지원 {p.candidateCnt}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function PostMiniCard({ item }: { item: CommunityBestItem }) {
  return (
    <Link
      href={`/${item.boardType}/${item.sq}`}
      className={cn(
        'flex flex-col gap-2 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md',
        MINI_CARD_HEIGHT,
      )}
    >
      <Badge variant="secondary" className="w-fit text-xs">
        {BOARD_TYPE_LABEL[(item.boardType ?? 'board') as Exclude<BoardType, 'all'>]}
      </Badge>
      <h5 className="line-clamp-2 min-h-10 text-sm font-bold leading-snug">{item.ttl}</h5>
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{item.userNickname}</span>
        <span className="shrink-0">{item.createdAt?.split('T')[0]}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {item.viewCnt}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {item.commentCnt}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {item.recommendCnt}
        </span>
      </div>
    </Link>
  )
}

export default function MainPage({ initialProjects }: Props = {}) {
  const router = useRouter()
  const { userTypeCd } = useUserStore()

  const [currentSlide, setCurrentSlide] = useState(0)
  const [projects, setProjects] = useState<PopularProject[]>(initialProjects ?? [])
  // 모집중 공고만 노출하므로 정말 0건일 수 있다 — "불러오는 중"과 "없음"을 구분한다
  const [loading, setLoading] = useState(!initialProjects?.length)
  // 조회 실패는 "공고 없음"과 다르다 — 실패했는데 예시(더미) 카드를 실제 추천처럼 보여주지 않도록 구분한다
  const [projectsFailed, setProjectsFailed] = useState(false)
  const [posts, setPosts] = useState<CommunityBestItem[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // 정렬 버튼 연타 시 늦게 보낸 요청이 먼저 응답한 요청 결과를 덮어써
  // "선택된 정렬"과 "표시된 목록"이 어긋나는 것을 막기 위한 요청 순번
  const sortRequestSeq = useRef(0)

  const total = SLIDES.length

  const nextSlide = useCallback(() => setCurrentSlide((s) => (s + 1) % total), [total])
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + total) % total)

  // 자동 슬라이드 (Vue 원본에는 없으나 UX 개선)
  useEffect(() => {
    autoRef.current = setInterval(nextSlide, 5000)
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [nextSlide])

  const handleSlideClick = (slide: Slide) => {
    if (slide.action === 'salary') {
      router.push('/salary/calculator')
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

  // Phase2: 정렬 탭(조회순/스크랩순/지원순)을 없애고 "조회수 높은 순" 하나로 고정했다 —
  // 기준은 추천 프로젝트 옆 안내 아이콘에 그대로 적어둔다.
  const fetchPopularProjects = useCallback(async () => {
    const requestId = ++sortRequestSeq.current
    setLoading(true)
    setProjectsFailed(false)
    try {
      // /projects/popular 는 ApiResponse 없이 List<> 직접 반환
      const { data } = await api.get<PopularProject[]>('/projects/popular', {
        params: { sortType: 'views' },
      })
      // 이 응답을 기다리는 동안 더 최신 정렬 요청이 나갔다면 폐기 — 느린 이전 응답이
      // 최신 정렬 버튼 선택 상태를 덮어써 목록과 선택이 어긋나는 것을 방지한다.
      if (requestId !== sortRequestSeq.current) return
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      if (requestId !== sortRequestSeq.current) return
      console.error('[MainPage] 인기 프로젝트 로드 실패')
      setProjectsFailed(true)
    } finally {
      if (requestId === sortRequestSeq.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialProjects?.length) fetchPopularProjects()
  }, [fetchPopularProjects, initialProjects])

  // 추천 게시글 — 커뮤니티 인기글과 같은 API(/community/best)를 직접 불러 카드로 렌더한다.
  // 기준은 월간 인기(최근 30일, 조회×1+댓글×2+추천×3)로 고정 — 탭 없이 안내 아이콘으로만 알려준다.
  // 노출량이 많아야 해서(서버 상한 20건) 주간보다 표본이 넉넉한 월간으로 잡았다.
  useEffect(() => {
    let cancelled = false
    setPostsLoading(true)
    api
      .get<{ output: CommunityBestItem[] }>('/community/best', { params: { period: 'monthly', size: 20 } })
      .then(({ data }) => { if (!cancelled) setPosts(data.output ?? []) })
      .catch(() => { if (!cancelled) setPosts([]) })
      .finally(() => { if (!cancelled) setPostsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const goToProject = (project: PopularProject) => {
    // userTypeCd 302 = COMPANY → company spec, else user spec
    const path = userTypeCd === 302
      ? `/projects/company/${project.projectSq}`
      : `/projects/user/${project.projectSq}`
    router.push(path)
  }

  const toggleFaq = (i: number) => setActiveFaq(activeFaq === i ? null : i)

  return (
    <div className="bg-[#f8f9fa]">
      {/* 페이지 대표 h1 — 슬라이드 제목은 h2로 강등(페이지당 h1 1개 원칙), 시각적으로는 숨김 */}
      <h1 className="sr-only">Ctrl + F — IT 프리랜서와 기업을 연결하는 프로젝트 매칭 플랫폼</h1>

      {/* ── 배너 캐러셀 — 아래 섹션들과 같은 좌우 폭(px-4 md:px-[140px])을 쓴다.
          높이는 기존 64vh 대비 1/3 수준으로 낮췄다. ── */}
      <section className="px-4 pt-6 md:px-[140px]">
        <div className="relative h-[220px] overflow-hidden rounded-2xl md:h-[260px]">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              onClick={() => handleSlideClick(slide)}
              className={cn(
                'absolute inset-0 cursor-pointer transition-opacity duration-500',
                slide.bgClassName ?? 'bg-white',
                i === currentSlide ? 'z-10 opacity-100' : 'z-0 opacity-0',
              )}
            >
              {slide.imageUrl ? (
                // object-cover 라 좌우가 잘린다 — 소재의 핵심은 가운데에 두어야 한다.
                <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center px-6 md:px-16">
                  <h2
                    className={cn(
                      'mb-2 whitespace-pre-line text-center text-xl font-bold leading-snug md:text-2xl',
                      slide.textClassName ?? 'text-[#2c3e50]',
                    )}
                  >
                    {slide.title}
                  </h2>
                  <p
                    className={cn(
                      'text-center text-sm md:text-base',
                      slide.textClassName ? 'text-white/85' : 'text-muted-foreground',
                    )}
                  >
                    {slide.subtitle}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* 이전/다음 버튼 */}
          <button
            onClick={prevSlide}
            className="absolute left-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-3 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* 도트 */}
          <div className="absolute bottom-3 right-4 z-20 flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  'h-2 cursor-pointer rounded-full border border-white/80 transition-all',
                  i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/30',
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 추천 프로젝트 · 추천 게시글 (2열, 각각 카드 그리드) ── */}
      <section className="border-t border-[#e9ecef] bg-[#f8f9fa] px-4 py-10 md:px-[140px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* 좌 — 추천 프로젝트 (기존 인기 프로젝트 API 재사용) */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold">추천 프로젝트</h2>
                <Popover>
                  <PopoverTrigger
                    aria-label="선정 기준 안내"
                    className="inline-flex shrink-0 cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-64 gap-0 text-xs">
                    <p className="font-semibold text-foreground">선정 기준</p>
                    <p className="mt-1">
                      지금 모집 중인 공고 가운데 <span className="font-medium text-foreground">조회수가 높은 순</span>으로 보여드려요.
                    </p>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-muted-foreground">지금 모집 중인 공고 가운데 관심이 높은 프로젝트입니다</p>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {projects.map((p) => (
                  <ProjectMiniCard key={p.projectSq} p={p} onClick={() => goToProject(p)} />
                ))}
              </div>
            ) : loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">프로젝트를 불러오는 중...</p>
            ) : projectsFailed ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>프로젝트를 불러오지 못했습니다.</p>
                <button
                  type="button"
                  onClick={fetchPopularProjects}
                  className="mt-3 cursor-pointer rounded-full border border-input bg-background px-4 py-1.5 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              // 모집중 공고가 하나도 없을 때 — 카드 그리드가 실제로 채워지면 어떤 모습일지 예시 데이터로 보여준다(시연용).
              <div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {DUMMY_PROJECTS.map((p) => (
                    <ProjectMiniCard
                      key={p.projectSq}
                      p={p}
                      onClick={() => alertStore.show('예시 데이터입니다. 실제 공고가 아니에요.', 'danger')}
                    />
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/projects')}
                    className="cursor-pointer rounded-full border border-input bg-background px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    전체 프로젝트 보기
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 우 — 추천 게시글 (커뮤니티 인기글 API 재사용, 카드형) */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-bold">추천 게시글</h2>
                <BestCriteriaInfo note="이 목록은 월간 인기(최근 30일 작성글) 기준입니다." />
              </div>
              <p className="text-sm text-muted-foreground">커뮤니티에서 지금 화제인 글입니다</p>
            </div>

            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {posts.map((item) => (
                  <PostMiniCard key={`${item.boardType}-${item.sq}`} item={item} />
                ))}
              </div>
            ) : postsLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">게시글을 불러오는 중...</p>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">표시할 게시글이 없습니다.</p>
            )}
          </div>
        </div>
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
