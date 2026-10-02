'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useFormErrors } from '@/hooks/useFormErrors'

export interface EducationItem {
  educationSchoolNm: string
  educationMajorNm: string
  educationAdmissionDt: string // yyyy-MM
  educationGraduationDt: string
}

interface School { id: string | number; name: string; address: string }

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (item: EducationItem) => void
}

// Vue EducationSearchModal과 동일한 career.go.kr 학교정보 OpenAPI.
// 키가 코드에 박혀 있다가 만료돼 검색이 통째로 죽었다 — 환경변수로 빼고, 없거나 실패하면 직접 입력으로 진행한다.
const API_KEY = process.env.NEXT_PUBLIC_CAREERNET_API_KEY ?? ''
const PER_PAGE = 3

const todayMonth = () => new Date().toISOString().slice(0, 7)

export default function EducationModal({ open, onClose, onComplete }: Props) {
  const [tab, setTab] = useState<'high' | 'univ'>('high')
  const [search, setSearch] = useState('')
  const [schools, setSchools] = useState<School[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 2단계: 기간/전공 입력
  const [selected, setSelected] = useState<School | null>(null)
  const [admissionDt, setAdmissionDt] = useState('')
  const [graduationDt, setGraduationDt] = useState('')
  const [major, setMajor] = useState('')
  const { validate, fieldProps, clearField, clearAll } = useFormErrors<'admissionDt' | 'major'>()

  const fetchSchools = useCallback(async (p: number, gubun: 'high' | 'univ', keyword: string) => {
    if (!API_KEY) return
    try {
      const url = new URL('https://www.career.go.kr/cnet/openapi/getOpenApi')
      url.search = new URLSearchParams({
        apiKey: API_KEY, svcType: 'api', svcCode: 'SCHOOL', contentType: 'json',
        gubun: gubun === 'high' ? 'high_list' : 'univ_list',
        thisPage: String(p), perPage: String(PER_PAGE), searchSchulNm: keyword.trim(),
      }).toString()
      const res = await fetch(url.toString())
      const data = await res.json()
      // 커리어넷은 인증키 실패 같은 오류도 HTTP 200 + {result:{content:[{code:"-1",message}]}} 로 준다 —
      // 예전엔 이걸 "검색 결과 없음"으로 보여 줘서 검색이 고장 난 줄 알 수 없었다.
      const apiError = data?.result?.content?.[0]
      if (apiError?.code && apiError.code !== '0') throw new Error(apiError.message)
      let content = data?.dataSearch?.content
      if (!content) content = []
      else if (!Array.isArray(content)) content = [content]
      setSchools(content.map((item: Record<string, string>, idx: number) => ({
        id: item.seq || idx, name: item.schoolName, address: item.adres || item.addr || '',
      })))
      const totalCount = content.length > 0 ? parseInt(content[0].totalCount) : 0
      setTotalPages(Math.max(1, Math.ceil(totalCount / PER_PAGE)))
    } catch {
      setSchools([])
      toast.error('학교 검색에 실패했습니다. 학교명을 입력하고 [직접 입력]을 눌러 주세요.')
    }
  }, [])

  useEffect(() => {
    if (open && !selected) fetchSchools(page, tab, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, page])

  const reset = () => { setTab('high'); setSearch(''); setSchools([]); setPage(1); setTotalPages(1); setSelected(null); setAdmissionDt(''); setGraduationDt(''); setMajor(''); clearAll() }
  const close = () => { reset(); onClose() }

  const complete = () => {
    if (!validate([
      { key: 'admissionDt', invalid: !admissionDt, message: '입학년월을 입력해주세요.' },
      { key: 'major', invalid: !major.trim(), message: '전공명을 입력하세요.' },
    ])) return
    onComplete({ educationSchoolNm: selected!.name, educationMajorNm: major, educationAdmissionDt: admissionDt, educationGraduationDt: graduationDt })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{selected ? '학력 기간 입력' : '학력 검색'}</DialogTitle></DialogHeader>

        {!selected ? (
          <div className="space-y-3">
            <div className="flex gap-1">
              {(['high', 'univ'] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setSearch(''); setPage(1) }}
                  className={`px-4 py-1.5 text-sm rounded-t cursor-pointer ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {t === 'high' ? '고등학교' : '대학교'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchSchools(1, tab, search) } }} placeholder="학교명을 입력하세요" />
              <Button onClick={() => { setPage(1); fetchSchools(1, tab, search) }}>검색</Button>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y">
              {schools.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {API_KEY ? '검색 결과가 없습니다.' : '학교 검색을 지금 사용할 수 없습니다. 학교명을 입력하고 [직접 입력]을 눌러 주세요.'}
                </p>
              ) : schools.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.address}</div>
                  </div>
                  <Button size="sm" onClick={() => setSelected(s)}>선택</Button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">찾는 학교가 없나요? 위 칸에 학교명을 입력하고</span>
              <Button size="sm" variant="outline" disabled={!search.trim()}
                onClick={() => setSelected({ id: 'manual', name: search.trim(), address: '' })}>직접 입력</Button>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>&lt;</Button>
                <span className="px-2 self-center text-sm">{page} / {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>&gt;</Button>
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={close}>닫기</Button></DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="font-semibold">{selected.name}</div>
              <div className="text-xs text-muted-foreground">{selected.address}</div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1"><label className="text-sm text-muted-foreground">입학년월 <span className="text-destructive">*</span></label><Input {...fieldProps('admissionDt')} type="month" max={todayMonth()} value={admissionDt} onChange={(e) => { clearField('admissionDt'); setAdmissionDt(e.target.value) }} /></div>
              <div className="space-y-1"><label className="text-sm text-muted-foreground">졸업년월</label><Input type="month" max={todayMonth()} value={graduationDt} onChange={(e) => setGraduationDt(e.target.value)} /></div>
            </div>
            <div className="space-y-1"><label className="text-sm text-muted-foreground">전공명 <span className="text-destructive">*</span></label><Input {...fieldProps('major')} value={major} onChange={(e) => { clearField('major'); setMajor(e.target.value) }} placeholder="전공명을 입력하세요" /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>이전</Button>
              <Button onClick={complete}>완료</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
