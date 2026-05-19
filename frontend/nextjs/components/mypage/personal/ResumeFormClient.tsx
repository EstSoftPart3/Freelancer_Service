'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net']

interface Education {
  educationSchoolNm: string
  educationMajorNm: string
  educationAdmissionDt: string
  educationGraduationDt: string
  educationStatusCd: number
}

interface Career {
  careerCompanyNm: string
  careerDepartmentNm: string
  careerPositionNm: string
  careerStartDt: string
  careerEndDt: string
}

interface Training {
  program: string
  institution: string
  period: string
}

interface Certificate {
  certificateName: string
  certificateDate: string
}

interface Skill {
  skillTagNm: string
  skillTagSq?: number
}

interface ResumeFormData {
  resumeTtl: string
  resumeNm: string
  resumeBirthDt: string
  resumePhoneNum: string
  emailId: string
  emailDomain: string
  customDomain: string
  address: string
  detailAddress: string
  zonecode: string
  latitude: string
  longitude: string
  resumeGreetingTxt: string
  resumeIsNotificationYn: boolean
  education: Education[]
  career: Career[]
  trainingHistories: Training[]
  certificates: Certificate[]
  skills: Skill[]
}

interface Props {
  resumeSq?: number
}

export default function ResumeFormClient({ resumeSq }: Props) {
  const router = useRouter()
  const isEdit = !!resumeSq

  const [form, setForm] = useState<ResumeFormData>({
    resumeTtl: '', resumeNm: '', resumeBirthDt: '', resumePhoneNum: '',
    emailId: '', emailDomain: '', customDomain: '',
    address: '', detailAddress: '', zonecode: '', latitude: '', longitude: '',
    resumeGreetingTxt: '', resumeIsNotificationYn: false,
    education: [], career: [], trainingHistories: [], certificates: [], skills: [],
  })

  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [skillSearch, setSkillSearch] = useState('')

  // sub-form visibility
  const [showEduForm, setShowEduForm] = useState(false)
  const [showCareerForm, setShowCareerForm] = useState(false)
  const [showTrainingForm, setShowTrainingForm] = useState(false)
  const [showCertForm, setShowCertForm] = useState(false)
  const [showSkillForm, setShowSkillForm] = useState(false)

  const [eduDraft, setEduDraft] = useState<Education>({ educationSchoolNm: '', educationMajorNm: '', educationAdmissionDt: '', educationGraduationDt: '', educationStatusCd: 0 })
  const [careerDraft, setCareerDraft] = useState<Career>({ careerCompanyNm: '', careerDepartmentNm: '', careerPositionNm: '', careerStartDt: '', careerEndDt: '' })
  const [trainingDraft, setTrainingDraft] = useState<Training>({ program: '', institution: '', period: '' })
  const [certDraft, setCertDraft] = useState<Certificate>({ certificateName: '', certificateDate: '' })

  const setF = (key: keyof ResumeFormData, val: ResumeFormData[typeof key]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const formatPhone = (v: string) => {
    const n = v.replace(/[^0-9]/g, '').slice(0, 11)
    if (n.length >= 8) return n.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3')
    if (n.length >= 4) return n.replace(/(\d{3})(\d{1,4})/, '$1-$2')
    return n
  }

  const openPostcode = () => {
    if (typeof window === 'undefined' || !window.daum) {
      toast.error('주소 검색 서비스를 불러올 수 없습니다.')
      return
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.roadAddress || data.jibunAddress
        setForm((prev) => ({ ...prev, address: addr, zonecode: data.zonecode }))
        if (window.kakao?.maps?.services) {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              setForm((prev) => ({ ...prev, longitude: result[0].x, latitude: result[0].y }))
            }
          })
        }
      },
    }).open()
  }

  const loadResume = useCallback(async () => {
    try {
      const { data } = await api.get(`/mypage/resume/detail/${resumeSq}`)
      const d = data.output
      if (!d) return
      const [emailId, emailDomain] = d.resumeEmail?.split('@') ?? ['', '']
      const isDomainKnown = EMAIL_DOMAINS.includes(emailDomain)
      setForm({
        resumeTtl: d.resumeTtl ?? '',
        resumeNm: d.resumeNm ?? '',
        resumeBirthDt: d.resumeBirthDt ?? '',
        resumePhoneNum: d.resumePhoneNum ?? '',
        emailId,
        emailDomain: isDomainKnown ? emailDomain : 'custom',
        customDomain: isDomainKnown ? '' : emailDomain,
        address: d.address ?? '',
        detailAddress: d.detailAddress ?? '',
        zonecode: d.zonecode ?? '',
        latitude: d.latitude ?? '',
        longitude: d.longitude ?? '',
        resumeGreetingTxt: d.resumeGreetingTxt ?? '',
        resumeIsNotificationYn: d.resumeIsNotificationYn === 'Y',
        education: d.education ?? [],
        career: (d.career ?? []).map((c: Record<string, string>) => ({
          careerCompanyNm: c.careerCompanyNm,
          careerDepartmentNm: c.careerDepartmentNm,
          careerPositionNm: c.careerPositionNm,
          careerStartDt: c.careerStartDt?.substring(0, 7) ?? '',
          careerEndDt: c.careerEndDt?.substring(0, 7) ?? '',
        })),
        trainingHistories: d.trainingHistories ?? [],
        certificates: d.certificates ?? [],
        skills: d.skills ?? [],
      })
    } catch {
      toast.error('이력서 정보를 불러올 수 없습니다.')
    }
  }, [resumeSq])

  useEffect(() => {
    api.get('/mypage/resume/skills').then(({ data }) => {
      setAvailableSkills(data.output ?? data.data ?? [])
    }).catch(() => {})
    if (isEdit) loadResume()
  }, [isEdit, loadResume])

  async function handleSubmit() {
    const email = `${form.emailId}@${form.emailDomain === 'custom' ? form.customDomain : form.emailDomain}`
    const payload = {
      resumeTtl: form.resumeTtl,
      resumeNm: form.resumeNm,
      resumeBirthDt: form.resumeBirthDt,
      resumePhoneNum: form.resumePhoneNum,
      resumeEmail: email,
      address: form.address,
      detailAddress: form.detailAddress,
      zonecode: form.zonecode,
      latitude: form.latitude,
      longitude: form.longitude,
      resumeGreetingTxt: form.resumeGreetingTxt,
      resumeIsNotificationYn: form.resumeIsNotificationYn ? 'Y' : 'N',
      education: form.education,
      career: form.career,
      trainingHistories: form.trainingHistories,
      certificates: form.certificates,
      skills: form.skills,
    }
    try {
      if (isEdit) {
        await api.put(`/mypage/resume/update/${resumeSq}`, payload)
        toast.success('이력서가 수정되었습니다.')
      } else {
        await api.post('/mypage/resume/new', payload)
        toast.success('이력서가 등록되었습니다.')
      }
      router.push('/mypage/resume')
    } catch {
      toast.error('이력서 저장에 실패했습니다.')
    }
  }

  const filteredSkills = availableSkills.filter((s) =>
    s.skillTagNm.toLowerCase().includes(skillSearch.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold">{isEdit ? '이력서 수정' : '이력서 등록'}</h2>

      {/* 이력서 제목 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">이력서 제목</label>
        <Input value={form.resumeTtl} onChange={(e) => setF('resumeTtl', e.target.value)} placeholder="예: 백엔드 개발자 이력서" />
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold">이름</label>
          <Input value={form.resumeNm} onChange={(e) => setF('resumeNm', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">생년월일</label>
          <Input type="date" value={form.resumeBirthDt} onChange={(e) => setF('resumeBirthDt', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">전화번호</label>
          <Input value={form.resumePhoneNum} onChange={(e) => setF('resumePhoneNum', formatPhone(e.target.value))} placeholder="010-0000-0000" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">이메일</label>
          <div className="flex items-center gap-1">
            <Input value={form.emailId} onChange={(e) => setF('emailId', e.target.value)} placeholder="아이디" className="w-28" />
            <span>@</span>
            <select
              value={form.emailDomain}
              onChange={(e) => setF('emailDomain', e.target.value)}
              className="h-9 rounded-md border border-input px-2 text-sm"
            >
              <option value="">선택</option>
              {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
              <option value="custom">직접입력</option>
            </select>
            {form.emailDomain === 'custom' && (
              <Input value={form.customDomain} onChange={(e) => setF('customDomain', e.target.value)} placeholder="도메인" className="w-28" />
            )}
          </div>
        </div>
      </div>

      {/* 주소 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">주소</label>
        <div className="flex gap-2">
          <Input value={form.address} readOnly placeholder="주소 검색을 이용해주세요" className="cursor-pointer" onClick={openPostcode} />
          <Button type="button" variant="outline" onClick={openPostcode}>검색</Button>
        </div>
        <Input value={form.detailAddress} onChange={(e) => setF('detailAddress', e.target.value)} placeholder="상세 주소" />
      </div>

      {/* 학력 */}
      <Section
        title="학력"
        onAdd={() => setShowEduForm(!showEduForm)}
      >
        {showEduForm && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Input value={eduDraft.educationSchoolNm} onChange={(e) => setEduDraft((p) => ({ ...p, educationSchoolNm: e.target.value }))} placeholder="학교명" />
              <Input value={eduDraft.educationMajorNm} onChange={(e) => setEduDraft((p) => ({ ...p, educationMajorNm: e.target.value }))} placeholder="전공" />
              <Input type="month" value={eduDraft.educationAdmissionDt} onChange={(e) => setEduDraft((p) => ({ ...p, educationAdmissionDt: e.target.value }))} />
              <Input type="month" value={eduDraft.educationGraduationDt} onChange={(e) => setEduDraft((p) => ({ ...p, educationGraduationDt: e.target.value }))} placeholder="졸업년월 (재학중이면 비워두세요)" />
            </div>
            <Button size="sm" onClick={() => { setF('education', [...form.education, eduDraft]); setEduDraft({ educationSchoolNm: '', educationMajorNm: '', educationAdmissionDt: '', educationGraduationDt: '', educationStatusCd: 0 }); setShowEduForm(false) }}>추가</Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {form.education.map((e, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {e.educationSchoolNm}{e.educationMajorNm ? ` / ${e.educationMajorNm}` : ''}
              <button onClick={() => setF('education', form.education.filter((_, j) => j !== i))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* 회사 이력 */}
      <Section title="회사 이력" onAdd={() => setShowCareerForm(!showCareerForm)}>
        {showCareerForm && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Input value={careerDraft.careerCompanyNm} onChange={(e) => setCareerDraft((p) => ({ ...p, careerCompanyNm: e.target.value }))} placeholder="회사명" />
              <Input value={careerDraft.careerDepartmentNm} onChange={(e) => setCareerDraft((p) => ({ ...p, careerDepartmentNm: e.target.value }))} placeholder="부서명" />
              <Input value={careerDraft.careerPositionNm} onChange={(e) => setCareerDraft((p) => ({ ...p, careerPositionNm: e.target.value }))} placeholder="직위" />
              <div className="flex gap-1">
                <Input type="month" value={careerDraft.careerStartDt} onChange={(e) => setCareerDraft((p) => ({ ...p, careerStartDt: e.target.value }))} />
                <Input type="month" value={careerDraft.careerEndDt} onChange={(e) => setCareerDraft((p) => ({ ...p, careerEndDt: e.target.value }))} />
              </div>
            </div>
            <Button size="sm" onClick={() => { setF('career', [...form.career, careerDraft]); setCareerDraft({ careerCompanyNm: '', careerDepartmentNm: '', careerPositionNm: '', careerStartDt: '', careerEndDt: '' }); setShowCareerForm(false) }}>추가</Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {form.career.map((c, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {c.careerCompanyNm} {c.careerDepartmentNm} {c.careerPositionNm} ({c.careerStartDt} ~ {c.careerEndDt || '재직중'})
              <button onClick={() => setF('career', form.career.filter((_, j) => j !== i))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* 교육 이력 */}
      <Section title="교육 이력" onAdd={() => setShowTrainingForm(!showTrainingForm)}>
        {showTrainingForm && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-3 gap-2">
              <Input value={trainingDraft.program} onChange={(e) => setTrainingDraft((p) => ({ ...p, program: e.target.value }))} placeholder="과정명" />
              <Input value={trainingDraft.institution} onChange={(e) => setTrainingDraft((p) => ({ ...p, institution: e.target.value }))} placeholder="교육기관" />
              <Input value={trainingDraft.period} onChange={(e) => setTrainingDraft((p) => ({ ...p, period: e.target.value }))} placeholder="기간 (예: 2024.01~2024.03)" />
            </div>
            <Button size="sm" onClick={() => { setF('trainingHistories', [...form.trainingHistories, trainingDraft]); setTrainingDraft({ program: '', institution: '', period: '' }); setShowTrainingForm(false) }}>추가</Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {form.trainingHistories.map((t, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {t.program} / {t.institution} / {t.period}
              <button onClick={() => setF('trainingHistories', form.trainingHistories.filter((_, j) => j !== i))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* 자격증 */}
      <Section title="자격증" onAdd={() => setShowCertForm(!showCertForm)}>
        {showCertForm && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Input value={certDraft.certificateName} onChange={(e) => setCertDraft((p) => ({ ...p, certificateName: e.target.value }))} placeholder="자격증명" />
              <Input type="date" value={certDraft.certificateDate} onChange={(e) => setCertDraft((p) => ({ ...p, certificateDate: e.target.value }))} />
            </div>
            <Button size="sm" onClick={() => { setF('certificates', [...form.certificates, certDraft]); setCertDraft({ certificateName: '', certificateDate: '' }); setShowCertForm(false) }}>추가</Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {form.certificates.map((c, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {c.certificateName}
              <button onClick={() => setF('certificates', form.certificates.filter((_, j) => j !== i))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* 보유 기술 */}
      <Section title="보유 기술" onAdd={() => setShowSkillForm(!showSkillForm)}>
        {showSkillForm && (
          <div className="border rounded-md p-3 space-y-2 bg-muted/30">
            <Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="기술 검색" />
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {filteredSkills.map((s) => (
                <button
                  key={s.skillTagSq ?? s.skillTagNm}
                  className="px-2 py-1 text-xs border rounded hover:bg-accent"
                  onClick={() => {
                    if (!form.skills.some((x) => x.skillTagNm === s.skillTagNm)) {
                      setF('skills', [...form.skills, s])
                    }
                  }}
                >
                  {s.skillTagNm}
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowSkillForm(false)}>닫기</Button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {form.skills.map((s, i) => (
            <Badge key={i} variant="secondary" className="gap-1 pr-1">
              {s.skillTagNm}
              <button onClick={() => setF('skills', form.skills.filter((_, j) => j !== i))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* 자기소개 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">자기소개</label>
        <Textarea
          value={form.resumeGreetingTxt}
          onChange={(e) => setF('resumeGreetingTxt', e.target.value)}
          rows={6}
          placeholder="자기소개를 입력해 주세요."
        />
      </div>

      {/* 알림 여부 */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="notify"
          checked={form.resumeIsNotificationYn}
          onCheckedChange={(v) => setF('resumeIsNotificationYn', v === true)}
        />
        <label htmlFor="notify" className="text-sm cursor-pointer">알림 발신 여부</label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>{isEdit ? '수정하기' : '등록하기'}</Button>
        <Button variant="outline" onClick={() => router.push('/mypage/resume')}>취소</Button>
      </div>
    </div>
  )
}

function Section({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold">{title}</label>
        <button className="text-xs text-muted-foreground hover:text-primary" onClick={onAdd}>+ 추가하기</button>
      </div>
      {children}
    </div>
  )
}
