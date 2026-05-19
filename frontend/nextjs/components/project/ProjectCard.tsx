'use client'

import { Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProjectItem } from '@/types'

interface Props {
  project: ProjectItem
  onClick: (sq: number) => void
  onScrap: (sq: number, current: 0 | 1) => void
}

function getDday(recruitEndDt: string): string {
  const diff = Math.ceil(
    (new Date(recruitEndDt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
  if (diff < 0) return '채용종료'
  if (diff === 0) return 'D-Day'
  return `D-${diff}`
}

function getDdayVariant(label: string): 'default' | 'secondary' | 'destructive' {
  if (label === '채용종료') return 'secondary'
  if (label === 'D-Day') return 'destructive'
  return 'default'
}

export default function ProjectCard({ project, onClick, onScrap }: Props) {
  const dday = getDday(project.projectRecruitEndDt)
  const address =
    project.addressTypeCd === 2702
      ? project.subwayAddress
      : project.detailedAddress

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(project.projectSq)}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {project.companyImageUrl && (
              <img
                src={project.companyImageUrl}
                alt={project.companyNm}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            )}
            <span className="text-sm text-muted-foreground truncate">
              {project.companyNm}
            </span>
          </div>
          <Badge variant={getDdayVariant(dday)} className="shrink-0 text-xs">
            {dday}
          </Badge>
        </div>

        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
          {project.projectTtl}
        </h3>

        <div className="flex flex-wrap gap-1">
          {project.reqSkills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs py-0">
              {skill}
            </Badge>
          ))}
          {project.reqSkills.length > 5 && (
            <Badge variant="outline" className="text-xs py-0">
              +{project.reqSkills.length - 5}
            </Badge>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5">
          {address && <p className="truncate">{address}</p>}
          <p>{project.devGradeNm} · {project.requiredEduLvl}</p>
          <p className="font-medium text-foreground">
            {project.salaryNegotiableYn === 'Y' ? '협의' : project.formattedSalary}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            조회 {project.projectViewCnt}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onScrap(project.projectSq, project.isScrap)
            }}
          >
            <Heart
              className={`h-4 w-4 ${project.isScrap === 1 ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
