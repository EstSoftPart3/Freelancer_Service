'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import CommonPagination from '@/components/community/CommonPagination'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import InterviewSelectModal, { type InterviewTime } from '@/components/mypage/common/InterviewSelectModal'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import api from '@/lib/api'

interface Applicant {
  applicationSq: number
  resumeSq: number
  careerYear?: number
  skillNames?: string[]
  resumeNmTtlVo?: { resumeNm?: string; resumeTtl?: string }
  appStatusVo?: { appStatus?: string; interviewDt?: string; appDt?: string; readResumeDt?: string }
}

interface Group { companyNm: string | null; applicants: Applicant[] }

interface Props {
  open: boolean
  projectSq: number | null
  projectTtl: string
  onClose: () => void
}

const PAGE_SIZE = 5

// Vue 원본 순서: 전체 / 합격 / 지원중 / 인터뷰확정 / 인터뷰요청중 / 불합격·취소
const TABS = [
  { type: 'all', label: '전체' },
  { type: 'passed', label: '합격' },
  { type: 'in_progress', label: '지원중' },
  { type: 'interview_confirmed', label: '인터뷰확정' },
  { type: 'interview_requested', label: '인터뷰요청중' },
  { type: 'rejected', label: '불합격 / 취소' },
]

const SEARCH_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'name', label: '이름' },
  { value: 'skills', label: '사용 기술' },
]

function bucket(status?: string): string {
  if (status === '지원중') return 'in_progress'
  if (status === '합격') return 'passed'
  if (status === '인터뷰확정') return 'interview_confirmed'
  if (status === '인터뷰요청중') return 'interview_requested'
  if (status === '불합격' || status === '지원취소') return 'rejected'
  return ''
}

// interviewDt(LocalDateTime)용 — 시분까지 표시
function fmtDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// appDt·readResumeDt(LocalDate)용 — 시간대 변환 없이 날짜만 표시
function fmtDay(s?: string) {
  if (!s) return ''
  return s.substring(0, 10)
}

export default function ApplyStatusModal({ open, projectSq, projectTtl, onClose }: Props) {
  const [groups, setGroups] = useState<Group[]>([])
  const [tab, setTab] = useState<'personal' | 'company'>('personal') // Vue: 진입 시 개인
  const [filter, setFilter] = useState('all')
  const [searchType, setSearchType] = useState('all')
  const [searchText, setSearchText] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)
  const [detail, setDetail] = useState<{ resumeSq: number; applicationSq: number } | null>(null)
  const [interview, setInterview] = useState<{ applicationSq: number; times: InterviewTime[] } | null>(null)

  // 응답은 {applicantType, currentPage, totalPages, response} 형태로 직접 내려옴 (output 래퍼 없음)
  const load = useCallback(async (
    which: 'personal' | 'company', page: number, flt: string, sType: string, kw: string,
  ) => {
    if (projectSq == null) return
    const params = { page, size: PAGE_SIZE, filter: flt, searchType: sType, keyword: kw }
    const url = which === 'company'
      ? `/projects/applications/${projectSq}/corporate/grouped`
      : `/projects/applications/${projectSq}/personal`
    try {
      const { data } = await api.get(url, { params })
      if (which === 'company') {
        setGroups((data.response ?? []).map((g: { companyNm?: string; applicants?: Applicant[] }) => ({
          companyNm: g.companyNm ?? '기업', applicants: g.applicants ?? [],
        })))
      } else {
        setGroups([{ companyNm: null, applicants: data.response ?? [] }])
      }
      setTotalPages(Math.max(1, data.totalPages ?? 1))
    } catch {
      toast.error('지원자 현황을 불러올 수 없습니다.')
    }
  }, [projectSq])

  useEffect(() => {
    if (open) {
      setFilter('all'); setTab('personal'); setSearchType('all'); setSearchText(''); setAppliedKeyword('')
      setCurrentPage(1); setCollapsed(new Set())
      load('personal', 1, 'all', 'all', '')
    }
  }, [open, load])

  function switchTab(t: 'personal' | 'company') {
    setTab(t); setFilter('all'); setCurrentPage(1); setCollapsed(new Set())
    load(t, 1, 'all', searchType, appliedKeyword)
  }

  function applyFilter(type: string) {
    setFilter(type); setCurrentPage(1)
    load(tab, 1, type, searchType, appliedKeyword)
  }

  function doSearch() {
    setAppliedKeyword(searchText); setCurrentPage(1)
    load(tab, 1, filter, searchType, searchText)
  }

  function changePage(p: number) {
    setCurrentPage(p)
    load(tab, p, filter, searchType, appliedKeyword)
  }

  const allApplicants = useMemo(() => groups.flatMap((g) => g.applicants), [groups])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allApplicants.length }
    TABS.forEach((t) => { if (t.type !== 'all') c[t.type] = 0 })
    allApplicants.forEach((a) => { const b = bucket(a.appStatusVo?.appStatus); if (b) c[b]++ })
    return c
  }, [allApplicants])

  async function updateStatus(applicationSq: number, status: string) {
    try {
      await api.patch(`/projects/applications/${applicationSq}`, { status })
      toast.success('상태가 정상적으로 변경되었습니다.')
      load(tab, currentPage, filter, searchType, appliedKeyword)
    } catch {
      toast.error('상태 변경 중 오류가 발생했습니다.')
    }
  }

  // 합격자 인터뷰 요청 — 가능 시간 조회 후 선택 모달 오픈
  async function requestInterview(applicationSq: number) {
    if (projectSq == null) return
    try {
      const { data } = await api.get(`/projects/applications/interviews/${projectSq}`)
      setInterview({ applicationSq, times: data.output ?? [] })
    } catch {
      toast.error('인터뷰 시간을 불러올 수 없습니다.')
    }
  }

  function toggleCollapse(idx: number) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      return next
    })
  }

  function renderApplicant(a: Applicant) {
    const status = a.appStatusVo?.appStatus
    return (
      <li key={a.applicationSq} className="space-y-2 py-3">
        <div className="flex items-center justify-between gap-2">
          <button className="min-w-0 text-left hover:underline cursor-pointer" onClick={() => setDetail({ resumeSq: a.resumeSq, applicationSq: a.applicationSq })}>
            <span className="text-sm font-medium">{a.resumeNmTtlVo?.resumeNm}</span>
            <span className="text-sm text-muted-foreground"> / {a.resumeNmTtlVo?.resumeTtl}</span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            {status === '지원중' && (
              <>
                <Button size="sm" variant="outline" onClick={() => updateStatus(a.applicationSq, '인터뷰요청중')}>인터뷰 요청</Button>
                <Button size="sm" variant="outline" onClick={() => setRejectTarget(a.applicationSq)}>불합격</Button>
              </>
            )}
            {status === '합격' && <Button size="sm" variant="outline" onClick={() => requestInterview(a.applicationSq)}>인터뷰 요청</Button>}
            {status === '인터뷰요청중' && <Badge>인터뷰 요청중</Badge>}
            {status === '인터뷰확정' && <Badge>인터뷰 확정 {a.appStatusVo?.interviewDt ? `(${fmtDate(a.appStatusVo.interviewDt)})` : ''}</Badge>}
            {status === '불합격' && <Badge variant="secondary">불합격</Badge>}
            {status === '지원취소' && <Badge variant="secondary">지원 취소됨</Badge>}
          </div>
        </div>
        {/* 좌: 경력·사용기술 / 우: 지원일자·열람일자 */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="space-y-1">
            <div><span className="font-semibold text-foreground">경력</span> | {a.careerYear ?? 0}년차</div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
              <span className="font-semibold text-foreground">사용 기술</span> |
              {a.skillNames && a.skillNames.length > 0
                ? a.skillNames.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1">
                      <img src={getSkillIconUrl(s)} alt={s} width={18} height={18} />
                      <span>{s}</span>
                    </span>
                  ))
                : <span>-</span>}
            </div>
          </div>
          <div className="space-y-1 sm:text-right">
            <div><span className="font-semibold text-foreground">지원일자</span> | {a.appStatusVo?.appDt ? fmtDay(a.appStatusVo.appDt) : '-'}</div>
            <div><span className="font-semibold text-foreground">열람일자</span> | {a.appStatusVo?.readResumeDt ? fmtDay(a.appStatusVo.readResumeDt) : '미열람'}</div>
          </div>
        </div>
      </li>
    )
  }

  const isEmpty = allApplicants.length === 0

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle className="truncate">지원 현황 — {projectTtl}</DialogTitle></DialogHeader>

        {/* 검색 — 우측 정렬 */}
        <div className="flex justify-end gap-1.5">
          <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }} items={SEARCH_OPTIONS}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEARCH_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="검색어 입력" className="w-40" />
          <Button size="sm" onClick={doSearch}>검색</Button>
        </div>

        {/* 필터 탭 — 한 줄 */}
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto">
          {TABS.map((t) => (
            <Button key={t.type} size="sm" variant={filter === t.type ? 'default' : 'outline'} className="shrink-0" onClick={() => applyFilter(t.type)}>
              {t.label}<Badge variant="secondary" className="ml-1">{counts[t.type] ?? 0}</Badge>
            </Button>
          ))}
        </div>

        {/* 개인 / 기업 토글 */}
        <div className="flex justify-end gap-1.5 border-b pb-2">
          <Button size="sm" variant={tab === 'personal' ? 'default' : 'ghost'} onClick={() => switchTab('personal')}>개인</Button>
          <Button size="sm" variant={tab === 'company' ? 'default' : 'ghost'} onClick={() => switchTab('company')}>기업</Button>
        </div>

        {isEmpty ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {tab === 'company' ? '지원한 기업 지원자가 없습니다.' : '조건에 해당하는 개인 지원자가 없습니다.'}
          </p>
        ) : tab === 'company' ? (
          <div className="space-y-3">
            {groups.map((g, idx) => (
              <div key={idx} className="rounded-md border">
                <button type="button" onClick={() => toggleCollapse(idx)}
                  className="flex w-full items-center justify-between bg-muted px-3 py-2 text-left font-semibold cursor-pointer">
                  {g.companyNm}
                  <ChevronDown className={`h-4 w-4 transition-transform ${collapsed.has(idx) ? '-rotate-90' : ''}`} />
                </button>
                {!collapsed.has(idx) && (
                  <ul className="divide-y px-3">{g.applicants.map(renderApplicant)}</ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y">{groups[0]?.applicants.map(renderApplicant)}</ul>
        )}

        <CommonPagination currentPage={currentPage} totalPages={totalPages} onPageChange={changePage} />

        <ResumeDetailModal
          resumeSq={detail?.resumeSq ?? null}
          projectSq={projectSq}
          applicationSq={detail?.applicationSq ?? null}
          onClose={() => setDetail(null)}
        />
        <InterviewSelectModal
          open={interview !== null}
          applicationSq={interview?.applicationSq ?? null}
          interviewTimes={interview?.times ?? []}
          onClose={() => setInterview(null)}
          onConfirm={() => load(tab, currentPage, filter, searchType, appliedKeyword)}
        />
        <ConfirmDialog
          open={rejectTarget !== null}
          title="불합격 처리"
          message="해당 지원자를 불합격 처리하겠습니까?"
          onConfirm={() => rejectTarget !== null && updateStatus(rejectTarget, '불합격')}
          onClose={() => setRejectTarget(null)}
        />
      </DialogContent>
    </Dialog>
  )
}
