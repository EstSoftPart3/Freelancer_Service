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
  preference: string
  description: string
  isNotification: boolean
}

interface FormOptions {
  devGrades: string[]
  educationLevels: string[]
  workTypes: string[]
  recruitJobs: string[]
  skills: string[]
  preferSkillsList: string[]
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
    preference: '', description: '',
    isNotification: false,
  })

  const [options, setOptions] = useState<FormOptions>({
    devGrades: [], educationLevels: [], workTypes: [], recruitJobs: [], skills: [], preferSkillsList: [],
  })

  const [skillSearch, setSkillSearch] = useState('')
  const [preferSkillSearch, setPreferSkillSearch] = useState('')

  const setF = (patch: Partial<FormData>) => setForm((prev) => ({ ...prev, ...patch }))

  const toggleArrayItem = (key: keyof Pick<FormData, 'workType' | 'recruitJob' | 'usingSkills' | 'preferSkills'>, item: string) => {
    setForm((prev) => {
      const arr = prev[key] as string[]
      return { ...prev, [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] }
    })
  }

  const openPostcode = () => {
    if (!window.daum) { toast.error('주소 검색 서비스를 불러올 수 없습니다.'); return }
    new window.daum.Postcode({
      oncomplete: (data) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
        setF({ address: addr, postcode: data.zonecode, sigunguCode: data.sigunguCode })
        if (window.kakao?.maps?.services) {
          const geocoder = new window.kakao.maps.services.Geocoder()
          geocoder.addressSearch(addr, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK && result[0]) {
              setF({ latitude: result[0].y, longitude: result[0].x })
            }
          })
        }
      },
    }).open()
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
          preference: exist.preferredEtc ?? '',
          description: exist.description ?? '',
        }))
      }
    } catch {
      toast.error('프로젝트 정보를 불러올 수 없습니다.')
    }
  }, [isEdit, projectSq])

  useEffect(() => { loadFormData() }, [loadFormData])

  async function handleSubmit() {
    if (!form.projectTitle.trim()) { toast.error('프로젝트 제목을 입력해주세요.'); return }
    if (!form.address && !form.subwayAddressName) { toast.error('근무지 주소 또는 지하철역을 입력해주세요.'); return }
    if (!form.devGrade) { toast.error('개발자 등급을 선택해주세요.'); return }
    if (!form.educationLvl) { toast.error('학력을 선택해주세요.'); return }
    if (!form.projectStartDt || !form.projectEndDt) { toast.error('프로젝트 기간을 설정해주세요.'); return }
    if (!form.recruitStartDt || !form.recruitEndDt) { toast.error('모집 기간을 설정해주세요.'); return }

    const requestBody = {
      projectId: projectSq ?? null,
      projectTitle: form.projectTitle,
      projectSalary: form.projectSalary,
      projectSalaryNegotiableYn: form.salaryNegotiableYn,
      projectImageUrl: '',
      detailedAddressName: form.address,
      detailedAddressDetail: form.detailAddress,
      detailedZonecode: form.postcode,
      detailedLat: form.latitude,
      detailedLon: form.longitude,
      detailedSigunguCode: form.sigunguCode,
      subwayAddressName: form.subwayAddressName,
      subwayLat: form.subwayLat,
      subwayLon: form.subwayLon,
      subwaySigunguCode: form.subwaySigunguCode,
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
      preference: form.preference,
      description: form.description,
      interviewTime: [],
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
    } catch {
      toast.error(`프로젝트 ${isEdit ? '수정' : '등록'}에 실패했습니다.`)
    }
  }

  const filteredSkills = options.skills.filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()))
  const filteredPreferSkills = options.preferSkillsList.filter((s) => s.toLowerCase().includes(preferSkillSearch.toLowerCase()))

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-xl font-bold">{isEdit ? '프로젝트 수정' : '프로젝트 등록'}</h2>

      <div className="space-y-1">
        <label className="text-sm font-semibold">프로젝트 제목</label>
        <Input value={form.projectTitle} onChange={(e) => setF({ projectTitle: e.target.value })} placeholder="예: 쇼핑몰 관리자 시스템 구축" />
      </div>

      {/* 주소 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">근무지 주소</label>
        <div className="flex gap-2">
          <Input value={form.address} readOnly placeholder="주소 검색" className="cursor-pointer" onClick={openPostcode} />
          <Button type="button" variant="outline" size="sm" onClick={openPostcode}>검색</Button>
          {form.address && <Button type="button" variant="ghost" size="sm" onClick={() => setF({ address: '', latitude: '', longitude: '' })}>×</Button>}
        </div>
        <Input value={form.detailAddress} onChange={(e) => setF({ detailAddress: e.target.value })} placeholder="상세 주소" />
        <Input value={form.subwayAddressName} readOnly placeholder="지하철역 주소 (미구현 - 직접 입력)" onChange={(e) => setF({ subwayAddressName: e.target.value })} />
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

      {/* 기간 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold">프로젝트 시작일</label>
          <Input type="date" value={form.projectStartDt} onChange={(e) => setF({ projectStartDt: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">프로젝트 종료일</label>
          <Input type="date" value={form.projectEndDt} onChange={(e) => setF({ projectEndDt: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">모집 시작일</label>
          <Input type="date" value={form.recruitStartDt} onChange={(e) => setF({ recruitStartDt: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold">모집 종료일</label>
          <Input type="date" value={form.recruitEndDt} onChange={(e) => setF({ recruitEndDt: e.target.value })} />
        </div>
      </div>

      {/* 단가 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">단가</label>
        <div className="flex items-center gap-3">
          <Input value={form.projectSalary} onChange={(e) => setF({ projectSalary: e.target.value })} placeholder="예: 5000000" className="w-48" />
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
      <CheckboxGroup
        label="근무 형태"
        options={options.workTypes}
        selected={form.workType}
        onToggle={(item) => toggleArrayItem('workType', item)}
      />

      {/* 모집 직군 */}
      <CheckboxGroup
        label="모집 직군"
        options={options.recruitJobs}
        selected={form.recruitJob}
        onToggle={(item) => toggleArrayItem('recruitJob', item)}
      />

      {/* 사용 기술 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">사용 기술</label>
        <Input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="기술 검색" className="w-48" />
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded p-2">
          {filteredSkills.map((s) => (
            <button
              key={s}
              className={`px-2 py-1 text-xs border rounded transition-colors ${form.usingSkills.includes(s) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              onClick={() => toggleArrayItem('usingSkills', s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {form.usingSkills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
        </div>
      </div>

      {/* 우대 기술 */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">우대 기술</label>
        <Input value={preferSkillSearch} onChange={(e) => setPreferSkillSearch(e.target.value)} placeholder="기술 검색" className="w-48" />
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded p-2">
          {filteredPreferSkills.map((s) => (
            <button
              key={s}
              className={`px-2 py-1 text-xs border rounded transition-colors ${form.preferSkills.includes(s) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              onClick={() => toggleArrayItem('preferSkills', s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {form.preferSkills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
        </div>
      </div>

      {/* 우대 사항 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">우대 사항</label>
        <Input value={form.preference} onChange={(e) => setF({ preference: e.target.value })} placeholder="예: 스타트업 경험, 원격 근무 가능" />
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
    </div>
  )
}

function CheckboxGroup({ label, options, selected, onToggle }: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (item: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            className={`px-3 py-1.5 text-sm border rounded transition-colors ${selected.includes(opt) ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}`}
            onClick={() => onToggle(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
