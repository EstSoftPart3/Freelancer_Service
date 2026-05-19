'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Eye, MapPin, Train } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { ProjectDetail, RequiredSkillGroup } from '@/types'

interface Props {
  projectSq: string
}

function SkillGroupList({ groups, label }: { groups: RequiredSkillGroup[]; label: string }) {
  if (groups.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      {groups.map((g) => (
        <div key={g.parentSkillTagNm} className="space-y-1">
          <p className="text-sm font-medium">{g.parentSkillTagNm}</p>
          <div className="flex flex-wrap gap-1.5">
            {g.childSkillTagNms.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DateRange({ label, start, end }: { label: string; start: string; end: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{start} ~ {end}</span>
    </div>
  )
}

export default function ProjectSpec({ projectSq }: Props) {
  const router = useRouter()
  const { isLoggedIn } = useUserStore()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    api
      .get<{ output: ProjectDetail }>(`/projects/${projectSq}/details`)
      .then((r) => setProject(r.data.output))
      .catch(() => toast.error('프로젝트 정보를 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [projectSq])

  async function handleScrap() {
    if (!project) return
    if (!isLoggedIn()) { toast.error('로그인이 필요합니다.'); return }
    try {
      await api.post(`/projects/${project.projectSq}/scraps`, {
        hasScrapped: project.isScrap === 1,
        target: 'project',
      })
      setProject((prev) =>
        prev
          ? {
              ...prev,
              isScrap: (prev.isScrap === 1 ? 0 : 1) as 0 | 1,
              projectScrapCnt: prev.projectScrapCnt + (prev.isScrap === 1 ? -1 : 1),
            }
          : prev,
      )
    } catch {
      toast.error('스크랩 처리 중 오류가 발생했습니다.')
    }
  }

  async function handleApply() {
    if (!isLoggedIn()) { toast.error('로그인이 필요합니다.'); return }
    toast.info('지원하기 기능은 준비 중입니다.')
    // GA4: project_apply
  }

  async function handleDelete() {
    if (!project) return
    try {
      await api.delete(`/projects/${project.projectSq}`)
      toast.success('프로젝트가 삭제되었습니다.')
      router.push('/projects')
    } catch {
      toast.error('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (!project) {
    return <p className="text-center text-muted-foreground py-20">프로젝트를 불러올 수 없습니다.</p>
  }

  const isRecruitmentEnded =
    new Date(project.projectRecruitEndDt).getTime() < Date.now()

  const isAuthor = project.userRole === 'COMPANY_AUTHOR'
  const isCompanyMember = project.userRole === 'COMPANY_MEMBER'
  const isPersonal = project.userRole === 'PERSONAL' || project.userRole === 'COMPANY_EXTERNAL'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {project.companyImageUrl && (
              <img
                src={project.companyImageUrl}
                alt={project.companyNm}
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{project.companyNm}</p>
              <CardTitle className="text-xl mt-1">{project.projectTtl}</CardTitle>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {project.projectViewCnt}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> {project.projectScrapCnt}
                </span>
                {isRecruitmentEnded && (
                  <Badge variant="secondary">채용종료</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 일정 */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <DateRange label="모집 기간" start={project.projectRecruitStartDt} end={project.projectRecruitEndDt} />
          <DateRange label="면접 기간" start={project.interviewStartDt} end={project.interviewEndDt} />
          <DateRange label="프로젝트 기간" start={project.projectStartDt} end={project.projectEndDt} />
        </CardContent>
      </Card>

      {/* 근무 형태 */}
      {project.projectWorkType.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">근무 형태</p>
            <div className="flex flex-wrap gap-2">
              {project.projectWorkType.map((w) => (
                <Badge key={w} variant="outline">{w}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 근무지 */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-sm font-semibold text-muted-foreground mb-2">근무지</p>
          {project.addressTypeCd === 2702 ? (
            <p className="flex items-center gap-1.5 text-sm">
              <Train className="h-4 w-4" /> {project.subwayAddress}
            </p>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" /> {project.detailedAddress}
              </p>
              {project.detailedAddressDetail && (
                <p className="text-sm text-muted-foreground pl-6">{project.detailedAddressDetail}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 급여 */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-semibold text-muted-foreground mb-1">급여</p>
          <p className="text-lg font-bold">
            {project.salaryNegotiableYn === 'Y' ? '협의' : project.formattedSalary}
          </p>
        </CardContent>
      </Card>

      {/* 기술 스택 */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SkillGroupList groups={project.projectRequiredSkills} label="필수 기술" />
          {project.projectRequiredSkills.length > 0 && project.projectPreferredSkills.length > 0 && (
            <Separator />
          )}
          <SkillGroupList groups={project.projectPreferredSkills} label="우대 기술" />
          {project.projectPreferredEtc && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">기타 우대사항</p>
              <p className="text-sm whitespace-pre-wrap">{project.projectPreferredEtc}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 설명 */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-semibold text-muted-foreground mb-2">프로젝트 상세</p>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: project.projectDetail }}
          />
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        {isAuthor && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/mypage/project-post/${project.projectSq}`)}
            >
              수정하기
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setDeleteOpen(true)}
            >
              삭제하기
            </Button>
          </>
        )}

        {isPersonal && !isRecruitmentEnded && (
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={handleScrap}
            >
              <Heart
                className={`h-5 w-5 ${project.isScrap === 1 ? 'fill-red-500 text-red-500' : ''}`}
              />
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              disabled={project.isApplied === 1}
            >
              {project.isApplied === 1 ? '지원완료' : '지원하기'}
            </Button>
          </>
        )}

        {isCompanyMember && !isRecruitmentEnded && (
          <Button className="flex-1" onClick={handleApply}>
            지원하기
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="프로젝트 삭제"
        message="프로젝트를 삭제하면 복구할 수 없습니다. 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
