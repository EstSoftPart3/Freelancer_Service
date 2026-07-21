'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2 } from 'lucide-react'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { AffiliationInfo } from '@/types'

export default function AffiliatedInfoClient() {
  const router = useRouter()

  const [info, setInfo] = useState<AffiliationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  useEffect(() => {
    api.get('/mypage/applications/info')
      .then(({ data }) => setInfo(data.output))
      .catch((e) => {
        const msg = e.response?.data?.message
        setErrorMsg(msg === '현재 소속된 기업이 없습니다.' ? msg : '소속 정보를 불러올 수 없습니다.')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleLeave() {
    try {
      await api.patch('/mypage/applications/withdraw', {})
      // Vue: 탈퇴 즉시 소속 플래그 갱신(로그아웃 아님). clearUser는 전체 로그아웃이라 부적합.
      useUserStore.setState({ isAffiliated: false, affiliatedCompanySq: undefined })
      toast.success('소속 탈퇴가 완료되었습니다.')
      router.push('/mypage')
    } catch {
      toast.error('소속 탈퇴 중 오류가 발생했습니다.')
    } finally {
      setShowLeaveConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">소속 정보</h2>
        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">소속 정보</h2>
        <p className="text-muted-foreground">{errorMsg}</p>
      </div>
    )
  }

  if (!info) return null

  const rows: Array<{ label: string; value: string }> = [
    { label: '대표자 이름', value: info.companyCeoNm || '-' },
    { label: '개업일자', value: info.companyOpenDt || '-' },
    { label: '주소', value: info.address || '-' },
    { label: '입사일', value: info.joinDt || '-' },
  ]
  if (info.companyUrl) rows.splice(2, 0, { label: '기업 URL', value: info.companyUrl })

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold">소속 정보</h2>
      <hr />

      <div className="flex justify-center">
        {info.profileImageUrl
          ? <img src={info.profileImageUrl} alt="프로필" className="w-24 h-24 rounded-full object-cover" />
          : <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Building2 className="w-10 h-10" />
            </div>
        }
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-28 text-sm font-semibold shrink-0">기업명</span>
          <span className="text-sm">{info.companyNm}</span>
          {info.companyIsRecruitingYn === 'Y'
            ? <Badge>채용중</Badge>
            : <Badge variant="secondary">채용 마감</Badge>
          }
        </div>
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 text-sm font-semibold shrink-0">{label}</span>
            <span className="text-sm text-muted-foreground">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="destructive" onClick={() => setShowLeaveConfirm(true)}>소속 탈퇴</Button>
      </div>

      <ConfirmDialog
        open={showLeaveConfirm}
        title="소속 탈퇴 안내"
        message={`• 소속 탈퇴 시 해당 소속에서 즉시 제외됩니다.\n• 탈퇴 후 동일 소속에 재가입하려면 처음부터 다시 신청해야 합니다.\n• 탈퇴 처리된 이력은 취소할 수 없습니다.`}
        onConfirm={handleLeave}
        onClose={() => setShowLeaveConfirm(false)}
      />
    </div>
  )
}
