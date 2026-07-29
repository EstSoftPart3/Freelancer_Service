'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import PasswordCheck from '@/components/mypage/PasswordCheck'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import { loadKakaoMaps } from '@/lib/kakao'
import { loadDaumPostcode } from '@/lib/daum'
import type { UserInfo, DaumPostcodeResult } from '@/types'
import { checkNicknameAvailable, NICKNAME_HINT } from '@/lib/nickname'

type EditKey = 'userPw' | 'userEmail' | 'userPhoneNum' | 'address' | 'userNm' | 'userNickname'

interface FormData extends Omit<UserInfo, 'userProfileImageUrl'> {
  detailAddress: string
}

const INITIAL_FORM: FormData = {
  userId: '',
  userPw: '',
  userNm: '',
  userNickname: '',
  userEmail: '',
  userBirthDt: '',
  userGenderNm: '',
  userPhoneNum: '',
  address: '',
  detailAddress: '',
  zonecode: '',
  sigunguCode: '',
  latitude: null,
  longitude: null,
  companyNm: '',
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 py-3 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground sm:w-28 shrink-0 pt-2">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function InformationEditClient() {
  const { getUserType } = useUserStore()
  const userType = getUserType()
  const isPersonal = userType === 'PERSONAL'

  const [confirmed, setConfirmed] = useState(false)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [original, setOriginal] = useState<FormData>(INITIAL_FORM)
  const [editing, setEditing] = useState<Record<EditKey, boolean>>({
    userPw: false,
    userEmail: false,
    userPhoneNum: false,
    address: false,
    userNm: false,
    userNickname: false,
  })
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [editEmail, setEditEmail] = useState({ emailId: '', emailDomain: '', code: '' })
  const [isVerified, setIsVerified] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<EditKey | 'emailVerify', string>>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (confirmed) fetchInfo()
  }, [confirmed])

  async function fetchInfo() {
    try {
      const { data } = await api.get('/mypage/edit/info')
      const d = data.output
      const next: FormData = {
        userId: d.userId ?? '',
        userPw: '',
        userNm: d.userNm ?? '',
        userNickname: d.userNickname ?? '',
        userEmail: d.userEmail ?? '',
        userBirthDt: d.userBirthDt ?? '',
        userGenderNm: d.userGenderNm ?? '',
        userPhoneNum: d.userPhoneNum ?? '',
        address: d.address ?? '',
        detailAddress: d.detailAddress ?? '',
        zonecode: d.zonecode ?? '',
        sigunguCode: d.sigunguCode ?? '',
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        companyNm: d.companyNm ?? '',
      }
      setOriginal(next)
      setForm(next)
      setProfileImageUrl(d.userProfileImageUrl ?? null)
    } catch {
      toast.error('회원 정보를 불러올 수 없습니다.')
    }
  }

  function toggleEdit(field: EditKey) {
    setEditing((prev) => ({ ...prev, [field]: true }))
  }

  function cancelEdit(field: EditKey) {
    setEditing((prev) => ({ ...prev, [field]: false }))
    if (field === 'address') {
      setForm((prev) => ({
        ...prev,
        address: original.address,
        detailAddress: original.detailAddress,
        zonecode: original.zonecode,
        sigunguCode: original.sigunguCode,
        latitude: original.latitude,
        longitude: original.longitude,
      }))
    } else if (field === 'userEmail') {
      setForm((prev) => ({ ...prev, userEmail: original.userEmail }))
      setEditEmail({ emailId: '', emailDomain: '', code: '' })
      setIsVerified(false)
    } else {
      setForm((prev) => ({ ...prev, [field]: original[field] }))
    }
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function confirmField(field: EditKey) {
    if (field === 'userPw' && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(form.userPw)) {
      toast.error('8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.')
      return
    }
    if (field === 'userNickname' && form.userNickname !== original.userNickname) {
      const reason = await checkNicknameAvailable(form.userNickname)
      if (reason) { toast.error(reason); return }
    }
    if (field === 'userEmail' && !isVerified) {
      toast.error('이메일 인증을 완료해주세요.')
      return
    }
    if (field === 'userEmail') {
      setForm((prev) => ({
        ...prev,
        userEmail: `${editEmail.emailId}@${editEmail.emailDomain}`,
      }))
    }
    setEditing((prev) => ({ ...prev, [field]: false }))
  }

  function openPostcode() {
    loadDaumPostcode().then(() => {
      new window.daum.Postcode({
        oncomplete(data: DaumPostcodeResult) {
          const addr =
            data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
          setForm((prev) => ({
            ...prev,
            address: addr,
            detailAddress: '',
            zonecode: data.zonecode,
            sigunguCode: data.sigunguCode,
          }))
          loadKakaoMaps().then(() => {
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.addressSearch(
              addr,
              (result: Array<{ x: string; y: string }>, status: string) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  setForm((prev) => ({
                    ...prev,
                    latitude: Number(result[0].y),
                    longitude: Number(result[0].x),
                  }))
                }
              },
            )
          })
        },
      }).open()
    })
  }

  async function sendVerification() {
    if (!editEmail.emailId || !editEmail.emailDomain) {
      toast.error('이메일을 모두 입력하세요.')
      return
    }
    try {
      await api.post('/email/send-code', {
        email: `${editEmail.emailId}@${editEmail.emailDomain}`,
      })
      toast.success('인증 코드를 전송했습니다.')
      setIsVerified(false)
    } catch {
      toast.error('이메일 인증 요청에 실패했습니다.')
    }
  }

  async function verifyCode() {
    if (!editEmail.code) { toast.error('인증번호를 입력하세요.'); return }
    try {
      await api.post('/email/verify-code', {
        email: `${editEmail.emailId}@${editEmail.emailDomain}`,
        code: editEmail.code,
      })
      setIsVerified(true)
      toast.success('이메일 인증에 성공하였습니다.')
    } catch {
      toast.error('인증번호가 일치하지 않습니다.')
    }
  }

  async function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      await api.post('/mypage/edit/profile-image/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfileImageUrl(URL.createObjectURL(file))
      toast.success('프로필 이미지가 업데이트되었습니다.')
    } catch {
      toast.error('프로필 이미지 업데이트에 실패했습니다.')
    }
  }

  async function removeProfileImage() {
    try {
      await api.delete('/mypage/edit/profile-image')
      setProfileImageUrl(null)
      toast.success('프로필 이미지가 삭제되었습니다.')
    } catch {
      toast.error('프로필 이미지 삭제에 실패했습니다.')
    }
  }

  function isFormChanged() {
    return (
      form.userPw !== '' ||
      form.userEmail !== original.userEmail ||
      form.userPhoneNum !== original.userPhoneNum ||
      form.zonecode !== original.zonecode ||
      form.address !== original.address ||
      form.detailAddress !== original.detailAddress ||
      form.sigunguCode !== original.sigunguCode ||
      form.latitude !== original.latitude ||
      form.longitude !== original.longitude ||
      form.userNickname !== original.userNickname ||
      (!isPersonal && form.userNm !== original.userNm)
    )
  }

  async function handleSave() {
    const anyEditing = Object.values(editing).some(Boolean)
    if (anyEditing) {
      toast.error('수정 중인 항목을 먼저 저장하거나 취소해주세요.')
      return
    }
    if (!isFormChanged()) {
      toast.error('변경된 정보가 없습니다.')
      return
    }
    const payload = isPersonal
      ? {
          personal: {
            userNickname: form.userNickname,
            userPw: form.userPw || undefined,
            userEmail: form.userEmail,
            userPhoneNum: form.userPhoneNum,
            zonecode: form.zonecode,
            address: form.address,
            detailAddress: form.detailAddress,
            sigunguCode: form.sigunguCode,
            latitude: form.latitude,
            longitude: form.longitude,
          },
        }
      : {
          company: {
            userNm: form.userNm,
            userNickname: form.userNickname,
            userPw: form.userPw || undefined,
            userEmail: form.userEmail,
            userPhoneNum: form.userPhoneNum,
            zonecode: form.zonecode,
            address: form.address,
            detailAddress: form.detailAddress,
            sigunguCode: form.sigunguCode,
            latitude: form.latitude,
            longitude: form.longitude,
          },
        }
    try {
      await api.post('/mypage/edit/update', payload)
      toast.success('회원 정보가 수정되었습니다.')
      await fetchInfo()
    } catch (err) {
      // Vue saveAll: 400이면 백엔드 검증 message(비밀번호 규칙 등)를 그대로 노출
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || '회원 정보 수정에 실패했습니다.')
    }
  }

  if (!confirmed) {
    return (
      <PasswordCheck title="회원 정보 수정" onConfirmed={() => setConfirmed(true)} />
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold">회원 정보 수정</h2>

      {/* 프로필 이미지 */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative group w-24 h-24">
          {profileImageUrl ? (
            <>
              <img
                src={profileImageUrl}
                alt="프로필"
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={removeProfileImage}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl text-muted-foreground">
                {isPersonal ? '👤' : '🏢'}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-background border rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-muted"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileImageChange}
          />
        </div>
      </div>

      <div className="space-y-0">
        {/* 아이디 (readonly) */}
        <InfoRow label="아이디">
          <Input value={form.userId} readOnly className="bg-muted border-0" />
        </InfoRow>

        {/* 비밀번호 */}
        <InfoRow label="비밀번호">
          <EditableField
            editing={editing.userPw}
            readonlyContent={<Input type="password" value="••••••••" readOnly className="bg-muted border-0" />}
            editContent={
              <Input
                type="password"
                value={form.userPw}
                onChange={(e) => setForm((p) => ({ ...p, userPw: e.target.value }))}
                placeholder="새 비밀번호 (8자 이상, 영문·숫자·특수문자)"
              />
            }
            onToggle={() => toggleEdit('userPw')}
            onConfirm={() => confirmField('userPw')}
            onCancel={() => cancelEdit('userPw')}
          />
        </InfoRow>

        {/* 이름 */}
        <InfoRow label="이름">
          {isPersonal ? (
            <Input value={form.userNm} readOnly className="bg-muted border-0" />
          ) : (
            <EditableField
              editing={editing.userNm}
              readonlyContent={<Input value={form.userNm} readOnly className="bg-muted border-0" />}
              editContent={
                <Input
                  value={form.userNm}
                  onChange={(e) => setForm((p) => ({ ...p, userNm: e.target.value }))}
                />
              }
              onToggle={() => toggleEdit('userNm')}
              onConfirm={() => confirmField('userNm')}
              onCancel={() => cancelEdit('userNm')}
            />
          )}
        </InfoRow>

        {/* 닉네임 — 커뮤니티 등 공개 화면에 표시되는 이름 */}
        <InfoRow label="닉네임">
          <EditableField
            editing={editing.userNickname}
            readonlyContent={<Input value={form.userNickname} readOnly className="bg-muted border-0" />}
            editContent={
              <div>
                <Input
                  value={form.userNickname}
                  maxLength={20}
                  onChange={(e) => setForm((p) => ({ ...p, userNickname: e.target.value }))}
                  placeholder={NICKNAME_HINT}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  커뮤니티 게시글·댓글에는 실명 대신 닉네임이 표시됩니다.
                </p>
              </div>
            }
            onToggle={() => toggleEdit('userNickname')}
            onConfirm={() => confirmField('userNickname')}
            onCancel={() => cancelEdit('userNickname')}
          />
        </InfoRow>

        {/* 기업명 (COMPANY only) */}
        {!isPersonal && (
          <InfoRow label="기업명">
            <Input value={form.companyNm} readOnly className="bg-muted border-0" />
          </InfoRow>
        )}

        {/* 생년월일 (PERSONAL only) */}
        {isPersonal && form.userBirthDt && (
          <InfoRow label="생년월일">
            <Input type="date" value={form.userBirthDt} readOnly className="bg-muted border-0" />
          </InfoRow>
        )}

        {/* 성별 (PERSONAL only) */}
        {isPersonal && form.userGenderNm && (
          <InfoRow label="성별">
            <Input value={form.userGenderNm} readOnly className="bg-muted border-0" />
          </InfoRow>
        )}

        {/* 이메일 */}
        <InfoRow label="이메일">
          <EditableField
            editing={editing.userEmail}
            readonlyContent={<Input value={form.userEmail} readOnly className="bg-muted border-0" />}
            editContent={
              <div className="space-y-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <Input
                    value={editEmail.emailId}
                    onChange={(e) => setEditEmail((p) => ({ ...p, emailId: e.target.value }))}
                    placeholder="이메일 아이디"
                    className="w-32 flex-1"
                  />
                  <span className="text-muted-foreground">@</span>
                  <Input
                    value={editEmail.emailDomain}
                    onChange={(e) => setEditEmail((p) => ({ ...p, emailDomain: e.target.value }))}
                    placeholder="도메인"
                    list="domain-list"
                    className="w-36 flex-1"
                  />
                  <datalist id="domain-list">
                    {['naver.com', 'gmail.com', 'daum.net', 'nate.com'].map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                  <Button type="button" size="sm" onClick={sendVerification}>
                    인증 요청
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={editEmail.code}
                    onChange={(e) => setEditEmail((p) => ({ ...p, code: e.target.value }))}
                    placeholder="인증번호 입력"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={verifyCode}>
                    확인
                  </Button>
                  {isVerified && (
                    <span className="text-sm text-primary flex items-center">✓ 인증완료</span>
                  )}
                </div>
              </div>
            }
            onToggle={() => toggleEdit('userEmail')}
            onConfirm={() => confirmField('userEmail')}
            onCancel={() => cancelEdit('userEmail')}
          />
        </InfoRow>

        {/* 휴대폰번호 */}
        <InfoRow label="휴대폰번호">
          <EditableField
            editing={editing.userPhoneNum}
            readonlyContent={
              <Input value={formatPhone(form.userPhoneNum)} readOnly className="bg-muted border-0" />
            }
            editContent={
              <Input
                value={form.userPhoneNum}
                onChange={(e) => setForm((p) => ({ ...p, userPhoneNum: e.target.value }))}
                placeholder="숫자만 입력 (하이픈 제외)"
              />
            }
            onToggle={() => toggleEdit('userPhoneNum')}
            onConfirm={() => confirmField('userPhoneNum')}
            onCancel={() => cancelEdit('userPhoneNum')}
          />
        </InfoRow>

        {/* 주소 */}
        <InfoRow label="주소">
          <EditableField
            editing={editing.address}
            readonlyContent={
              <Input
                value={[form.address, form.detailAddress].filter(Boolean).join(' ')}
                readOnly
                className="bg-muted border-0"
              />
            }
            editContent={
              <div className="flex gap-2 flex-wrap">
                <Input
                  value={form.address}
                  readOnly
                  placeholder="주소 검색 클릭"
                  onClick={openPostcode}
                  className="flex-1 cursor-pointer"
                />
                <Input
                  value={form.detailAddress}
                  onChange={(e) => setForm((p) => ({ ...p, detailAddress: e.target.value }))}
                  placeholder="상세주소"
                  className="w-40"
                />
              </div>
            }
            onToggle={() => toggleEdit('address')}
            onConfirm={() => confirmField('address')}
            onCancel={() => cancelEdit('address')}
          />
        </InfoRow>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave}>저장</Button>
        <Button variant="outline" onClick={() => { setForm(original); setEditing({ userPw: false, userEmail: false, userPhoneNum: false, address: false, userNm: false, userNickname: false }) }}>
          초기화
        </Button>
      </div>
    </div>
  )
}

function EditableField({
  editing,
  readonlyContent,
  editContent,
  onToggle,
  onConfirm,
  onCancel,
}: {
  editing: boolean
  readonlyContent: React.ReactNode
  editContent: React.ReactNode
  onToggle: () => void
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1">
        {editing ? editContent : readonlyContent}
      </div>
      <div className="shrink-0 flex gap-1">
        {editing ? (
          <>
            <Button type="button" size="sm" onClick={onConfirm}>확인</Button>
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>취소</Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={onToggle}>수정</Button>
        )}
      </div>
    </div>
  )
}

function formatPhone(num: string): string {
  const clean = (num ?? '').replace(/\D/g, '')
  if (clean.length === 11) return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  if (clean.length === 10) return clean.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
  return num
}
