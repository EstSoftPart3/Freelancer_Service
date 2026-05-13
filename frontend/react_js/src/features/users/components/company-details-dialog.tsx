import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { DatePicker } from '@/components/date-picker'
import {
  type Company,
  type CompanyVerifyPayload,
  type CompanyCreatePayload,
  AUTH_STATUS,
  userCompanyApi,
} from '../api/users-api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  companySq?: number | null
  onUpdated: (companyNm: string, companySq?: number) => void
  initialValues?: {
    userSq?: number | null
    companyNm?: string | null
    companyAddress?: string | null
    companyDetailAddress?: string | null
  }
}

type DaumPostcodeAddressData = {
  roadAddress?: string
  jibunAddress?: string
  address?: string
  sigungu?: string
  zonecode?: string
}

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: DaumPostcodeAddressData) => void
}) => { open: () => void }

type DaumPostcodeNamespace = {
  Postcode?: DaumPostcodeConstructor
}

export function CompanyDetailsDialog({
  open,
  onOpenChange,
  companySq,
  onUpdated,
  initialValues,
}: Props) {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false) // 인증
  const [isVerified, setIsVerified] = useState(false) // 인증

  // 원본 스냅샷 (변경 감지용)
  const [authSnapshot, setAuthSnapshot] = useState<CompanyVerifyPayload>({
    companyNm: '',
    companyCeoNm: '',
    companyBizNum: '',
    companyOpenDt: '',
  })

  // 폼 상태 (인증 대상 필드 + 인증 외 수정 가능한 정보)
  const [companyNm, setCompanyNm] = useState('')
  const [companyCeoNm, setCompanyCeoNm] = useState('')
  const [companyBizNum, setCompanyBizNum] = useState('')
  const [companyOpenDt, setCompanyOpenDt] = useState<Date | null>(null)

  const [companyUrl, setCompanyUrl] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyDetailAddress, setCompanyDetailAddress] = useState('')
  const [companySigungu, setCompanySigungu] = useState('')
  const [companyZonecode, setCompanyZonecode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    companyUrl?: string
  }>({})

  useEffect(() => {
    if (!open) return

    if (!companySq) {
      setIsLoading(false)
      setIsVerified(false)
      setCompany(null)
      setCompanyNm(initialValues?.companyNm || '')
      setCompanyCeoNm('')
      setCompanyBizNum('')
      setCompanyOpenDt(null)
      setCompanyUrl('')
      setCompanyAddress(initialValues?.companyAddress || '')
      setCompanyDetailAddress(initialValues?.companyDetailAddress || '')
      setCompanySigungu('')
      setCompanyZonecode('')
      setAuthSnapshot({
        companyNm: initialValues?.companyNm || '',
        companyCeoNm: '',
        companyBizNum: '',
        companyOpenDt: '',
      })
      return
    }

    let isMounted = true
    setIsLoading(true)
    setIsVerified(false) // 모달 열릴 때 인증 초기화

    userCompanyApi
      .getCompanyDetail(companySq)
      .then(({ output }) => {
        if (!isMounted || !output) return

        const openDtStr = output.companyOpenDt
          ? format(new Date(output.companyOpenDt), 'yyyy-MM-dd')
          : ''

        setCompany(output)
        setCompanyNm(output.companyNm || '')
        setCompanyCeoNm(output.companyCeoNm || '')
        setCompanyBizNum(output.companyBizNum || '')
        setCompanyOpenDt(
          output.companyOpenDt ? new Date(output.companyOpenDt) : null
        )
        setCompanyUrl(output.companyUrl || '')
        setCompanyAddress(output.companyAddress || '')
        setCompanyDetailAddress(output.companyDetailAddress || '')
        setCompanySigungu('')
        setCompanyZonecode('')

        setAuthSnapshot({
          companyNm: output.companyNm || '',
          companyCeoNm: output.companyCeoNm || '',
          companyBizNum: output.companyBizNum || '',
          companyOpenDt: openDtStr,
        })
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [open, companySq, initialValues])

  const openAddressSearch = () => {
    const openDaumPostcode = () => {
      const daumNamespace = (window as Window & { daum?: DaumPostcodeNamespace })
        .daum
      if (!daumNamespace?.Postcode) return

      new daumNamespace.Postcode({
        oncomplete: (data) => {
          const selectedAddress =
            // data?.roadAddress || data?.jibunAddress || data?.address || ''
            (data as any)?.roadAddress || (data as any)?.jibunAddress
          setCompanyAddress(selectedAddress)
          setCompanySigungu(data?.sigungu || '')
          setCompanyZonecode(data?.zonecode || '')
        },
      }).open()
    }

    const daumNamespace = (window as Window & { daum?: DaumPostcodeNamespace })
      .daum
    if (daumNamespace?.Postcode) {
      openDaumPostcode()
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-daum-postcode="true"]'
    )
    if (existingScript) {
      existingScript.addEventListener('load', openDaumPostcode, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.dataset.daumPostcode = 'true'
    script.onload = openDaumPostcode
    document.body.appendChild(script)
  }

  // 4개 인증 필드 모두 채워져 있는지
  const hasAllAuthFields = useMemo(
    () =>
      !!companyNm.trim() &&
      !!companyCeoNm.trim() &&
      !!companyBizNum.trim() &&
      !!companyOpenDt,
    [companyNm, companyCeoNm, companyBizNum, companyOpenDt]
  )

  // 인증 필드가 원본과 달라졌는지
  const isAuthDirty = useMemo(() => {
    const currentDt = companyOpenDt ? format(companyOpenDt, 'yyyy-MM-dd') : ''
    return (
      companyNm !== authSnapshot.companyNm ||
      companyCeoNm !== authSnapshot.companyCeoNm ||
      companyBizNum !== authSnapshot.companyBizNum ||
      currentDt !== authSnapshot.companyOpenDt
    )
  }, [companyNm, companyCeoNm, companyBizNum, companyOpenDt, authSnapshot])

  /**
   * 저장 버튼 활성 조건
   * 1. 인증 필드 변경 없음 (비인증 필드만 수정)  → 항상 저장 가능
   * 2. 인증 필드 하나라도 비어있음               → 저장 불가능
   * 3. 인증 필드 변경 + 모두 채워짐              → 인증 완료 후 저장 가능
   */
  const canSave = companySq
    ? !isAuthDirty || (hasAllAuthFields && isVerified)
    : hasAllAuthFields && isVerified

  // ── 인증 필드 변경 핸들러 (변경 시 isVerified 초기화) ──
  const withResetVerify =
    <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: T) => {
      setter(value)
      setIsVerified(false)
    }

  const handleVerify = async () => {
    setIsVerifying(true)
    try {
      const response = await userCompanyApi.verifyCompany({
        companyNm,
        companyCeoNm,
        companyBizNum,
        companyOpenDt: format(companyOpenDt!, 'yyyy-MM-dd'),
      })

      if (response.status === 'OK' || response.output === true) {
        setIsVerified(true)
        toast.success('기업 인증 성공', {
          description: '인증이 확인되었습니다.',
        })
      } else {
        setIsVerified(false)
        toast.error('기업 인증 실패', {
          description: response.message || '입력 정보가 일치하지 않습니다.',
        })
      }
    } catch {
      setIsVerified(false)
      toast.error('서버 오류', { description: '인증 중 오류가 발생했습니다.' })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSave = async () => {
    if (!canSave) {
      if (!hasAllAuthFields) {
        toast.error('저장 불가', {
          description:
            '기업명, 대표자명, 개업일자, 사업자등록번호를 모두 입력하세요.',
        })
        return
      }

      if (!isVerified) {
        toast.error('저장 불가', {
          description: '인증하기를 완료한 뒤 저장할 수 있습니다.',
        })
        return
      }

      toast.error('저장 불가', {
        description: '기업 인증을 완료한 뒤 저장할 수 있습니다.',
      })
      return
    }

    // ── 입력값 유효성 검증 ──
    const errors: { companyUrl?: string } = {}
    const urlRegex =
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

    if (companyUrl && !urlRegex.test(companyUrl)) {
      errors.companyUrl =
        '올바른 URL 형식을 입력해주세요. (예: https://example.com)'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error('입력 정보 오류', {
        description: '입력한 정보를 다시 확인해주세요.',
      })
      return
    }

    if (!!companyDetailAddress.trim() && !companyAddress.trim()) {
      toast.error('주소 정보 오류', {
        description: '주소 검색을 이용해 주소를 입력해주세요.',
      })
      return
    }

    setFieldErrors({})

    setIsSaving(true)
    try {
      if (!companySq || !company) {
        if (!initialValues?.userSq) {
          toast.error('등록 실패', {
            description: '회원 정보가 없어 회사를 등록할 수 없습니다.',
          })
          return
        }

        const createPayload: CompanyCreatePayload = {
          userSq: initialValues.userSq,
          companyNm,
          companyCeoNm,
          companyBizNum,
          companyOpenDt: companyOpenDt
            ? format(companyOpenDt, 'yyyy-MM-dd')
            : '',
          companyUrl,
          companyAddress,
          companyDetailAddress,
          companySigungu,
          companyZonecode,
          companyLatitude: '0',
          companyLongitude: '0',
          companyAuthStatusCd: AUTH_STATUS.VERIFIED,
        }

        const formData = new FormData()
        Object.entries(createPayload).forEach(([key, value]) =>
          formData.append(key, String(value))
        )

        const response = await userCompanyApi.createCompany(formData)
        const createdCompanySq = response.output?.companySq

        if (!createdCompanySq) {
          throw new Error('created companySq is missing')
        }

        onUpdated(companyNm, createdCompanySq)
        toast.success('회사 정보 등록 완료')
        onOpenChange(false)
        return
      }

      const formData = new FormData()
      formData.append('companyNm', companyNm)
      formData.append('companyCeoNm', companyCeoNm)
      formData.append('companyBizNum', companyBizNum)
      formData.append(
        'companyOpenDt',
        companyOpenDt ? format(companyOpenDt, 'yyyy-MM-dd') : ''
      )
      formData.append('companyUrl', companyUrl)
      formData.append('companyAddress', companyAddress)
      formData.append('companyDetailAddress', companyDetailAddress)

      // ✅ 2502만 남김 - 2501 분기 완전 제거
      if (isVerified) {
        formData.append('companyAuthStatusCd', AUTH_STATUS.VERIFIED)
      }
      // 인증 필드 미변경 시 → companyAuthStatusCd 미포함 (백엔드 기존값 유지)

      await userCompanyApi.updateCompany(company.companySq, formData)
      onUpdated(companyNm, company.companySq)
      toast.success('회사 정보 수정 완료')
      onOpenChange(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.'
      toast.error('수정 실패', { description: errorMessage })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-1.5'>
            회사 정보
          </DialogTitle>
          <DialogDescription>
            기업 회원과 연결된 회사 정보를 인증하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
            정보를 불러오는 중입니다...
          </div>
        ) : (
          <div className='max-h-[65vh] space-y-5 overflow-y-auto px-1 py-4'>
            {/* ──────────────────────────────
                섹션 1: 기업 인증 필드
            ────────────────────────────── */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                  기업 인증 정보
                </p>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div className='space-y-1.5'>
                  <Label htmlFor='companyNm'>기업명</Label>
                  <Input
                    id='companyNm'
                    value={companyNm}
                    onChange={(e) =>
                      withResetVerify(setCompanyNm)(e.target.value)
                    }
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='companyCeoNm'>대표자명</Label>
                  <Input
                    id='companyCeoNm'
                    value={companyCeoNm}
                    onChange={(e) =>
                      withResetVerify(setCompanyCeoNm)(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label>개업일자</Label>
                <DatePicker
                  selected={companyOpenDt ?? undefined}
                  onSelect={(date) =>
                    withResetVerify(setCompanyOpenDt)(date ?? null)
                  }
                  placeholder='개업일자 선택'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='companyBizNum'>사업자 등록번호</Label>
                <div className='flex gap-2'>
                  <Input
                    id='companyBizNum'
                    value={companyBizNum}
                    onChange={(e) =>
                      withResetVerify(setCompanyBizNum)(
                        e.target.value.replace(/[^0-9]/g, '')
                      )
                    }
                    placeholder='숫자만 입력'
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant={isVerified ? 'outline' : 'default'}
                    disabled={isVerifying || !hasAllAuthFields}
                    onClick={handleVerify}
                    className='shrink-0'
                  >
                    {isVerifying
                      ? '확인 중...'
                      : isVerified
                        ? '인증완료'
                        : '인증하기'}
                  </Button>
                </div>

                {/* 변경 - 빈 필드면 저장 자체가 불가함을 안내 */}
                {!hasAllAuthFields && isAuthDirty && (
                  <p className='text-xs text-red-500'>
                    ⚠ 인증 필드를 모두 입력해야 저장할 수 있습니다.
                  </p>
                )}
                {/* 인증 필드 변경 후 인증 미완료 안내 */}
                {isAuthDirty && hasAllAuthFields && !isVerified && (
                  <p className='text-xs text-orange-500'>
                    인증 정보가 변경되었습니다. 인증하기 버튼을 눌러주세요.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* ──────────────────────────────
                섹션 2: 비인증 필드
            ────────────────────────────── */}
            <div className='space-y-3'>
              <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                추가 정보
              </p>

              <div className='space-y-1.5'>
                <Label htmlFor='companyUrl'>기업 URL</Label>
                <Input
                  id='companyUrl'
                  value={companyUrl}
                  onChange={(e) => {
                    setCompanyUrl(e.target.value)
                    if (fieldErrors.companyUrl) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        companyUrl: undefined,
                      }))
                    }
                  }}
                />
                {fieldErrors.companyUrl && (
                  <p className='text-xs text-destructive'>
                    {fieldErrors.companyUrl}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='companyAddress'>주소</Label>
                <div className='flex gap-2'>
                  <Input
                    id='companyAddress'
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    readOnly
                  />
                  <Button
                    type='button'
                    className='shrink-0'
                    onClick={openAddressSearch}
                  >
                    주소 검색
                  </Button>
                </div>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='companyDetailAddress'>상세 주소</Label>
                <Input
                  id='companyDetailAddress'
                  value={companyDetailAddress}
                  onChange={(e) => setCompanyDetailAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className='flex justify-between sm:justify-between'>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isLoading || isSaving}>
              {isSaving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
