'use client'

import { Heart, Building2, MapPin, Train } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ProjectItem } from '@/types'
import { cn } from '@/lib/utils'
import { getSkillIconUrl } from '@/lib/skillIconMap'

interface Props {
  project: ProjectItem
  onClick: (sq: number) => void
  onScrap: (sq: number, current: 'Y' | 'N') => void
}

interface ProjectStatus {
  status: '채용예정' | '채용중' | '채용종료'
  dDay?: string
}

function getProjectStatus(project: ProjectItem): ProjectStatus {
  const today = new Date()
  const start = new Date(project.recruitStartDt)
  const end = new Date(project.recruitEndDt)

  if (today < start) return { status: '채용예정' }
  if (today > end) return { status: '채용종료' }

  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return { status: '채용중', dDay: `D-${diff}` }
}

export default function ProjectCard({ project, onClick, onScrap }: Props) {
  const { status, dDay } = getProjectStatus(project)

  const address =
    project.addressTypeCd === 2702 ? project.subwayAddress : project.detailedAddress

  return (
    <div
      className="relative flex cursor-pointer flex-row items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
      onClick={() => onClick(project.projectSq)}
    >
      {/* 스크랩 버튼 — 우측 상단 절대 위치 */}
      <button
        className="absolute right-3 top-3 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onScrap(project.projectSq, project.hasScrapped)
        }}
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-colors',
            project.hasScrapped === 'Y'
              ? 'fill-red-500 text-red-500'
              : 'text-muted-foreground hover:text-red-400',
          )}
        />
      </button>

      {/* 좌측 — 회사 썸네일 (70px 원형) */}
      <div className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.companyImageUrl || '/img/logos/Company_logo.png'}
          alt={project.companyNm}
          className="h-[70px] w-[70px] rounded-full bg-gray-50 object-contain"
        />
      </div>

      {/* 우측 — 텍스트 정보 */}
      <div className="min-w-0 flex-1 pr-6">
        {/* 제목 + 채용 상태 */}
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h4 className="truncate font-bold">{project.projectTtl}</h4>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
              status === '채용중'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {status}
            {status === '채용중' && dDay && (
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {dDay}
              </span>
            )}
          </span>
        </div>

        {/* 회사명 */}
        <p className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          {project.companyNm}
        </p>

        {/* 주소 | 경력 | 학력 */}
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
          {address && (
            <>
              <span className="flex items-center gap-1">
                {project.addressTypeCd === 2702 ? (
                  <Train className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                )}
                {address}
              </span>
              <span className="text-muted-foreground/40">|</span>
            </>
          )}
          <span>{project.devGradeNm}</span>
          <span className="text-muted-foreground/40">|</span>
          <span>{project.requiredEduLvl}</span>
        </div>

        {/* 단가 */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-block rounded bg-blue-50 px-2 py-1 text-sm font-extrabold text-primary">
            {project.formattedSalary}
          </span>
          {project.salaryNegotiableYn === 'Y' && (
            <Badge variant="outline" className="text-xs text-primary">
              단가협의 가능
            </Badge>
          )}
        </div>

        {/* 기술 태그 (아이콘 포함) */}
        <div className="flex flex-wrap gap-1.5">
          {project.reqSkills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getSkillIconUrl(skill)}
                alt={skill}
                width={14}
                height={14}
                className="shrink-0"
              />
              {skill}
            </span>
          ))}
        </div>

        {/* 조회수 */}
        <div className="mt-2 text-right text-xs text-muted-foreground">
          조회수: {project.viewCnt}
        </div>
      </div>
    </div>
  )
}
