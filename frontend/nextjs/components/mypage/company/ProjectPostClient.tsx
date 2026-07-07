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
import { loadKakaoMaps } from '@/lib/kakao'
import { loadDaumPostcode } from '@/lib/daum'
import SubwaySearchModal from '@/components/project/SubwaySearchModal'
import MultiSelectModal from '@/components/project/MultiSelectModal'
import SkillSelectModal from '@/components/project/SkillSelectModal'
import InterviewTimeModal, { type InterviewTimeEntry } from '@/components/project/InterviewTimeModal'
import DateRangeModal from '@/components/project/DateRangeModal'
import type { RequiredSkillGroup } from '@/types'

interface FormData {
  projectTitle: string
  address: string
  detailAddress: string
  postcode: string
  latitude: string
  longitude: string
  sigunguCode: string
  subwayAddressName: string
  subwayLat: string
  subwayLon: string
  subwaySigunguCode: string
  devGrade: string
  educationLvl: string
  projectStartDt: string
  projectEndDt: string
  recruitStartDt: string
  recruitEndDt: string
  projectSalary: string
  salaryNegotiableYn: 'Y' | 'N'
  workType: string[]
  recruitJob: string[]
  usingSkills: string[]
  preferSkills: string[]
  preferenceList: string[]
  description: string
  isNotification: boolean
}

interface FormOptions {
  devGrades: string[]
  educationLevels: string[]
  workTypes: string[]
  recruitJobs: string[]
  // 백엔드 /projects/forms는 기술을 DBMS/Framework/Language/Tool 등 카테고리별로 그룹화해 내려준다 (string[] 아님)
  skills: RequiredSkillGroup[]
  preferSkillsList: RequiredSkillGroup[]
}

interface Props {
  projectSq?: number
}

export default function ProjectPostClient({ projectSq }: Props) {
  const router = useRouter()
  const isEdit = !!projectSq

  const [form, setForm] = useState<FormData>({
    projectTitle: '',
    address: '', detailAddress: '', postcode: '', latitude: '', longitude: '', sigunguCode: '',
    subwayAddressName: '', subwayLat: '', subwayLon: '', subwaySigunguCode: '',
    devGrade: '', educationLvl: '',
    projectStartDt: '', projectEndDt: '',
    recruitStartDt: '', recruitEndDt: '',
    projectSalary: '',
    salaryNegotiableYn: 'N',
    workType: [], recruitJob: [], usingSkills: [], preferSkills: [],
    preferenceList: [], description: '',
    isNotification: false,
  })

  const [options, setOptions] = useState<FormOptions>({
    devGrades: [], educationLevels: [], workTypes: [], recruitJobs: [], skills: [], preferSkillsList: [],
  })

  const [preferenceInput, setPreferenceInput] = useState('')
  const [interviewTimes, setInterviewTimes] = useState<InterviewTimeEntry[]>([])

  const [subwayModalOpen, setSubwayModalOpen] = useState(false)
  const [workTypeModalOpen, setWorkTypeModalOpen] = useState(false)
  const [jobModalOpen, setJobModalOpen] = useState(false)
  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [preferSkillModalOpen, setPreferSkillModalOpen] = useState(false)
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [projectPeriodModalOpen, setProjectPeriodModalOpen] = useState(false)
  const [recruitPeriodModalOpen, setRecruitPeriodModalOpen] = useState(false)

  const setF = (patch: Partial<FormData>) => setForm((prev) => ({ ...prev, ...patch }))

  // 우대사항 — 쉼표(,) 입력 시 태그로 전환 (Vue 원본 watch(preferContent) 이식)
  function handlePreferenceInputChange(value: string) {
    if (value.endsWith(',')) {
      const tag = value.slice(0, -1).trim()
      if (tag && !form.preferenceList.includes(tag)) {
        setF({ preferenceList: [...form.preferenceList, tag] })
      }
      setPreferenceInput('')
    } else {
      setPreferenceInput(value)
    }
  }
  function removePreference(idx: number) {
    setF({ preferenceList: form.preferenceList.filter((_, i) => i !== idx) })
  }

  // 단가 입력 — 숫자만 추출해 저장, 화면엔 1,000 단위 콤마를 붙여 표시 (백엔드 전송 시엔 콤마 제거된 순수 숫자 문자열)
  function handleSalaryChange(value: string) {
    const digitsOnly = value.replace(/[^0-9]/g, '')
    setF({ projectSalary: digitsOnly })
  }
  const salaryDisplay = form.projectSalary ? Number(form.projectSalary).toLocaleString('ko-KR') : ''

  const openPostcode = () => {
    loadDaumPostcode().then(() => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
          setF({ address: addr, postcode: data.zonecode, sigunguCode: data.sigunguCode })
          loadKakaoMaps().then(() => {
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.addressSearch(addr, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                setF({ latitude: result[0].y, longitude: result[0].x })
              }
            })
          })
        },
      }).open()
    })
  }

  const loadFormData = useCallback(async () => {
    try {
      const params = isEdit ? { projectSq } : {}
      const { data } = await api.get('/projects/forms', { params })
      const out = data.output ?? {}
      setOptions({
        devGrades: out.devGrades ?? [],
        educationLevels: out.educationLevels ?? [],
        workTypes: out.workTypes ?? [],
        recruitJobs: out.recruitJobs ?? [],
        skills: out.skills ?? [],
        preferSkillsList: out.skills ?? [],
      })

      const exist = out.existProjectVo
      if (exist) {
        setForm((prev) => ({
          ...prev,
          projectTitle: exist.projectTtl ?? '',
          projectSalary: exist.projectSalary ?? '',
          salaryNegotiableYn: exist.salaryNegotiableYn ?? 'N',
          address: exist.detailedAddress ?? '',
          detailAddress: exist.detailedAddressDetail ?? '',
          postcode: exist.detailedZonecode ?? '',
          sigunguCode: exist.detailedSigunguCode ?? '',
          latitude: exist.latitude ?? '',
          longitude: exist.longitude ?? '',
          subwayAddressName: exist.subwayAddress ?? '',
          devGrade: exist.devGrade ?? '',
          educationLvl: exist.educationLvl ?? '',
          projectStartDt: exist.projectStartDt ?? '',
          projectEndDt: exist.projectEndDt ?? '',
          recruitStartDt: exist.recruitStartDt ?? '',
          recruitEndDt: exist.recruitEndDt ?? '',
          workType: Array.isArray(exist.contract) ? [...exist.contract] : [],
          recruitJob: Array.isArray(exist.jobs) ? [...exist.jobs] : [],
          usingSkills: (exist.reqSkills ?? []).map((s: { name?: string } | string) => typeof s === 'string' ? s : s?.name ?? ''),
          preferSkills: (exist.preferSkills ?? []).map((s: { name?: string } | string) => typeof s === 'string' ? s : s?.name ?? ''),
          preferenceList: (exist.preferredEtc ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
          description: exist.description ?? '',
        }))
        // Vue 원본 ProjectPostPage.vue: 수정 모드에서 기존 인터뷰 가능시간도 폼에 복원
        if (exist.interviewTimes) {
          setInterviewTimes(
            Object.entries(exist.interviewTimes as Record<string, string[]>).map(
              ([date, times]) => ({ date, times }),
            ),
          )
        }
      }
    } catch {
      toast.error('프로젝트 정보를 불러올 수 없습니다.')
    }
  }, [isEdit, projectSq])

  useEffect(() => { loadFormData() }, [loadFormData])

  function openInterviewModal() {
    if (!form.recruitStartDt || !form.recruitEndDt) {
      toast.error('모집 기간을 먼저 설정해주세요.')
      return
    }
    setInterviewModalOpen(true)
  }

  // 모집 기간이 줄어들면 범위 밖 인터뷰 일정은 자동 제거 (Vue 원본 watcher 이식)
  useEffect(() => {
    if (!form.recruitStartDt || !form.recruitEndDt) return
    setInterviewTimes((prev) => {
      const filtered = prev.filter((e) => e.date >= form.recruitStartDt && e.date <= form.recruitEndDt)
      if (filtered.length !== prev.length) toast.warning('모집 기간 변경으로 일부 인터뷰 일정이 제거되었습니다.')
      return filtered
    })
  }, [form.recruitStartDt, form.recruitEndDt])

  async function handleSubmit() {
    const preference = [...form.preferenceList, ...preferenceInput.split(',')].map((s) => s.trim()).filter(Boolean).join(',')
    const interviewTime = interviewTimes.flatMap((e) => e.times.map((t) => `${e.date}T${t}`))
    const salaryNum = Number(form.projectSalary)

    // Vue 원본 validateAll()과 동일 순서·규칙으로 전 필드 검증 (백엔드 @NotEmpty/@NotNull 위반을 프런트에서 선차단)
    if (form.projectTitle.trim().length < 5) { toast.error('프로젝트 제목을 5자 이상 입력해주세요.'); return }
    if (!form.address && !form.subwayAddressName) { toast.error('근무지 주소 또는 지하철역 중 하나는 필수입니다.'); return }
    if (!form.devGrade) { toast.error('개발자 등급을 선택해주세요.'); return }
    if (!form.educationLvl) { toast.error('학력을 선택해주세요.'); return }
    if (!form.projectStartDt || !form.projectEndDt) { toast.error('프로젝트 기간을 설정해주세요.'); return }
    if (!form.recruitStartDt || !form.recruitEndDt) { toast.error('모집 기간을 설정해주세요.'); return }
    if (form.workType.length === 0) { toast.error('근무 형태를 최소 하나 선택해주세요.'); return }
    if (form.recruitJob.length === 0) { toast.error('모집 직군을 최소 하나 선택해주세요.'); return }
    if (form.usingSkills.length === 0) { toast.error('사용 기술을 최소 하나 선택해주세요.'); return }
    if (form.preferSkills.length === 0) { toast.error('우대 기술을 최소 하나 선택해주세요.'); return }
    if (preference.length > 255) { toast.error(`우대 사항이 너무 깁니다. (최대 255자 / 현재: ${preference.length}자)`); return }
    if (!form.description.trim()) { toast.error('상세 내용을 작성해주세요.'); return }
    if (interviewTimes.length === 0) { toast.error('인터뷰 가능 시간을 설정해주세요.'); return }
    if (!form.projectSalary || isNaN(salaryNum) || salaryNum <= 0) { toast.error('올바른 단가(숫자)를 입력해주세요.'); return }
    if (salaryNum > 100000000) { toast.error('단가는 1억 원 이하로 입력해주세요.'); return }

    // 비어있는 숫자 필드는 빈 문자열('') 대신 undefined로 보낸다 — 백엔드 Double/Long 필드가 ''를 파싱 못 해 400 에러 발생
    const numOrUndef = (v: string) => v === '' ? undefined : v

    const requestBody = {
      // 백엔드 ProjectCreateRequest.projectId가 primitive long이라 신규 등록 시 null을 보내면 역직렬화에서 실패한다
      projectId: projectSq ?? 0,
      projectTitle: form.projectTitle,
      projectSalary: form.projectSalary,
      projectSalaryNegotiableYn: form.salaryNegotiableYn,
      projectImageUrl: '',
      detailedAddressName: form.address,
      detailedAddressDetail: form.detailAddress,
      detailedZonecode: numOrUndef(form.postcode),
      detailedLat: numOrUndef(form.latitude),
      detailedLon: numOrUndef(form.longitude),
      detailedSigunguCode: numOrUndef(form.sigunguCode),
      subwayAddressName: form.subwayAddressName,
      subwayLat: numOrUndef(form.subwayLat),
      subwayLon: numOrUndef(form.subwayLon),
      subwaySigunguCode: numOrUndef(form.subwaySigunguCode),
      devGrade: form.devGrade,
      educationLvl: form.educationLvl,
      projectStartDt: form.projectStartDt,
      projectEndDt: form.projectEndDt,
      recruitStartDt: form.recruitStartDt,
      recruitEndDt: form.recruitEndDt,
      workType: form.workType,
      recruitJob: form.recruitJob,
      usingSkills: form.usingSkills,
      preferSkills: form.preferSkills,
      preference,
      description: form.description,
      interviewTime,
      isNotification: form.isNotification ? 'Y' : 'N',
    }

    try {
      if (isEdit) {
        await api.patch('/projects', requestBody)
        toast.success('프로젝트가 수정되었습니다.')
      } else {
        await api.post('/projects', requestBody)
        toast.success('프로젝트가 등록되었습니다.')
      }
      router.push('/mypage/affiliation-projects')
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message || `프로젝트 ${isEdit ? '수정' : '등록'}에 실패했습니다.`)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold">{isEdit ? '프로젝트 수정' : '프로젝트 등록'}</h2>

      <div className="space-y-1">
        <label className="text-sm font-semibold">프로젝트 제목</label>
        <Input value={form.projectTitle} onChange={(e) => setF({ projectTitle: e.target.value })} placeholder="예: 쇼핑몰 관리자 시스템 구축" />
      </div>

      {/* 주소 — Vue 원본: 근무지 주소/지하철역 둘 다 독립 입력 가능, 최소 1개만 필수 (서로 비활성화 안 함) */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">근무지 주소 또는 지하철역 중 최소 1개는 입력해주세요. (둘 다 입력 가능)</p>
      </div>
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">근무지 주소</label>
          <div className="flex gap-2">
            <Input
              value={form.address}
              readOnly
              placeholder="클릭하여 주소 검색"
              className="cursor-pointer"
              onClick={openPostcode}
            />
            {form.address && <Button type="button" variant="ghost" size="sm" onClick={() => setF({ address: '', postcode: '', latitude: '', longitude: '', sigunguCode: '' })}>×</Button>}
          </div>
          {form.address && (
            <Input
              value={form.detailAddress}
              onChange={(e) => setF({ detailAddress: e.target.value })}
              placeholder="상세 주소"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">지하철역 주소</label>
          <div className="flex gap-2">
            <Input
              value={form.subwayAddressName}
              readOnly
              placeholder="클릭하여 지하철역 검색"
              className="cursor-pointer"
              onClick={() => setSubwayModalOpen(true)}
            />
            {form.subwayAddressName && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setF({ subwayAddressName: '', subwayLat: '', subwayLon: '', subwaySigunguCode: '' })}>×</Button>
            )}
          </div>
        </div>
      </div>

      {/* 개발자 등급 / 학력 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold">개발자 등급(경력)</label>
          <select
            value={form.devGrade}
            onChange={(e) => setF({ devGrade: e.target.value })}
            className="w-full h-9 rounded-md border border-input px-2 text-sm bg-background"
          >
            <option value="">선택</option>
            {options.devGrades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">학력</label>
          <select
            value={form.educationLvl}
            onChange={(e) => setF({ educationLvl: e.target.value })}
            className="w-full h-9 rounded-md border border-input px-2 text-sm bg-background"
          >
            <option value="">선택</option>
            {options.educationLevels.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {/* 기간 — Vue 원본처럼 듀얼월 캘린더에서 한 번에 범위 선택, 입력창은 읽기전용 표시 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">프로젝트 기간</label>
          </div>
          <Input
            readOnly
            value={form.projectStartDt && form.projectEndDt ? `${form.projectStartDt} ~ ${form.projectEndDt}` : ''}
            placeholder="예: 2026-04 ~ 2026-10"
            className="cursor-pointer"
            onClick={() => setProjectPeriodModalOpen(true)}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">모집 기간</label>
          </div>
          <Input
            readOnly
            value={form.recruitStartDt && form.recruitEndDt ? `${form.recruitStartDt} ~ ${form.recruitEndDt}` : ''}
            placeholder="예: 2026-04 ~ 2026-10"
            className="cursor-pointer"
            onClick={() => setRecruitPeriodModalOpen(true)}
          />
        </div>
      </div>

      {/* 단가 — 입력은 숫자만 받고, 화면엔 1,000단위 콤마로 표시 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">단가</label>
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Input
              value={salaryDisplay}
              onChange={(e) => handleSalaryChange(e.target.value)}
              placeholder="예: 5,000,000"
              className="pr-8"
              inputMode="numeric"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="salary-neg"
              checked={form.salaryNegotiableYn === 'Y'}
              onCheckedChange={(v) => setF({ salaryNegotiableYn: v === true ? 'Y' : 'N' })}
            />
            <label htmlFor="salary-neg" className="text-sm cursor-pointer">단가 협의</label>
          </div>
        </div>
      </div>

      {/* 근무 형태 */}
      <PickerField
        label="근무 형태"
        selected={form.workType}
        onOpen={() => setWorkTypeModalOpen(true)}
        onRemove={(item) => setF({ workType: form.workType.filter((x) => x !== item) })}
      />

      {/* 모집 직군 */}
      <PickerField
        label="모집 직군"
        selected={form.recruitJob}
        onOpen={() => setJobModalOpen(true)}
        onRemove={(item) => setF({ recruitJob: form.recruitJob.filter((x) => x !== item) })}
      />

      {/* 사용 기술 */}
      <PickerField
        label="사용 기술"
        selected={form.usingSkills}
        onOpen={() => setSkillModalOpen(true)}
        onRemove={(item) => setF({ usingSkills: form.usingSkills.filter((x) => x !== item) })}
      />

      {/* 우대 기술 */}
      <PickerField
        label="우대 기술"
        selected={form.preferSkills}
        onOpen={() => setPreferSkillModalOpen(true)}
        onRemove={(item) => setF({ preferSkills: form.preferSkills.filter((x) => x !== item) })}
      />

      {/* 우대 사항 — 쉼표(,)로 구분 입력 시 태그로 전환 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">우대 사항</label>
        <Input
          value={preferenceInput}
          onChange={(e) => handlePreferenceInputChange(e.target.value)}
          placeholder="쉼표(,)로 구분하여 입력 (예: 스타트업 경험,)"
        />
        {form.preferenceList.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.preferenceList.map((p, idx) => (
              <button
                key={`${p}-${idx}`}
                type="button"
                onClick={() => removePreference(idx)}
                className="cursor-pointer rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
                title="클릭하여 삭제"
              >
                {p} ×
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 인터뷰 가능시간 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold">인터뷰 가능시간</label>
          <button type="button" onClick={openInterviewModal} className="text-xs text-muted-foreground hover:text-primary">+ 추가하기</button>
        </div>
        {interviewTimes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interviewTimes.map((e) => (
              <span key={e.date} className="flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs">
                {e.date.replaceAll('-', '.')} ({e.times.length}건)
                <button onClick={() => setInterviewTimes((prev) => prev.filter((x) => x.date !== e.date))} className="text-muted-foreground hover:text-foreground">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 상세 내용 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">상세 내용</label>
        <Textarea value={form.description} onChange={(e) => setF({ description: e.target.value })} rows={8} placeholder="프로젝트 상세 내용을 입력해주세요." />
      </div>

      {/* 알림 여부 */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="notify"
          checked={form.isNotification}
          onCheckedChange={(v) => setF({ isNotification: v === true })}
        />
        <label htmlFor="notify" className="text-sm cursor-pointer">알림 발신 여부</label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>{isEdit ? '수정' : '등록'}</Button>
        <Button variant="outline" onClick={() => router.push('/mypage/affiliation-projects')}>취소</Button>
      </div>

      <SubwaySearchModal
        open={subwayModalOpen}
        onClose={() => setSubwayModalOpen(false)}
        onSelect={(s) => setF({ subwayAddressName: s.placeName, subwayLat: String(s.lat), subwayLon: String(s.lng), subwaySigunguCode: s.sigunguCode })}
      />
      <MultiSelectModal
        open={workTypeModalOpen}
        title="근무 형태 선택"
        options={options.workTypes}
        selected={form.workType}
        onClose={() => setWorkTypeModalOpen(false)}
        onConfirm={(v) => setF({ workType: v })}
      />
      <MultiSelectModal
        open={jobModalOpen}
        title="모집 직군 선택"
        options={options.recruitJobs}
        selected={form.recruitJob}
        onClose={() => setJobModalOpen(false)}
        onConfirm={(v) => setF({ recruitJob: v })}
      />
      <SkillSelectModal
        open={skillModalOpen}
        title="사용 기술 선택"
        groups={options.skills}
        selected={form.usingSkills}
        onClose={() => setSkillModalOpen(false)}
        onConfirm={(v) => setF({ usingSkills: v })}
      />
      <SkillSelectModal
        open={preferSkillModalOpen}
        title="우대 기술 선택"
        groups={options.preferSkillsList}
        selected={form.preferSkills}
        onClose={() => setPreferSkillModalOpen(false)}
        onConfirm={(v) => setF({ preferSkills: v })}
      />
      <InterviewTimeModal
        open={interviewModalOpen}
        minDate={form.recruitStartDt}
        maxDate={form.recruitEndDt}
        entries={interviewTimes}
        onClose={() => setInterviewModalOpen(false)}
        onConfirm={setInterviewTimes}
      />
      <DateRangeModal
        open={projectPeriodModalOpen}
        onClose={() => setProjectPeriodModalOpen(false)}
        onConfirm={({ start, end }) => setF({ projectStartDt: start, projectEndDt: end })}
      />
      <DateRangeModal
        open={recruitPeriodModalOpen}
        onClose={() => setRecruitPeriodModalOpen(false)}
        onConfirm={({ start, end }) => setF({ recruitStartDt: start, recruitEndDt: end })}
      />
    </div>
  )
}

function PickerField({ label, selected, onOpen, onRemove }: {
  label: string
  selected: string[]
  onOpen: () => void
  onRemove: (item: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold">{label}</label>
        <button type="button" onClick={onOpen} className="text-xs text-muted-foreground hover:text-primary">+ 추가하기</button>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge key={item} variant="secondary" className="cursor-pointer gap-1" onClick={() => onRemove(item)}>
              {item} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
