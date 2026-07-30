import { toast } from 'sonner'
import { CompanyDetailsDialog } from '@/features/users/components/company-details-dialog'
import { useCompany } from './company-provider'

/**
 * 소속 수정 다이얼로그.
 *
 * <p>유저 관리에서 쓰던 {@code CompanyDetailsDialog}(주소검색·사업자 인증 포함)를 그대로 재사용한다.
 * 573줄짜리 폼을 복제하면 사업자 인증 규칙이 두 곳으로 갈라져 한쪽만 고쳐지는 사고가 난다.</p>
 */
export function CompanyDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, refresh } = useCompany()

  if (!currentRow) return null

  return (
    <CompanyDetailsDialog
      key={`edit-${currentRow.companySq}`}
      open={open === 'edit'}
      onOpenChange={(v) => {
        setOpen(v ? 'edit' : null)
        if (!v) setCurrentRow(null)
      }}
      companySq={currentRow.companySq}
      initialValues={{
        userSq: currentRow.userSq ?? null,
        companyNm: currentRow.companyNm ?? null,
        companyAddress: currentRow.companyAddress ?? null,
        companyDetailAddress: currentRow.companyDetailAddress ?? null,
      }}
      onUpdated={(companyNm) => {
        toast.success(`"${companyNm}" 소속 정보가 저장되었습니다.`)
        setOpen(null)
        setCurrentRow(null)
        refresh()
      }}
    />
  )
}
