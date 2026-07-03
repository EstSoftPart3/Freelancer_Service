'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import api from '@/lib/api'

export interface CertificationItem {
  certificationCd: number | null
  certificationNm: string
  certificationIssuerNm: string
}
interface CertOption { certificateCd: number; certificateNm: string }

interface Props {
  open: boolean
  onClose: () => void
  onComplete: (item: CertificationItem) => void
}

export default function CertificateModal({ open, onClose, onComplete }: Props) {
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState<CertOption[]>([])
  const [selected, setSelected] = useState<CertOption | null>(null)
  const [issuer, setIssuer] = useState('')

  const fetchCerts = async () => {
    try {
      const { data } = await api.get('/mypage/resume/certificates', { params: { searchNm: search.trim() || undefined, page: 1, size: 10 } })
      setOptions(data.output?.certificates ?? [])
    } catch { toast.error('자격증을 불러올 수 없습니다.') }
  }

  const reset = () => { setSearch(''); setOptions([]); setSelected(null); setIssuer('') }
  const close = () => { reset(); onClose() }

  const submit = () => {
    if (!selected) return toast.error('자격증을 선택하세요.')
    onComplete({ certificationCd: selected.certificateCd, certificationNm: selected.certificateNm, certificationIssuerNm: issuer })
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>자격증 추가하기</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchCerts() } }} placeholder="자격증명 검색" />
            <Button type="button" variant="outline" onClick={fetchCerts}>검색</Button>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-md border divide-y">
            {options.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            ) : options.map((c) => (
              <button key={c.certificateCd} type="button" onClick={() => setSelected(c)}
                className={`block w-full px-3 py-2 text-left text-sm cursor-pointer ${selected?.certificateCd === c.certificateCd ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}>
                {c.certificateNm}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">발급기관</label>
            <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="발급기관" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>저장하기</Button>
          <Button variant="outline" onClick={close}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
