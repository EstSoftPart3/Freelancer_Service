'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ResumeDetailModal from '@/components/mypage/personal/ResumeDetailModal'
import api from '@/lib/api'

// GET /mypage/applications/{sq} → output: { apply, affiliation } (백엔드 ApplyResponse)
interface Affiliation {
  companyNm?: string
  ceoNm?: string
  openYear?: number
  address?: string
  greeting?: string
  tags?: string[]
}
interface Apply {
  resumeTtl?: string
  resumeSq?: number
  greeting?: string
}

interface Props {
  applicationSq: number | null
  onClose: () => void
}

export default function AffiliationRequestDetailModal({ applicationSq, onClose }: Props) {
  const [affiliation, setAffiliation] = useState<Affiliation | null>(null)
  const [apply, setApply] = useState<Apply | null>(null)
  const [resumeSq, setResumeSq] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (applicationSq == null) return
    try {
      const { data } = await api.get(`/mypage/applications/${applicationSq}`)
      const out = data.output ?? {}
      setAffiliation(out.affiliation ?? null)
      setApply(out.apply ?? null)
    } catch {
      setAffiliation(null)
      setApply(null)
    }
  }, [applicationSq])

  useEffect(() => { if (applicationSq != null) load() }, [applicationSq, load])

  return (
    <>
      <Dialog open={applicationSq != null} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="max-h-[90vh] w-[95vw] sm:max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>소속 신청 내역</DialogTitle></DialogHeader>
          {!affiliation ? (
            <p className="py-10 text-center text-sm text-muted-foreground">불러오는 중...</p>
          ) : (
            <div className="space-y-4 text-sm">
              <Field label="회사명">{affiliation.companyNm}</Field>
              <Field label="대표자명">{affiliation.ceoNm || '-'}</Field>
              <Field label="개업년수">{affiliation.openYear != null ? `${affiliation.openYear}년` : '-'}</Field>
              <Field label="회사위치">{affiliation.address || '-'}</Field>
              <Field label="회사 설명"><span className="whitespace-pre-wrap">{affiliation.greeting}</span></Field>
              {affiliation.tags && affiliation.tags.length > 0 && (
                <Field label="관련 태그">
                  <div className="flex flex-wrap gap-1.5">
                    {affiliation.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </Field>
              )}
              <Field label="소속 신청한 이력서">
                {apply?.resumeSq != null ? (
                  <button type="button" className="text-primary underline hover:no-underline" onClick={() => setResumeSq(apply.resumeSq!)}>
                    {apply.resumeTtl}
                  </button>
                ) : (
                  <span>{apply?.resumeTtl ?? '-'}</span>
                )}
              </Field>
              <Field label="간단한 자기소개"><span className="whitespace-pre-wrap">{apply?.greeting}</span></Field>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 신청한 이력서 상세 (Vue: openResumeModal → ResumeDetailModal) */}
      <ResumeDetailModal resumeSq={resumeSq} onClose={() => setResumeSq(null)} />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-primary">{label}</p>
      <div className="text-foreground">{children}</div>
    </div>
  )
}
