'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import api from '@/lib/api'

interface GroupedTag { [category: string]: string[] }
interface ProjectDetail {
  projectHistoryClient?: string
  projectHistoryTask?: string
  projectHistoryStartDt?: string
  projectHistoryEndDt?: string
  projectHistoryJobPositionTypeNm?: string
  projectHistoryTypeNm?: string
  groupedSkillTags?: GroupedTag[]
  isExpanded?: boolean
}
interface ResumeInfo {
  resumeTtl?: string
  resumePhotoUrl?: string
  resumeNm?: string
  resumeBirthDt?: string
  resumePhoneNum?: string
  resumeEmail?: string
  address?: { addressSq?: number; addressFull?: string; address?: string; detailAddress?: string } | string
  educationList?: Array<{ educationSchoolNm?: string; educationMajorNm?: string; educationStatusNm?: string; educationAdmissionDt?: string; educationGraduationDt?: string }>
  careerList?: Array<{ careerCompanyNm?: string; careerDepartmentNm?: string; careerPositionNm?: string; careerStartDt?: string; careerEndDt?: string }>
  trainingList?: Array<{ trainingProgramNm?: string; trainingInstitutionNm?: string; trainingStartDt?: string; trainingEndDt?: string }>
  projectList?: ProjectDetail[]
  certificationList?: Array<{ certificationNm?: string; certificationIssuerNm?: string }>
  skillTagList?: string[]
  resumeGreetingTxt?: string
  attachmentList?: Array<{ attachmentFileUrl?: string; attachmentOriginFileNm?: string }>
}

const CATS: Array<{ key: string; label: string }> = [
  { key: 'Device', label: '기종' }, { key: 'OS', label: 'OS' }, { key: 'DBMS', label: 'DBMS' },
  { key: 'Language', label: '언어' }, { key: 'Tool', label: 'TOOL' }, { key: 'FrameWork', label: 'FW' },
]

interface Props {
  resumeSq: number | null
  // 지원 목록에서 열 때: projectSq·applicationSq를 주면 열람 처리 포함 POST API 사용
  projectSq?: number | null
  applicationSq?: number | null
  onClose: () => void
}

export default function ResumeDetailModal({ resumeSq, projectSq, applicationSq, onClose }: Props) {
  const [info, setInfo] = useState<ResumeInfo | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  // onClose는 부모에서 인라인 화살표로 넘어와 매 렌더 새 참조 → load 의존성에 넣으면 재조회 루프.
  // ref로 최신값만 참조해 에러 시 모달을 닫는다.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const load = useCallback(async () => {
    if (resumeSq == null) return
    setInfo(null)
    try {
      const { data } = projectSq != null && applicationSq != null
        ? await api.post('/mypage/resume-detail-view', { resumeSq, projectSq, applicationSq })
        : await api.get(`/mypage/resume-detail/${resumeSq}`)
      const out: ResumeInfo = data.output ?? {}
      setInfo(out)
      setExpanded(new Set((out.projectList ?? []).map((_, i) => i))) // 기본 전체 펼침
    } catch (e) {
      // 삭제된 이력서 등: 백엔드가 "유효하지 않은 이력서입니다." 400 → 에러 토스트 + 모달 닫기
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
      toast.error(msg || '이력서를 불러올 수 없습니다.')
      onCloseRef.current()
    }
  }, [resumeSq, projectSq, applicationSq])

  useEffect(() => { if (resumeSq != null) load() }, [resumeSq, load])

  const toggle = (i: number) => setExpanded((p) => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n })
  const tagsOf = (p: ProjectDetail, cat: string) => p.groupedSkillTags?.find((g) => g[cat])?.[cat] ?? []

  return (
    <Dialog open={resumeSq != null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b px-6 py-4"><DialogTitle>이력서 상세보기</DialogTitle></DialogHeader>
        <div className="overflow-y-auto px-6 py-4">
        {!info ? (
          <p className="py-10 text-center text-sm text-muted-foreground">불러오는 중...</p>
        ) : (
          <div className="space-y-5 text-sm">
            {/* 제목 + 사진 + 기본정보 */}
            <div className="flex items-start gap-4">
              <img
                src={info.resumePhotoUrl || '/img/default-avatar.svg'}
                alt=""
                className="h-24 w-24 shrink-0 rounded-md border bg-muted object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/default-avatar.svg' }}
              />
              <div className="min-w-0 space-y-1">
                <p className="text-base font-semibold">{info.resumeTtl}</p>
                <p>{info.resumeNm} · {info.resumeBirthDt}</p>
                <p>{info.resumePhoneNum}</p>
                <p className="break-all">{info.resumeEmail}</p>
                <p className="text-muted-foreground">{addressText(info.address)}</p>
              </div>
            </div>

            <Sec title="학력" show={!!info.educationList?.length}>
              <ul className="space-y-1">
                {info.educationList?.map((e, i) => (
                  <li key={i}>{e.educationSchoolNm} {e.educationMajorNm} {e.educationStatusNm} ({e.educationAdmissionDt} ~ {e.educationGraduationDt})</li>
                ))}
              </ul>
            </Sec>

            <Sec title="회사 이력" show={!!info.careerList?.length}>
              <ul className="space-y-1">
                {info.careerList?.map((c, i) => (
                  <li key={i}>{c.careerCompanyNm} {c.careerDepartmentNm} - {c.careerPositionNm} ({c.careerStartDt} ~ {c.careerEndDt})</li>
                ))}
              </ul>
            </Sec>

            <Sec title="교육 이력" show={!!info.trainingList?.length}>
              <ul className="space-y-1">
                {info.trainingList?.map((t, i) => (
                  <li key={i}>{t.trainingProgramNm} / {t.trainingInstitutionNm} ({t.trainingStartDt} ~ {t.trainingEndDt})</li>
                ))}
              </ul>
            </Sec>

            <Sec title="프로젝트 이력" show={!!info.projectList?.length}>
              <div className="space-y-2">
                {info.projectList?.map((p, i) => (
                  <div key={i} className="rounded-md border">
                    <button type="button" onClick={() => toggle(i)} className="flex w-full items-center gap-2 px-3 py-2 text-left cursor-pointer">
                      {expanded.has(i) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-medium">{p.projectHistoryClient} {p.projectHistoryTask}</span>
                      <span className="text-muted-foreground">({p.projectHistoryStartDt} ~ {p.projectHistoryEndDt})</span>
                    </button>
                    {expanded.has(i) && (
                      <div className="space-y-2 border-t bg-muted/30 p-3">
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                          <div><strong>고객사:</strong> {p.projectHistoryClient}</div>
                          <div><strong>업무단:</strong> {p.projectHistoryJobPositionTypeNm}</div>
                          <div><strong>역할:</strong> {p.projectHistoryTypeNm}</div>
                        </div>
                        {CATS.map(({ key, label }) => {
                          const tags = tagsOf(p, key)
                          if (!tags.length) return null
                          return (
                            <div key={key} className="flex flex-wrap items-center gap-1">
                              <strong className="mr-1">{label}:</strong>
                              {tags.map((t) => (
                                <span key={t} className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs">
                                  <img src={getSkillIconUrl(t)} alt="" className="h-3.5 w-3.5" />{t}
                                </span>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Sec>

            <Sec title="자격증" show={!!info.certificationList?.length}>
              <ul className="space-y-1">
                {info.certificationList?.map((c, i) => (
                  <li key={i}>{c.certificationNm}{c.certificationIssuerNm ? ` (${c.certificationIssuerNm})` : ''}</li>
                ))}
              </ul>
            </Sec>

            <Sec title="보유 기술" show={!!info.skillTagList?.length}>
              <div className="flex flex-wrap gap-1.5">
                {info.skillTagList?.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs">
                    <img src={getSkillIconUrl(s)} alt="" className="h-3.5 w-3.5" />{s}
                  </span>
                ))}
              </div>
            </Sec>

            <Sec title="자기소개" show={!!info.resumeGreetingTxt}>
              <p className="whitespace-pre-wrap">{info.resumeGreetingTxt}</p>
            </Sec>

            <Sec title="첨부파일" show={!!info.attachmentList?.length}>
              <ul className="space-y-0.5">
                {info.attachmentList?.map((f, i) => (
                  <li key={i}><a href={f.attachmentFileUrl} target="_blank" rel="noreferrer" className="text-primary underline hover:no-underline">{f.attachmentOriginFileNm}</a></li>
                ))}
              </ul>
            </Sec>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function addressText(addr: ResumeInfo['address']): string {
  if (!addr) return ''
  if (typeof addr === 'string') return addr
  return [addr.addressFull ?? addr.address, addr.detailAddress].filter(Boolean).join(' ')
}

function Sec({ title, show, children }: { title: string; show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return (
    <div className="space-y-1">
      <h4 className="font-semibold text-foreground">{title}</h4>
      {children}
    </div>
  )
}
