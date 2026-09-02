'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, Train } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ResumeSelectDialog from './ResumeSelectDialog'
import AffiliationApplyDialog from './AffiliationApplyDialog'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { incrementView } from '@/lib/viewCount'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { isRecruitEnded } from '@/lib/recruit'
import { formatHeadcountDetail } from '@/lib/headcount'
import type { ProjectDetail, RequiredSkillGroup } from '@/types'

interface Props {
  projectSq: string
  // UserProjectSpecPage.vue(개인 지원자 흐름) / CompanyProjectSpecPage.vue(소속원 대리지원 + 작성자 수정·삭제 흐름) 분기
  variant: 'user' | 'company'
  // 서버에서 미리 조회한 초기 데이터 — SEO용으로 초기 HTML에 본문을 포함시킨다.
  // isApplied/userRole/isScrap 등 사용자별 필드가 비로그인 기본값이므로 마운트 후 재조회로 갱신한다.
  initialData?: ProjectDetail | null
}

function SkillGroupList({ groups, label }: { groups: RequiredSkillGroup[]; label: string }) {
  if (groups.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      {groups.map((g) => (
        <div key={g.parentSkillTagNm} className="space-y-1">
          <p className="text-sm font-medium">{g.parentSkillTagNm}</p>
          <div className="flex flex-wrap gap-3">
            {g.childSkillTagNms.map((skill) => (
              <span key={skill} className="flex items-center gap-1.5 text-sm">
                <img src={getSkillIconUrl(skill)} alt={skill} width={20} height={20} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 수행 기간의 종료일은 「미정」(null)일 수 있다. 모집·인터뷰 기간은 항상 값이 있다.
function DateRange({ label, start, end }: { label: string; start: string; end: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{start} ~ {end || '미정'}</span>
    </div>
  )
}

// 근무 지역 노출 — 주소 타입에 따른 우선순위 (Vue displayAddress 그대로 이식)
function getDisplayAddress(p: ProjectDetail): string {
  if (p.addressTypeCd === 2701) {
    return p.detailedAddress ? `${p.detailedAddress} ${p.detailedAddressDetail || ''}`.trim() : (p.projectAddress || '정보 없음')
  }
  if (p.addressTypeCd === 2702) {
    return p.subwayAddress || p.projectAddress || '정보 없음'
  }
  return p.projectAddress || '정보 없음'
}

export default function ProjectSpec({ projectSq, variant, initialData }: Props) {
  const pid = Number(projectSq) // 상세 응답에 projectSq가 없어 라우트 파라미터를 사용
  const router = useRouter()
  const { isLoggedIn } = useUserStore()
  const [project, setProject] = useState<ProjectDetail | null>(initialData ?? null)
  const [loading, setLoading] = useState(!initialData)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [isRecruitmentEnded, setIsRecruitmentEnded] = useState(
    initialData ? isRecruitEnded(initialData.projectRecruitEndDt) : false,
  )

  useEffect(() => {
    // 조회수는 상세 GET에서 분리된 별도 API로 집계 — 실제 브라우저 방문만 카운트(크롤러/SSR 제외)
    incrementView(`/projects/${projectSq}`)
    api
      .get<{ output: ProjectDetail }>(`/projects/${projectSq}/details`)
      .then((r) => {
        setProject(r.data.output)
        setIsRecruitmentEnded(isRecruitEnded(r.data.output.projectRecruitEndDt))
      })
      .catch(() => {
        toast.error('프로젝트 정보를 불러올 수 없습니다.')
        router.push('/projects')
      })
      .finally(() => setLoading(false))
  }, [projectSq])

  async function handleScrap() {
    if (!project) return
    if (!isLoggedIn()) { toast.error('로그인이 필요합니다.'); return }
    const wasScrapped = project.isScrap === 1
    try {
      const { data } = await api.post(`/projects/${pid}/scraps`, {
        hasScrapped: wasScrapped,
        target: '프로젝트',
      })
      setProject((prev) =>
        prev ? { ...prev, isScrap: (wasScrapped ? 0 : 1) as 0 | 1, projectScrapCnt: data.output ?? prev.projectScrapCnt } : prev,
      )
      toast.success(wasScrapped ? '스크랩 해제에 성공하였습니다.' : '스크랩에 성공하였습니다.')
    } catch {
      toast.error('스크랩에 실패했습니다.')
    }
  }

  function handleApply() {
    if (!isLoggedIn()) { toast.error('로그인이 필요합니다.'); return }
    if (project?.isApplied === 1) {
      toast.error('이미 지원한 프로젝트입니다.')
      return
    }
    setApplyOpen(true)
    // GA4: project_apply
  }

  function handleApplied() {
    setProject((prev) => (prev ? { ...prev, isApplied: 1 } : prev))
  }

  async function handleDelete() {
    if (!project) return
    try {
      await api.delete(`/projects/${pid}`)
      toast.success('프로젝트가 삭제되었습니다.')
      router.push('/projects')
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  function handleEdit() {
    if (!project) return
    router.push(`/mypage/project-post/${pid}`)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!project) {
    return <p className="py-20 text-center text-muted-foreground">프로젝트를 불러올 수 없습니다.</p>
  }

  const isAuthor = project.userRole === 'COMPANY_AUTHOR'
  // 프로젝트 공고 지원 자격: 작성 소속(COMPANY_AUTHOR)만 제외. 소속(affiliation)은 '클랜'이라 고용주가 아니므로
  // 같은 소속원(COMPANY_MEMBER)도 프로젝트 공고엔 지원 가능(Vue의 '참여 불가' 차단은 도메인상 오답이라 제거).
  const canApply =
    project.userRole === 'PERSONAL' ||
    project.userRole === 'COMPANY_EXTERNAL' ||
    project.userRole === 'COMPANY_MEMBER'
  // Vue 원본 스크랩 노출 유지: User 페이지는 PERSONAL·COMPANY_EXTERNAL, Company 페이지는 COMPANY_EXTERNAL만
  const canScrap =
    variant === 'user'
      ? project.userRole === 'PERSONAL' || project.userRole === 'COMPANY_EXTERNAL'
      : project.userRole === 'COMPANY_EXTERNAL'

  return (
    <div className="mx-auto max-w-5xl">
      {/* DOM 순서 = 모바일 순서(제목·회사·지원버튼 먼저). 데스크톱은 md:order-*로 좌우를 되돌린다.
          order-first/last를 덧붙이는 대신 DOM 자체를 모바일 기준으로 두면 스크린리더 낭독 순서도 맞는다. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* 회사 정보 + 지원 CTA — 모바일 최상단 / 데스크톱 우측(sticky) */}
        <div className="md:sticky md:top-24 md:order-2 md:col-span-5 md:self-start">
          <Card className="relative">
            <div className="absolute right-3 top-3 text-xs text-muted-foreground">
              조회수: {project.projectViewCnt} · 지원 {project.projectCandidateCnt ?? 0}건
            </div>
            <CardHeader>
              <div className="flex items-center gap-4">
                <img
                  src={project.companyImageUrl || '/img/logos/Company_logo.png'}
                  alt={`${project.companyNm} 로고`}
                  className="h-[70px] w-[70px] shrink-0 rounded-full bg-muted object-contain"
                />
                <div className="min-w-0 flex-1">
                  {/* 페이지 대표 헤딩 — 프로젝트 상세엔 h1이 없어 SEO상 제목 계층이 비어 있었다 */}
                  <CardTitle className="text-lg">
                    <h1>{project.projectTtl}</h1>
                  </CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">{project.companyNm}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-wrap text-sm">{project.projectDetail}</p>

              <div className="space-y-1 border-t pt-4 text-sm text-primary">
                <DateRange label="모집 기간" start={project.projectRecruitStartDt} end={project.projectRecruitEndDt} />
                <DateRange label="인터뷰 기간" start={project.interviewStartDt} end={project.interviewEndDt} />
                <DateRange label="수행 기간" start={project.projectStartDt} end={project.projectEndDt} />
              </div>

              <Separator />

              {/* 액션 버튼 — Vue UserProjectSpecPage / CompanyProjectSpecPage 역할별 분기 그대로 이식 */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {canApply && project.isApplied === 0 && !isRecruitmentEnded && (
                  <Button onClick={handleApply}>지원하기</Button>
                )}
                {canApply && project.isApplied === 1 && (
                  <Button disabled>지원 완료</Button>
                )}
                {canApply && project.isApplied === 0 && isRecruitmentEnded && (
                  <Button variant="secondary" disabled>지원 마감</Button>
                )}

                {canScrap && (
                  <Button variant="outline" onClick={handleScrap} className="gap-1.5">
                    <Heart className={`h-4 w-4 ${project.isScrap === 1 ? 'fill-red-500 text-red-500' : ''}`} />
                    {project.isScrap === 1 ? '스크랩 해제' : '스크랩'} {project.projectScrapCnt}
                  </Button>
                )}

                {variant === 'company' && isAuthor && (
                  <>
                    <Button onClick={handleEdit}>수정하기</Button>
                    <Button variant="outline" onClick={() => setDeleteOpen(true)}>삭제하기</Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 지원 자격 / 근무 조건 — 모바일 하단 / 데스크톱 좌측 */}
        <Card className="md:order-1 md:col-span-7">
          <CardContent className="space-y-4">
            <h2 className="mb-2 text-lg font-semibold">지원 자격 / 근무 조건</h2>
            <SkillGroupList groups={project.projectRequiredSkills} label="필수 기술" />
            {project.projectRequiredSkills.length > 0 && project.projectPreferredSkills.length > 0 && <Separator />}
            <SkillGroupList groups={project.projectPreferredSkills} label="우대 기술" />
            <Separator />
            <div className="space-y-2 text-sm">
              {project.projectPreferredEtc && (
                <p><strong className="text-primary">우대 사항 :</strong> {project.projectPreferredEtc}</p>
              )}
              {project.recruitHeadcounts && project.recruitHeadcounts.length > 0 && (
                <p>
                  <strong className="text-primary">모집 인원 :</strong>{' '}
                  {formatHeadcountDetail(project.recruitHeadcounts, project.projectExperience)}
                </p>
              )}
              <p><strong className="text-primary">근무 형태 :</strong> {project.projectWorkType?.join(' / ')}</p>
              <p className="flex items-center gap-1.5">
                <strong className="text-primary">근무 지역 :</strong>
                {project.addressTypeCd === 2702 ? <Train className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {getDisplayAddress(project)}
              </p>
              {/* 협의 여부까지 포함된 문자열을 백엔드 formatSalary 가 만들어 준다
                  ('월 500만원' / '단가 협의' / '월 500만원 (협의 가능)') */}
              <p>
                <strong className="text-primary">단가 :</strong> {project.formattedSalary}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="프로젝트 삭제"
        message="한 번 삭제한 프로젝트는 복구할 수 없습니다. 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />

      {variant === 'user' ? (
        <ResumeSelectDialog
          open={applyOpen}
          projectSq={pid}
          onClose={() => setApplyOpen(false)}
          onApplied={handleApplied}
        />
      ) : (
        <AffiliationApplyDialog
          open={applyOpen}
          projectSq={pid}
          onClose={() => setApplyOpen(false)}
          onApplied={handleApplied}
        />
      )}
    </div>
  )
}
