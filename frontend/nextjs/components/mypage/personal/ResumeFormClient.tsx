'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { loadKakaoMaps } from '@/lib/kakao'
import { loadDaumPostcode } from '@/lib/daum'
import EducationModal from '@/components/mypage/personal/EducationModal'
import CareerModal from '@/components/mypage/personal/CareerModal'
import TrainingModal from '@/components/mypage/personal/TrainingModal'
import ProjectHistoryModal from '@/components/mypage/personal/ProjectHistoryModal'
import CertificateModal from '@/components/mypage/personal/CertificateModal'
import SkillSelectModal from '@/components/mypage/personal/SkillSelectModal'

const EMAIL_DOMAINS = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net']

// 백엔드 ResumeRequestDTO 구조에 맞춘 타입
interface ResumeFile {
  fileSq?: number
  fileOriginalNm?: string
  fileSaveNm?: string
  fileTyp?: string
  fileSize?: number
  url?: string
}
interface SkillTag {
  skillTagSq: number
  parentSkillTagSq?: number | null
  skillTagLvl?: number
  skillTagNm: string
}
interface Education {
  educationSchoolNm: string
  educationMajorNm: string
  educationAdmissionDt: string // yyyy-MM (input) → 제출 시 yyyy-MM-01
  educationGraduationDt: string
  educationStatusCd?: number
}
interface Career {
  careerCompanyNm: string
  careerDepartmentNm: string
  careerPositionNm: string
  careerStartDt: string // yyyy-MM
  careerEndDt: string
}
interface Training {
  trainingProgramNm: string
  trainingInstitutionNm: string
  trainingStartDt: string // yyyy-MM
  trainingEndDt: string
}
interface Certification {
  certificationCd?: number | null
  certificationNm: string
  certificationIssuerNm: string
}
interface ProjectHistory {
  projectHistoryClient: string
  projectHistoryTypeCd?: number | null // 업무단 (parent 1100)
  projectHistoryJobPositionTypeCd?: number | null // 역할/직군 (parent 1000)
  projectHistoryTask: string
  projectHistoryStartDt: string // yyyy-MM-dd
  projectHistoryEndDt: string
  skillTagList: SkillTag[]
  isExpanded?: boolean
}
interface CommonCode {
  commonCodeSq: number
  commonCodeNm: string
}

interface Props {
  resumeSq?: number
}

// yyyy-MM → yyyy-MM-01 (백엔드 LocalDate)
const toFirstDay = (ym: string) => (ym && /^\d{4}-\d{2}$/.test(ym) ? `${ym}-01` : ym || null)
const toMonth = (d?: string) => (d ? d.substring(0, 7) : '')
const today = () => new Date().toISOString().slice(0, 10)

export default function ResumeFormClient({ resumeSq }: Props) {
  const router = useRouter()
  const isEdit = !!resumeSq

  // 기본 정보
  const [resumeTtl, setResumeTtl] = useState('')
  const [resumeNm, setResumeNm] = useState('')
  const [resumeBirthDt, setResumeBirthDt] = useState('')
  const [resumePhoneNum, setResumePhoneNum] = useState('')
  const [emailId, setEmailId] = useState('')
  const [emailDomain, setEmailDomain] = useState('')
  const [customDomain, setCustomDomain] = useState('')
  const [resumeGreetingTxt, setResumeGreetingTxt] = useState('')
  const [resumeIsNotificationYn, setResumeIsNotificationYn] = useState(false)
  const [resumeIsRepresentativeYn, setResumeIsRepresentativeYn] = useState(false)

  // 주소 (중첩 AddressDTO)
  const [address, setAddress] = useState({
    addressSq: null as number | null,
    areaCodeSq: null as number | null,
    zonecode: '', address: '', detailAddress: '', sigungu: '',
    latitude: '', longitude: '',
  })

  // 리스트
  const [educationList, setEducationList] = useState<Education[]>([])
  const [careerList, setCareerList] = useState<Career[]>([])
  const [trainingList, setTrainingList] = useState<Training[]>([])
  const [certificationList, setCertificationList] = useState<Certification[]>([])
  const [projectHistoryList, setProjectHistoryList] = useState<ProjectHistory[]>([])
  const [skillTagList, setSkillTagList] = useState<SkillTag[]>([])

  // 파일
  const [profileExisting, setProfileExisting] = useState<ResumeFile | null>(null)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState('')
  const [attachExisting, setAttachExisting] = useState<ResumeFile[]>([])
  const [attachFiles, setAttachFiles] = useState<File[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)

  // 참조 데이터
  const [allSkills, setAllSkills] = useState<SkillTag[]>([])
  const [roleTypes, setRoleTypes] = useState<CommonCode[]>([])
  const [taskTypes, setTaskTypes] = useState<CommonCode[]>([])

  // 모달 토글 (학력/회사/교육/프로젝트는 모달, 자격증/보유기술은 인라인)
  const [eduOpen, setEduOpen] = useState(false)
  const [careerOpen, setCareerOpen] = useState(false)
  const [trainingOpen, setTrainingOpen] = useState(false)
  const [projectOpen, setProjectOpen] = useState(false)
  const [certOpen, setCertOpen] = useState(false)
  const [skillOpen, setSkillOpen] = useState(false)

  const formatPhone = (v: string) => {
    const n = v.replace(/[^0-9]/g, '').slice(0, 11)
    if (n.length >= 8) return n.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3')
    if (n.length >= 4) return n.replace(/(\d{3})(\d{1,4})/, '$1-$2')
    return n
  }

  const openPostcode = () => {
    loadDaumPostcode().then(() => {
      new window.daum.Postcode({
        oncomplete: (data: { roadAddress?: string; jibunAddress?: string; zonecode: string; sigungu?: string; sigunguCode?: string }) => {
          const addr = data.roadAddress || data.jibunAddress || ''
          // Daum sigunguCode → 백엔드 TBL_AREA_C.area_code_sq (이걸로 sigungu를 서브쿼리 조회함)
          setAddress((prev) => ({ ...prev, address: addr, zonecode: data.zonecode, sigungu: data.sigungu ?? '', areaCodeSq: data.sigunguCode ? Number(data.sigunguCode) : null }))
          loadKakaoMaps().then(() => {
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.addressSearch(addr, (result: Array<{ x: string; y: string }>, status: string) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                setAddress((prev) => ({ ...prev, longitude: result[0].x, latitude: result[0].y }))
              }
            })
          })
        },
      }).open()
    })
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileFile(file)
    setProfileExisting(null)
    const reader = new FileReader()
    reader.onload = (ev) => setProfilePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  const deletePhoto = () => { setProfileFile(null); setProfileExisting(null); setProfilePreview(''); if (photoInputRef.current) photoInputRef.current.value = '' }

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const picked = Array.from(e.target.files) // value='' 전에 먼저 캡처 (지연 평가 시 FileList가 비워짐)
    setAttachFiles((prev) => [...prev, ...picked])
    e.target.value = ''
  }

  // 참조 데이터 + 수정 시 상세 로드
  const loadDetail = useCallback(async () => {
    try {
      const { data } = await api.get(`/mypage/resume/${resumeSq}`)
      const d = data.output
      if (!d) return
      setResumeTtl(d.resumeTtl ?? '')
      setResumeNm(d.resumeNm ?? '')
      setResumeBirthDt(d.resumeBirthDt ?? '')
      setResumePhoneNum(d.resumePhoneNum ?? '')
      setResumeGreetingTxt(d.resumeGreetingTxt ?? '')
      setResumeIsNotificationYn(d.resumeIsNotificationYn === 'Y')
      setResumeIsRepresentativeYn(d.resumeIsRepresentativeYn === 'Y')
      if (d.resumeEmail) {
        const [id, domain] = d.resumeEmail.split('@')
        setEmailId(id ?? '')
        if (EMAIL_DOMAINS.includes(domain)) { setEmailDomain(domain); setCustomDomain('') }
        else { setEmailDomain('custom'); setCustomDomain(domain ?? '') }
      }
      if (d.address) {
        setAddress({
          addressSq: d.address.addressSq ?? null,
          areaCodeSq: d.address.areaCodeSq ?? null,
          zonecode: d.address.zonecode ?? '',
          address: d.address.address ?? '',
          detailAddress: d.address.detailAddress ?? '',
          sigungu: d.address.sigungu ?? '',
          latitude: d.address.latitude != null ? String(d.address.latitude) : '',
          longitude: d.address.longitude != null ? String(d.address.longitude) : '',
        })
      }
      setEducationList((d.educationList ?? []).map((e: Education) => ({ ...e, educationAdmissionDt: toMonth(e.educationAdmissionDt), educationGraduationDt: toMonth(e.educationGraduationDt) })))
      setCareerList((d.careerList ?? []).map((c: Career) => ({ ...c, careerStartDt: toMonth(c.careerStartDt), careerEndDt: toMonth(c.careerEndDt) })))
      setTrainingList((d.trainingHistoryList ?? []).map((t: Training) => ({ ...t, trainingStartDt: toMonth(t.trainingStartDt), trainingEndDt: toMonth(t.trainingEndDt) })))
      setCertificationList(d.certificationList ?? [])
      setProjectHistoryList((d.projectHistoryList ?? []).map((p: ProjectHistory) => ({ ...p, skillTagList: p.skillTagList ?? [] })))
      setSkillTagList(d.skillTagList ?? [])
      setProfileExisting(d.profileImage ?? null)
      if (d.profileImage?.url) setProfilePreview(d.profileImage.url)
      setAttachExisting(d.attachmentList ?? [])
    } catch {
      toast.error('이력서 정보를 불러올 수 없습니다.')
    }
  }, [resumeSq])

  // 신규 등록 시 회원가입 기본정보(이름/생년월일/전화/이메일/주소) 자동 불러오기
  const prefillFromMember = useCallback(async () => {
    try {
      const { data } = await api.get('/mypage/edit/info')
      const d = data.output
      if (!d) return
      setResumeNm(d.userNm ?? '')
      setResumeBirthDt(d.userBirthDt ?? '')
      setResumePhoneNum(d.userPhoneNum ? formatPhone(d.userPhoneNum) : '')
      if (d.userEmail) {
        const [id, domain] = d.userEmail.split('@')
        setEmailId(id ?? '')
        if (EMAIL_DOMAINS.includes(domain)) { setEmailDomain(domain); setCustomDomain('') }
        else { setEmailDomain('custom'); setCustomDomain(domain ?? '') }
      }
      setAddress((prev) => ({
        ...prev,
        zonecode: d.zonecode ?? '',
        address: d.address ?? '',
        detailAddress: d.detailAddress ?? '',
        areaCodeSq: d.sigunguCode ? Number(d.sigunguCode) : null,
        latitude: d.latitude != null ? String(d.latitude) : '',
        longitude: d.longitude != null ? String(d.longitude) : '',
      }))
    } catch (err) {
      // 회원 기본정보 프리필 실패 — 빈 폼은 유지하되 원인을 조용히 삼키지 않는다.
      console.error('회원 기본정보를 불러오지 못했습니다.', err)
    }
  }, [])

  useEffect(() => {
    api.get('/mypage/resume/project-history/skill-tags').then(({ data }) => setAllSkills(data.output ?? [])).catch(() => {})
    api.get('/mypage/resume/project-history/type-codes').then(({ data }) => {
      setRoleTypes(data.output?.projectRoleTypeList ?? [])
      setTaskTypes(data.output?.projectTaskTypeList ?? [])
    }).catch(() => {})
    if (isEdit) loadDetail()
    else prefillFromMember()
  }, [isEdit, loadDetail, prefillFromMember])

  async function handleSubmit() {
    // 필수값 검증 (Vue required 대응)
    if (!resumeTtl.trim()) { toast.error('이력서 제목을 입력해주세요.'); return }
    if (!resumeNm.trim()) { toast.error('이름을 입력해주세요.'); return }
    if (!resumeBirthDt) { toast.error('생년월일을 입력해주세요.'); return }
    if (!resumePhoneNum.trim()) { toast.error('전화번호를 입력해주세요.'); return }
    if (!emailId.trim() || !(emailDomain === 'custom' ? customDomain.trim() : emailDomain)) { toast.error('이메일을 입력해주세요.'); return }
    if (!address.address) { toast.error('주소를 입력해주세요.'); return }
    if (!address.latitude || !address.longitude || !address.areaCodeSq) { toast.error('주소 정보가 불완전합니다. 주소를 다시 선택해주세요.'); return }

    const dto = {
      resumeSq: resumeSq ?? null,
      resumeTtl, resumeNm, resumeBirthDt, resumePhoneNum,
      resumeEmail: `${emailId}@${emailDomain === 'custom' ? customDomain : emailDomain}`,
      resumeGreetingTxt,
      resumeIsNotificationYn: resumeIsNotificationYn ? 'Y' : 'N',
      resumeIsRepresentativeYn: resumeIsRepresentativeYn ? 'Y' : 'N',
      address: {
        addressSq: address.addressSq,
        zonecode: address.zonecode,
        address: address.address,
        detailAddress: address.detailAddress,
        sigungu: address.sigungu,
        latitude: Number(address.latitude),
        longitude: Number(address.longitude),
        areaCodeSq: address.areaCodeSq,
      },
      educationList: educationList.map((e) => ({
        educationSchoolNm: e.educationSchoolNm,
        educationMajorNm: e.educationMajorNm,
        educationAdmissionDt: toFirstDay(e.educationAdmissionDt),
        educationGraduationDt: toFirstDay(e.educationGraduationDt),
        educationStatusCd: e.educationGraduationDt ? 1201 : 1202, // 졸업 / 졸업예정
      })),
      careerList: careerList.map((c) => ({
        careerCompanyNm: c.careerCompanyNm,
        careerDepartmentNm: c.careerDepartmentNm,
        careerPositionNm: c.careerPositionNm,
        careerStartDt: toFirstDay(c.careerStartDt),
        careerEndDt: toFirstDay(c.careerEndDt),
      })),
      projectHistoryList: projectHistoryList.map((p) => ({
        projectHistoryClient: p.projectHistoryClient,
        projectHistoryTypeCd: p.projectHistoryTypeCd ?? null,
        projectHistoryJobPositionTypeCd: p.projectHistoryJobPositionTypeCd ?? null,
        projectHistoryTask: p.projectHistoryTask,
        projectHistoryStartDt: p.projectHistoryStartDt || null,
        projectHistoryEndDt: p.projectHistoryEndDt || null,
        skillTagList: p.skillTagList,
      })),
      certificationList,
      trainingHistoryList: trainingList.map((t) => ({
        trainingInstitutionNm: t.trainingInstitutionNm,
        trainingProgramNm: t.trainingProgramNm,
        trainingStartDt: toFirstDay(t.trainingStartDt),
        trainingEndDt: toFirstDay(t.trainingEndDt),
      })),
      profileImage: profileExisting,
      attachmentList: attachExisting,
      skillTagList,
    }

    const fd = new FormData()
    fd.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }))
    if (profileFile) fd.append('profileImages', profileFile)
    attachFiles.forEach((f) => fd.append('attachments', f))

    try {
      if (isEdit) {
        await api.put(`/mypage/resume/${resumeSq}`, fd)
        toast.success('이력서가 수정되었습니다.')
      } else {
        await api.post('/mypage/resume', fd)
        toast.success('이력서가 등록되었습니다.')
      }
      router.push('/mypage/resume')
    } catch {
      toast.error('이력서 저장에 실패했습니다.')
    }
  }

  // 프로젝트 이력 펼치기/접기
  const setProjectExpanded = (idx: number, val: boolean) =>
    setProjectHistoryList((l) => l.map((p, i) => (i === idx ? { ...p, isExpanded: val } : p)))
  const expandAllProjects = () => setProjectHistoryList((l) => l.map((p) => ({ ...p, isExpanded: true })))
  const collapseAllProjects = () => setProjectHistoryList((l) => l.map((p) => ({ ...p, isExpanded: false })))
  const codeName = (list: CommonCode[], cd?: number | null) => list.find((c) => c.commonCodeSq === cd)?.commonCodeNm ?? '-'
  // 프로젝트의 skillTagList를 부모 분류(기종/OS/DBMS/언어/TOOL/FW)별로 묶음
  const groupProjectSkills = (skills: SkillTag[]) => {
    const groups: Record<string, SkillTag[]> = {}
    skills.forEach((s) => {
      const parent = allSkills.find((p) => p.skillTagSq === s.parentSkillTagSq)
      const key = parent?.skillTagNm ?? '기타'
      ;(groups[key] ??= []).push(s)
    })
    return groups
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold">{isEdit ? '이력서 수정' : '이력서 등록'}</h2>

      {/* 이력서 제목 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">이력서 제목</label>
        <Input value={resumeTtl} onChange={(e) => setResumeTtl(e.target.value)} placeholder="예: 백엔드 개발자 이력서" />
      </div>

      {/* 프로필 사진 + 기본 정보 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="shrink-0">
          <label className="text-sm font-semibold block mb-1">프로필 사진</label>
          <div className="relative w-28 h-28 rounded-md border bg-muted/40 flex items-center justify-center overflow-hidden">
            {profilePreview ? (
              <>
                <img src={profilePreview} alt="사진 미리보기" className="w-full h-full object-cover" />
                <button type="button" onClick={deletePhoto} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 text-xs">×</button>
              </>
            ) : (
              <label htmlFor="photoInput" className="text-xs text-muted-foreground cursor-pointer">+ 사진 추가</label>
            )}
            <input ref={photoInputRef} id="photoInput" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div className="space-y-1">
            <label className="text-sm font-semibold">이름</label>
            <Input value={resumeNm} onChange={(e) => setResumeNm(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">생년월일</label>
            <Input type="date" max={today()} value={resumeBirthDt} onChange={(e) => setResumeBirthDt(e.target.value)} className="cursor-pointer" />

          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">전화번호</label>
            <Input value={resumePhoneNum} onChange={(e) => setResumePhoneNum(formatPhone(e.target.value))} placeholder="010-0000-0000" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">이메일</label>
            <div className="flex items-center gap-1">
              <Input value={emailId} onChange={(e) => setEmailId(e.target.value)} placeholder="아이디" className="w-24" />
              <span>@</span>
              <select value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} className="h-9 rounded-md border border-input px-2 text-sm">
                <option value="">선택</option>
                {EMAIL_DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                <option value="custom">직접입력</option>
              </select>
              {emailDomain === 'custom' && (
                <Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="도메인" className="w-24" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 주소 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">주소</label>
        <Input value={address.address} readOnly placeholder="클릭하여 주소를 검색하세요" className="cursor-pointer" onClick={openPostcode} />
        <Input value={address.detailAddress} onChange={(e) => setAddress((p) => ({ ...p, detailAddress: e.target.value }))} placeholder="상세 주소" />
      </div>

      {/* 학력 */}
      <Section title="학력" onAdd={() => setEduOpen(true)}>
        <TagList items={educationList.map((e) => `${e.educationSchoolNm}${e.educationMajorNm ? ` / ${e.educationMajorNm}` : ''} (${e.educationAdmissionDt || ''}~${e.educationGraduationDt || '졸업예정'})`)} onRemove={(i) => setEducationList((l) => l.filter((_, j) => j !== i))} />
      </Section>

      {/* 회사 이력 */}
      <Section title="회사 이력" onAdd={() => setCareerOpen(true)}>
        <TagList items={careerList.map((c) => `${c.careerCompanyNm} ${c.careerDepartmentNm} ${c.careerPositionNm} (${c.careerStartDt}~${c.careerEndDt || '재직중'})`)} onRemove={(i) => setCareerList((l) => l.filter((_, j) => j !== i))} />
      </Section>

      {/* 교육 이력 */}
      <Section title="교육 이력" onAdd={() => setTrainingOpen(true)}>
        <TagList items={trainingList.map((t) => `${t.trainingProgramNm} / ${t.trainingInstitutionNm} (${t.trainingStartDt}~${t.trainingEndDt})`)} onRemove={(i) => setTrainingList((l) => l.filter((_, j) => j !== i))} />
      </Section>

      {/* 자격증 */}
      <Section title="자격증" onAdd={() => setCertOpen(true)}>
        <TagList items={certificationList.map((c) => `${c.certificationNm}${c.certificationIssuerNm ? ` (${c.certificationIssuerNm})` : ''}`)} onRemove={(i) => setCertificationList((l) => l.filter((_, j) => j !== i))} />
      </Section>

      {/* 프로젝트 이력 */}
      <Section title="프로젝트 이력" onAdd={() => setProjectOpen(true)}>
        {projectHistoryList.length > 0 && (
          <div className="mb-2 flex justify-end gap-3 text-xs">
            <button type="button" onClick={expandAllProjects} className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"><ChevronDown className="h-3.5 w-3.5" />전체 펼치기</button>
            <button type="button" onClick={collapseAllProjects} className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer"><ChevronUp className="h-3.5 w-3.5" />전체 닫기</button>
          </div>
        )}
        <div className="space-y-2">
          {projectHistoryList.map((p, i) => (
            <div key={i} className="rounded-md border">
              <div className="flex items-center justify-between px-3 py-2">
                <button type="button" onClick={() => setProjectExpanded(i, !p.isExpanded)} className="flex flex-1 items-center gap-2 text-left text-sm cursor-pointer">
                  {p.isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="font-medium">{p.projectHistoryTask}</span>
                  <span className="text-muted-foreground">({p.projectHistoryStartDt}~{p.projectHistoryEndDt})</span>
                </button>
                <button type="button" onClick={() => setProjectHistoryList((l) => l.filter((_, j) => j !== i))} className="ml-2 text-muted-foreground hover:text-destructive cursor-pointer">×</button>
              </div>
              {p.isExpanded && (
                <div className="space-y-2 border-t bg-muted/30 p-3 text-sm">
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                    <div><strong>고객사:</strong> {p.projectHistoryClient}</div>
                    <div><strong>업무단:</strong> {codeName(taskTypes, p.projectHistoryTypeCd)}</div>
                    <div><strong>역할:</strong> {codeName(roleTypes, p.projectHistoryJobPositionTypeCd)}</div>
                  </div>
                  {Object.entries(groupProjectSkills(p.skillTagList)).map(([cat, skills]) => (
                    <div key={cat} className="flex flex-wrap items-center gap-1">
                      <strong className="mr-1">{cat}:</strong>
                      {skills.map((s) => (
                        <span key={s.skillTagSq} className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs">
                          <img src={getSkillIconUrl(s.skillTagNm)} alt="" className="h-3.5 w-3.5" />{s.skillTagNm}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 보유 기술 */}
      <Section title="보유 기술" onAdd={() => setSkillOpen(true)}>
        <div className="flex flex-wrap gap-2">
          {skillTagList.map((s) => (
            <Badge key={s.skillTagSq} variant="secondary" className="gap-1 pr-1">
              <img src={getSkillIconUrl(s.skillTagNm)} alt="" className="h-3.5 w-3.5" />
              {s.skillTagNm}
              <button onClick={() => setSkillTagList((l) => l.filter((x) => x.skillTagSq !== s.skillTagSq))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      </Section>

      {/* 첨부파일 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">첨부파일</label>
        <input type="file" multiple accept="image/*, .pdf, .doc, .docx, .zip" className="block w-full text-sm cursor-pointer file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm" onChange={handleAttach} />
        {(attachExisting.length > 0 || attachFiles.length > 0) && (
          <ul className="mt-2 space-y-1 text-sm">
            {attachExisting.map((a, i) => (
              <li key={`e${a.fileSq}`} className="flex items-center gap-2"><span>{a.fileOriginalNm}</span><button onClick={() => setAttachExisting((l) => l.filter((_, j) => j !== i))}><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button></li>
            ))}
            {attachFiles.map((f, i) => (
              <li key={`n${i}`} className="flex items-center gap-2"><span>{f.name}</span><button onClick={() => setAttachFiles((l) => l.filter((_, j) => j !== i))}><X className="h-3 w-3 text-muted-foreground hover:text-destructive" /></button></li>
            ))}
          </ul>
        )}
      </div>

      {/* 자기소개 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">자기소개</label>
        <Textarea value={resumeGreetingTxt} onChange={(e) => setResumeGreetingTxt(e.target.value)} rows={6} placeholder="자기소개를 입력해 주세요." />
      </div>

      {/* 옵션 */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox id="notify" checked={resumeIsNotificationYn} onCheckedChange={(v) => setResumeIsNotificationYn(v === true)} />
          <label htmlFor="notify" className="text-sm cursor-pointer">알림 발신 여부</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="rep" checked={resumeIsRepresentativeYn} onCheckedChange={(v) => setResumeIsRepresentativeYn(v === true)} />
          <label htmlFor="rep" className="text-sm cursor-pointer">대표 이력서로 설정</label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>{isEdit ? '수정하기' : '등록하기'}</Button>
        <Button variant="outline" onClick={() => router.push('/mypage/resume')}>취소</Button>
      </div>

      {/* 모달 */}
      <EducationModal open={eduOpen} onClose={() => setEduOpen(false)} onComplete={(item) => setEducationList((l) => [...l, item])} />
      <CareerModal open={careerOpen} onClose={() => setCareerOpen(false)} onComplete={(item) => setCareerList((l) => [...l, item])} />
      <TrainingModal open={trainingOpen} onClose={() => setTrainingOpen(false)} onComplete={(item) => setTrainingList((l) => [...l, item])} />
      <ProjectHistoryModal open={projectOpen} allSkills={allSkills} roleTypes={roleTypes} taskTypes={taskTypes} onClose={() => setProjectOpen(false)} onComplete={(item) => setProjectHistoryList((l) => [...l, { ...item, isExpanded: true }])} />
      <CertificateModal open={certOpen} onClose={() => setCertOpen(false)} onComplete={(item) => setCertificationList((l) => [...l, item])} />
      <SkillSelectModal open={skillOpen} allSkills={allSkills} selected={skillTagList} onClose={() => setSkillOpen(false)} onConfirm={(skills) => setSkillTagList(skills)} />
    </div>
  )
}

function Section({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold">{title}</label>
        <button className="text-xs text-muted-foreground hover:text-primary cursor-pointer" onClick={onAdd}>+ 추가하기</button>
      </div>
      {children}
    </div>
  )
}


function TagList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((label, i) => (
        <Badge key={i} variant="secondary" className="gap-1 pr-1">
          {label}
          <button onClick={() => onRemove(i)} className="ml-1 hover:text-destructive">×</button>
        </Badge>
      ))}
    </div>
  )
}
