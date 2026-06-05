import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building, MapPin, Calendar, Clock, Banknote, Briefcase, Code, Monitor, AlertCircle } from 'lucide-react'

interface ProjectLogViewerProps {
  data: any
}

export function ProjectLogViewer({ data }: ProjectLogViewerProps) {
  if (!data) return <div className="text-muted-foreground p-4">데이터가 없습니다.</div>

  const safeStr = (str: any) => str || '-'

  return (
    <div className="space-y-6">
      {/* 1. 프로젝트 헤더 정보 */}
      <Card className="border-t-4 border-t-indigo-600 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <span>{safeStr(data.projectTitle)}</span>
            {data.isNotification && (
              <Badge variant="outline" className="text-xs font-normal shrink-0">
                알림: {data.isNotification}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-muted-foreground shrink-0" />
              <span className="font-semibold w-20 shrink-0">예상 금액</span>
              <span className="font-bold text-indigo-700">
                {data.projectSalary ? `${data.projectSalary.toLocaleString()}원` : '-'}
                {data.projectSalaryNegotiableYn === 'Y' && ' (협의 가능)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground shrink-0" />
              <span className="font-semibold w-20 shrink-0">시작 예정일</span>
              <span>{safeStr(data.projectStartDt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground shrink-0" />
              <span className="font-semibold w-20 shrink-0">모집 마감일</span>
              <span className="text-red-600 font-medium">{safeStr(data.recruitEndDt)}</span>
            </div>
            <div className="flex items-start gap-2 col-span-1 md:col-span-2">
              <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
              <span className="font-semibold w-20 shrink-0">근무 위치</span>
              <span className="break-all">
                {data.detailedAddressName ? (
                  <>
                    {data.detailedAddressName} {safeStr(data.detailedAddressDetail)}
                    {data.subwayAddressName && <span className="block text-muted-foreground text-xs mt-1">지하철: {data.subwayAddressName} 인근</span>}
                  </>
                ) : '위치 정보 없음'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 모집 조건 (직군, 학력, 등급) */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 bg-muted/30 border-b">
          <CardTitle className="text-md flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-600" /> 모집 조건
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold block mb-1 text-muted-foreground">필요 등급</span>
            <span>{safeStr(data.devGrade)}</span>
          </div>
          <div>
            <span className="font-semibold block mb-1 text-muted-foreground">학력 제한</span>
            <span>{safeStr(data.educationLvl)}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold block mb-2 text-muted-foreground">모집 직군 및 근무 형태</span>
            <div className="flex flex-wrap gap-2">
              {data.recruitJob && data.recruitJob.map((job: string, i: number) => (
                <Badge key={`job-${i}`} variant="default">{job}</Badge>
              ))}
              {data.workType && data.workType.map((type: string, i: number) => (
                <Badge key={`wt-${i}`} variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">{type}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. 사용 및 우대 기술 */}
      {(data.usingSkills?.length > 0 || data.preferSkills?.length > 0) && (
        <Card className="shadow-sm">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-md flex items-center gap-2">
              <Code size={18} className="text-indigo-600" /> 기술 스택
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {data.usingSkills?.length > 0 && (
              <div>
                <span className="font-semibold text-sm block mb-2">필수 사용 기술</span>
                <div className="flex flex-wrap gap-2">
                  {data.usingSkills.map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
            {data.preferSkills?.length > 0 && (
              <div>
                <span className="font-semibold text-sm block mb-2">우대 기술</span>
                <div className="flex flex-wrap gap-2">
                  {data.preferSkills.map((skill: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-green-700 border-green-200 bg-green-50">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. 프로젝트 상세 설명 */}
      {data.description && (
        <Card className="shadow-sm bg-gray-50">
          <CardHeader className="py-3 border-b border-gray-200">
            <CardTitle className="text-md flex items-center gap-2">
              <Monitor size={18} className="text-gray-700" /> 프로젝트 상세 내용
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-sm leading-relaxed whitespace-pre-wrap">
            {data.description}
          </CardContent>
        </Card>
      )}

      {/* 5. 우대 사항 및 인터뷰 시간 */}
      {(data.preference || (data.interviewTime && data.interviewTime.length > 0)) && (
        <Card className="shadow-sm">
          <CardHeader className="py-3 bg-muted/30 border-b">
            <CardTitle className="text-md flex items-center gap-2">
              <AlertCircle size={18} className="text-indigo-600" /> 기타 안내 사항
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-sm">
            {data.preference && (
              <div>
                <span className="font-semibold block mb-1">우대 사항</span>
                <p className="text-muted-foreground whitespace-pre-wrap">{data.preference}</p>
              </div>
            )}
            {data.interviewTime && data.interviewTime.length > 0 && (
              <div>
                <span className="font-semibold block mb-2">인터뷰 가능 시간</span>
                <div className="flex flex-wrap gap-2">
                  {data.interviewTime.map((time: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-slate-600">{time}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
