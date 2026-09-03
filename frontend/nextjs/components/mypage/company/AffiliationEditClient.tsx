'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2 } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import CompanyVerificationModal from '@/components/mypage/company/CompanyVerificationModal'
import api from '@/lib/api'
import { getApiErrorMessage } from '@/lib/errors'
import { loadKakaoMaps } from '@/lib/kakao'
import { loadDaumPostcode } from '@/lib/daum'
import type { AffiliationEditInfo } from '@/types'
import { useFormErrors } from '@/hooks/useFormErrors'
import { InvalidFrame } from '@/components/ui/invalid-frame'

type EditKey = 'companyUrl' | 'userPhoneNum' | 'address' | 'companyGreetingTxt' | 'tagNm'

interface FormState extends Omit<AffiliationEditInfo, 'tagNm'> {
  tagNm: string[]
  detailAddress: string
  zonecode: string
  sigunguCode: string
  latitude: number | null
  longitude: number | null
}

export default function AffiliationEditClient() {
  const { companyAuthStatusCd } = useUserStore()
  const isAuthorized = String(companyAuthStatusCd) !== '2501'
  const [verifyOpen, setVerifyOpen] = useState(false)

  const [form, setForm] = useState<FormState | null>(null)
  const [original, setOriginal] = useState<FormState | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<EditKey, boolean>>({
    companyUrl: false, userPhoneNum: false, address: false, companyGreetingTxt: false, tagNm: false,
  })
  const [tagInput, setTagInput] = useState('')
  const { markInvalid, bindRef, isInvalid, clearField } = useFormErrors<EditKey>()
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchInfo() {
    try {
      const { data } = await api.get('/mypage/edit/affiliation/info')
      const d = data.output
      const f: FormState = {
        companyIsRecruitingYn: d.companyIsRecruitingYn,
        companyNm: d.companyNm,
        companyCeoNm: d.companyCeoNm,
        companyOpenDt: d.companyOpenDt,
        companyUrl: d.companyUrl ?? '',
        userPhoneNum: d.userPhoneNum ?? '',
        address: d.address ?? '',
        joinDt: d.joinDt,
        profileImageUrl: d.profileImageUrl,
        detailAddress: d.detailAddress ?? '',
        zonecode: d.zonecode ?? '',
        sigunguCode: d.sigunguCode ?? '',
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        companyGreetingTxt: d.companyGreetingTxt ?? '',
        tagNm: Array.isArray(d.tagNm) ? [...d.tagNm] : [],
        companyProfileImageUrl: d.companyProfileImageUrl,
      }
      setForm(f)
      setOriginal(JSON.parse(JSON.stringify(f)))
      setProfileImageUrl(d.companyProfileImageUrl ?? null)
    } catch {
      toast.error('소속 정보를 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInfo() }, [])

  function toggleEdit(key: EditKey) {
    clearField(key)
    setEditing((prev) => ({ ...prev, [key]: true }))
  }

  function cancelEdit(key: EditKey) {
    clearField(key)
    if (!original || !form) return
    if (key === 'address') {
      setForm((prev) => prev ? {
        ...prev,
        address: original.address,
        detailAddress: original.detailAddress,
        zonecode: original.zonecode,
        sigunguCode: original.sigunguCode,
        latitude: original.latitude,
        longitude: original.longitude,
      } : prev)
    } else if (key === 'tagNm') {
      setForm((prev) => prev ? { ...prev, tagNm: [...original.tagNm] } : prev)
    } else {
      setForm((prev) => prev ? { ...prev, [key]: original[key as keyof FormState] } : prev)
    }
    setEditing((prev) => ({ ...prev, [key]: false }))
  }

  function confirmEdit(key: EditKey) {
    clearField(key)
    setEditing((prev) => ({ ...prev, [key]: false }))
  }

  function openPostcode() {
    loadDaumPostcode().then(() => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
          setForm((prev) => prev ? { ...prev, address: addr, zonecode: data.zonecode, sigunguCode: data.sigunguCode, detailAddress: '' } : prev)
          // 좌표는 지오코딩으로 따로 채운다. 실패를 조용히 넘기면 주소만 있고 좌표가 빈 채로 저장된다
          // (2026-09-02 공고 등록에서 같은 구조로 500 이 났다). 실패하면 알린다.
          setForm((prev) => prev ? { ...prev, latitude: null, longitude: null } : prev)
          loadKakaoMaps().then(() => {
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.addressSearch(addr, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                setForm((prev) => prev ? { ...prev, latitude: Number(result[0].y), longitude: Number(result[0].x) } : prev)
              } else {
                setForm((prev) => prev ? { ...prev, latitude: null, longitude: null } : prev)
                toast.error('주소의 좌표를 찾지 못했습니다. 다른 주소로 다시 검색해주세요.')
              }
            })
          }).catch(() => {
            setForm((prev) => prev ? { ...prev, latitude: null, longitude: null } : prev)
            toast.error('지도 서비스를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.')
          })
        },
      }).open()
    })
  }

  async function onProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post('/mypage/edit/affiliation/profile-image/update', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfileImageUrl(URL.createObjectURL(file))
      toast.success('프로필 이미지가 업데이트되었습니다.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, '프로필 이미지 업데이트에 실패했습니다.'))
    }
  }

  async function removeProfileImage() {
    try {
      await api.delete('/mypage/edit/affiliation/profile-image')
      setProfileImageUrl(null)
      toast.success('프로필 이미지가 삭제되었습니다.')
    } catch (err) {
      toast.error(getApiErrorMessage(err, '프로필 이미지 삭제에 실패했습니다.'))
    }
  }

  async function onRecruitingChange(checked: boolean) {
    if (!form) return
    const yn = checked ? 'Y' : 'N'
    setForm((prev) => prev ? { ...prev, companyIsRecruitingYn: yn } : prev)
    if (!checked) {
      try {
        await api.post('/mypage/edit/affiliation/recruiting/cancel')
        await fetchInfo()
        toast.success('모집이 해제되었습니다.')
      } catch (err) {
        toast.error(getApiErrorMessage(err, '모집 상태 해제 중 오류가 발생했습니다.'))
      }
    }
  }

  async function saveAll() {
    if (!form) return
    // 열려 있는 행이 원인이므로, 그 행들을 모두 프레임 처리하고 첫 행으로 이동한다.
    const openRows = (Object.keys(editing) as EditKey[]).filter((k) => editing[k])
    if (openRows.length > 0) {
      markInvalid(openRows, '수정 중인 항목을 먼저 저장하거나 취소해주세요.')
      return
    }
    try {
      await api.post('/mypage/edit/affiliation/update', {
        userPhoneNum: form.userPhoneNum,
        companyUrl: form.companyUrl,
        zonecode: form.zonecode,
        address: form.address,
        detailAddress: form.detailAddress,
        sigunguCode: form.sigunguCode,
        latitude: form.latitude,
        longitude: form.longitude,
        companyGreetingTxt: form.companyGreetingTxt,
        tagNm: form.tagNm,
        companyIsRecruitingYn: form.companyIsRecruitingYn,
      })
      toast.success('소속 정보가 수정되었습니다.')
      await fetchInfo()
    } catch (err) {
      toast.error(getApiErrorMessage(err, '소속 정보 수정에 실패했습니다.'))
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">소속 정보 수정</h2>
      <Skeleton className="h-32 w-32 rounded-full mx-auto" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )

  if (!form) return null

  const isDisabled = !isAuthorized || form.companyIsRecruitingYn !== 'Y'

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold">소속 정보 수정</h2>

      {!isAuthorized && (
        <div className="border rounded-md p-4 text-center space-y-2">
          <p className="font-semibold">기업 인증이 완료되지 않았습니다.</p>
          <p className="text-sm text-muted-foreground">소속 모집 공고를 등록하시려면 기업 실명 인증이 필수입니다.</p>
          <Button size="lg" className="px-8" onClick={() => setVerifyOpen(true)}>
            지금 바로 기업 인증하기
          </Button>
        </div>
      )}

      <CompanyVerificationModal
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onSuccess={() => {
          // 인증 완료 → 전역 상태 즉시 변경(배너 제거) + 소속 정보 재조회 (Vue openVerification.onSuccess)
          useUserStore.setState({ companyAuthStatusCd: '2502' })
          fetchInfo()
        }}
      />

      {/* 프로필 이미지 */}
      <div className="flex justify-center">
        <div className="relative group">
          {profileImageUrl
            ? <img src={profileImageUrl} alt="프로필" className="w-24 h-24 rounded-full object-cover" />
            : <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Building2 className="w-10 h-10" /></div>
          }
          {profileImageUrl && (
            <button onClick={removeProfileImage} className="absolute top-0 right-0 bg-background rounded-full w-5 h-5 text-xs flex items-center justify-center border">×</button>
          )}
          <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-background rounded-full w-7 h-7 text-xs flex items-center justify-center border">📷</button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onProfileImageChange} />
        </div>
      </div>

      {/* 소속 모집 여부 */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="recruiting"
          checked={form.companyIsRecruitingYn === 'Y'}
          onCheckedChange={(v) => onRecruitingChange(v === true)}
          disabled={!isAuthorized}
        />
        <label htmlFor="recruiting" className="text-sm cursor-pointer">모집중</label>
      </div>

      {/* 읽기 전용 필드들 */}
      {[
        { label: '대표자 이름', value: form.companyCeoNm ?? '-' },
        { label: '기업명', value: form.companyNm },
        { label: '개업일자', value: form.companyOpenDt ?? '-' },
      ].map(({ label, value }) => (
        <div key={label} className="grid grid-cols-3 items-center gap-4">
          <label className="text-sm font-semibold">{label}</label>
          <span className="col-span-2 text-sm text-muted-foreground">{value}</span>
        </div>
      ))}

      {/* 편집 가능 필드들 */}
      <EditableRow
        label="기업 URL"
        editing={editing.companyUrl}
        invalid={isInvalid('companyUrl')}
        bindRef={bindRef('companyUrl')}
        disabled={isDisabled}
        viewContent={<span className="text-sm text-muted-foreground">{form.companyUrl || '-'}</span>}
        editContent={<Input value={form.companyUrl} onChange={(e) => setForm((p) => p ? { ...p, companyUrl: e.target.value } : p) } />}
        onToggle={() => toggleEdit('companyUrl')}
        onConfirm={() => confirmEdit('companyUrl')}
        onCancel={() => cancelEdit('companyUrl')}
      />

      <EditableRow
        label="대표번호"
        editing={editing.userPhoneNum}
        invalid={isInvalid('userPhoneNum')}
        bindRef={bindRef('userPhoneNum')}
        disabled={isDisabled}
        viewContent={<span className="text-sm text-muted-foreground">{form.userPhoneNum || '-'}</span>}
        editContent={<Input value={form.userPhoneNum} onChange={(e) => setForm((p) => p ? { ...p, userPhoneNum: e.target.value } : p)} />}
        onToggle={() => toggleEdit('userPhoneNum')}
        onConfirm={() => confirmEdit('userPhoneNum')}
        onCancel={() => cancelEdit('userPhoneNum')}
      />

      <EditableRow
        label="주소"
        editing={editing.address}
        invalid={isInvalid('address')}
        bindRef={bindRef('address')}
        disabled={isDisabled}
        viewContent={<span className="text-sm text-muted-foreground">{form.address} {form.detailAddress}</span>}
        editContent={
          <div className="flex gap-2">
            <Input value={form.address} readOnly placeholder="주소 검색" className="cursor-pointer" onClick={openPostcode} />
            <Input value={form.detailAddress} onChange={(e) => setForm((p) => p ? { ...p, detailAddress: e.target.value } : p)} placeholder="상세주소" />
          </div>
        }
        onToggle={() => toggleEdit('address')}
        onConfirm={() => confirmEdit('address')}
        onCancel={() => cancelEdit('address')}
      />

      <EditableRow
        label="모집 내용"
        editing={editing.companyGreetingTxt}
        invalid={isInvalid('companyGreetingTxt')}
        bindRef={bindRef('companyGreetingTxt')}
        disabled={isDisabled}
        viewContent={<p className="text-sm text-muted-foreground whitespace-pre-line">{form.companyGreetingTxt || '-'}</p>}
        editContent={<Textarea value={form.companyGreetingTxt} onChange={(e) => setForm((p) => p ? { ...p, companyGreetingTxt: e.target.value } : p)} rows={4} />}
        onToggle={() => toggleEdit('companyGreetingTxt')}
        onConfirm={() => confirmEdit('companyGreetingTxt')}
        onCancel={() => cancelEdit('companyGreetingTxt')}
      />

      {/* 태그 */}
      <div className="grid grid-cols-3 items-start gap-4">
        <label className="text-sm font-semibold pt-1">태그</label>
        <div className="col-span-2 flex items-start justify-between gap-2">
          <InvalidFrame ref={bindRef('tagNm')} invalid={isInvalid('tagNm')} className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap gap-2">
              {form.tagNm.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  {editing.tagNm && (
                    <button onClick={() => setForm((p) => p ? { ...p, tagNm: p.tagNm.filter((t) => t !== tag) } : p)} className="ml-1 hover:text-destructive">×</button>
                  )}
                </Badge>
              ))}
            </div>
            {editing.tagNm && (
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    setForm((p) => p ? { ...p, tagNm: [...p.tagNm, tagInput.trim()] } : p)
                    setTagInput('')
                  }
                }}
                placeholder="태그 입력 후 Enter"
              />
            )}
          </InvalidFrame>
          <div className="flex gap-2 shrink-0">
            {!editing.tagNm
              ? <Button size="sm" variant="outline" disabled={isDisabled} onClick={() => toggleEdit('tagNm')}>수정</Button>
              : (
                <>
                  <Button size="sm" onClick={() => confirmEdit('tagNm')}>확인</Button>
                  <Button size="sm" variant="outline" onClick={() => cancelEdit('tagNm')}>취소</Button>
                </>
              )
            }
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 pt-4">
        <Button onClick={saveAll} disabled={isDisabled}>저장</Button>
        <Button variant="outline" onClick={() => form && original && setForm(JSON.parse(JSON.stringify(original)))}>초기화</Button>
      </div>
    </div>
  )
}

function EditableRow({
  label, editing, disabled, viewContent, editContent, onToggle, onConfirm, onCancel, invalid, bindRef,
}: {
  label: string
  editing: boolean
  disabled?: boolean
  viewContent: React.ReactNode
  editContent: React.ReactNode
  onToggle: () => void
  onConfirm: () => void
  onCancel: () => void
  invalid?: boolean
  bindRef?: (el: HTMLElement | null) => void
}) {
  return (
    <div className="grid grid-cols-3 items-start gap-4">
      <label className="text-sm font-semibold pt-1">{label}</label>
      <div className="col-span-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 pt-1">
          {editing
            ? <InvalidFrame ref={bindRef} invalid={invalid}>{editContent}</InvalidFrame>
            : viewContent}
        </div>
        <div className="flex gap-2 shrink-0">
          {!editing
            ? <Button size="sm" variant="outline" disabled={disabled} onClick={onToggle}>수정</Button>
            : (
              <>
                <Button size="sm" onClick={onConfirm}>확인</Button>
                <Button size="sm" variant="outline" onClick={onCancel}>취소</Button>
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}
