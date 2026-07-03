'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

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

// Vue EducationSearchModal과 동일한 career.go.kr 학교정보 OpenAPI
const API_KEY = '28c12cecb3e103d5b10acd6a0e76209f'
const PER_PAGE = 3

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

  const fetchSchools = useCallback(async (p: number, gubun: 'high' | 'univ', keyword: string) => {
    try {
      const url = new URL('https://www.career.go.kr/cnet/openapi/getOpenApi')
      url.search = new URLSearchParams({
        apiKey: API_KEY, svcType: 'api', svcCode: 'SCHOOL', contentType: 'json',
        gubun: gubun === 'high' ? 'high_list' : 'univ_list',
        thisPage: String(p), perPage: String(PER_PAGE), searchSchulNm: keyword.trim(),
      }).toString()
      const res = await fetch(url.toString())
      const data = await res.json()
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
      toast.error('학교 검색에 실패했습니다.')
    }
  }, [])

  useEffect(() => {
    if (open && !selected) fetchSchools(page, tab, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tab, page])

  const reset = () => { setTab('high'); setSearch(''); setSchools([]); setPage(1); setTotalPages(1); setSelected(null); setAdmissionDt(''); setGraduationDt(''); setMajor('') }
  const close = () => { reset(); onClose() }

  const complete = () => {
    if (!admissionDt) return toast.error('입학년월을 입력해주세요.')
    if (!major.trim()) return toast.error('전공명을 입력하세요.')
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
                <p className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-sm text-muted-foreground">입학년월 <span className="text-destructive">*</span></label><Input type="month" max="9999-12" value={admissionDt} onChange={(e) => setAdmissionDt(e.target.value)} onKeyDown={(e) => e.preventDefault()} /></div>
              <div className="space-y-1"><label className="text-sm text-muted-foreground">졸업년월</label><Input type="month" max="9999-12" value={graduationDt} onChange={(e) => setGraduationDt(e.target.value)} onKeyDown={(e) => e.preventDefault()} /></div>
            </div>
            <div className="space-y-1"><label className="text-sm text-muted-foreground">전공명 <span className="text-destructive">*</span></label><Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="전공명을 입력하세요" /></div>
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
