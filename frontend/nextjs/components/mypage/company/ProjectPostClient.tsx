'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/ui/tooltip'
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
  educationLvl: string
  // 모집 인원 — 등급마다 한 줄. 줄이 하나면 예전의 "총 인원으로 모집" 과 같다.
  // count 가 빈 문자열이고 unknown 이 true 면 "인원 미정"
  gradeCounts: { grade: string; count: string; unknown: boolean }[]
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

/**
 * 「등급 무관」의 표시 이름. 공통코드(700 하위, 영문명 ANY)의 한글명과 같아야 한다.
 * 이 값만 다른 등급과 함께 고를 수 없다.
 */
const GRADE_ANY = '등급 무관'

export default function ProjectPostClient({ projectSq }: Props) {
  const router = useRouter()
  const isEdit = !!projectSq

  const [form, setForm] = useState<FormData>({
    projectTitle: '',
    address: '', detailAddress: '', postcode: '', latitude: '', longitude: '', sigunguCode: '',
    subwayAddressName: '', subwayLat: '', subwayLon: '', subwaySigunguCode: '',
    educationLvl: '',
    gradeCounts: [{ grade: '', count: '', unknown: false }],
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

  const headcountTotal = form.gradeCounts.reduce((sum, g) => sum + (g.unknown ? 0 : Number(g.count) || 0), 0)
  const hasUnknownHeadcount = form.gradeCounts.some((g) => g.unknown)
  const hasAnyGrade = form.gradeCounts.some((g) => g.grade === GRADE_ANY)

  const openPostcode = () => {
    loadDaumPostcode().then(() => {
      new window.daum.Postcode({
        oncomplete: (data) => {
          const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress
          setF({ address: addr, postcode: data.zonecode, sigunguCode: data.sigunguCode })
          // 좌표는 여기서 따로 채운다. 실패를 조용히 넘기면 주소만 있고 좌표가 빈 채로 제출돼
          // 서버에서 500 이 난다(2026-09-02 운영 장애). 실패하면 반드시 알린다.
          setF({ latitude: '', longitude: '' })
          loadKakaoMaps().then(() => {
            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.addressSearch(addr, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK && result[0]) {
                setF({ latitude: result[0].y, longitude: result[0].x })
              } else {
                setF({ latitude: '', longitude: '' })
                toast.error('주소의 좌표를 찾지 못했습니다. 다른 주소로 다시 검색해주세요.')
              }
            })
          }).catch(() => {
            setF({ latitude: '', longitude: '' })
            toast.error('지도 서비스를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.')
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
        // 모집 인원 복원 — grade 가 채워진 행들이면 등급별, grade 가 없는 한 줄이면 총원 모드.
        // 인원 개념이 없던 시절 공고는 배열이 비어 있어 기본값(총원, 빈 칸)으로 남는다.
        // 등급이 비어 있는 행(옛 "총 인원으로 모집")은 공고의 대표 등급으로 되살린다.
        // 마이그레이션으로 대부분 채워지지만, 되돌렸거나 아직 안 넘어온 데이터가 있을 수 있다.
        const heads: { grade: string | null; count: number | null }[] = exist.recruitHeadcounts ?? []
        if (heads.length > 0) {
          setForm((prev) => ({
            ...prev,
            gradeCounts: heads.map((h) => ({
              grade: h.grade ?? exist.devGrade ?? '',
              count: h.count == null ? '' : String(h.count),
              unknown: h.count == null,
            })),
          }))
        }

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

  // 모집 인원 — 등급별 행 조작
  function setGradeCount(idx: number, patch: Partial<{ grade: string; count: string; unknown: boolean }>) {
    setF({
      gradeCounts: form.gradeCounts.map((g, i) => {
        if (i !== idx) return g
        const next = { ...g, ...patch }
        // 미정으로 바꾸면 이미 적어둔 숫자는 지운다 — 저장 때 null 로 나가므로 남겨두면 헷갈린다.
        return next.unknown ? { ...next, count: '' } : next
      }),
    })
  }
  function addGradeRow() {
    setF({ gradeCounts: [...form.gradeCounts, { grade: '', count: '', unknown: false }] })
  }
  function removeGradeRow(idx: number) {
    setF({ gradeCounts: form.gradeCounts.filter((_, i) => i !== idx) })
  }

  function removeInterviewTime(date: string, time: string) {
    setInterviewTimes((prev) => prev
      .map((e) => (e.date === date ? { ...e, times: e.times.filter((t) => t !== time) } : e))
      .filter((e) => e.times.length > 0))
  }

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
    const recruitHeadcounts = form.gradeCounts.map((g) => ({
      grade: g.grade,
      count: g.unknown ? null : Number(g.count),
    }))
    const salaryNum = Number(form.projectSalary)

    // Vue 원본 validateAll()과 동일 순서·규칙으로 전 필드 검증 (백엔드 @NotEmpty/@NotNull 위반을 프런트에서 선차단)
    if (form.projectTitle.trim().length < 5) { toast.error('프로젝트 제목을 5자 이상 입력해주세요.'); return }
    if (!form.address && !form.subwayAddressName) { toast.error('근무지 주소 또는 지하철역 중 하나는 필수입니다.'); return }
    // 주소는 채워졌는데 좌표만 비어 있는 상태가 실제로 만들어진다 — 다음 우편번호 검색은 좌표를 주지 않아서
    // 카카오 지오코딩을 따로 호출하는데, 그게 늦거나 실패해도 화면에는 주소가 멀쩡히 보이기 때문이다.
    // 그대로 보내면 DB 의 latitude NOT NULL 에서 터져 500 이 됐다(2026-09-02 운영 장애).
    if (form.address && (!form.latitude || !form.longitude)) {
      toast.error('주소의 좌표를 아직 확인하지 못했습니다. 잠시 후 다시 시도하거나 주소를 다시 검색해주세요.'); return
    }
    if (form.subwayAddressName && (!form.subwayLat || !form.subwayLon)) {
      toast.error('지하철역의 좌표를 확인하지 못했습니다. 역을 다시 선택해주세요.'); return
    }
    // 인원은 「미정」으로 둘 수 있다. 미정이 아닌 줄만 숫자를 확인한다. 합계 상한은 없다.
    if (form.gradeCounts.length === 0) { toast.error('모집할 등급을 최소 하나 추가해주세요.'); return }
    if (form.gradeCounts.some((g) => !g.grade)) { toast.error('등급을 선택해주세요.'); return }
    if (form.gradeCounts.some((g) => !g.unknown && !(Number(g.count) >= 1))) {
      toast.error('등급별 인원을 입력하거나 "미정"을 선택해주세요.'); return
    }
    const grades = form.gradeCounts.map((g) => g.grade)
    if (new Set(grades).size !== grades.length) { toast.error('같은 등급을 두 번 입력할 수 없습니다.'); return }
    // 「등급 무관」은 다른 등급과 같이 쓸 수 없다 — 등급을 안 따진다면서 특정 등급을 함께 적을 수는 없다.
    if (grades.includes(GRADE_ANY) && grades.length > 1) {
      toast.error('「등급 무관」은 다른 등급과 함께 선택할 수 없습니다.'); return
    }
    if (!form.educationLvl) { toast.error('학력을 선택해주세요.'); return }
    // 수행 종료일은 「미정」으로 비워 둘 수 있다. 시작일만 필수다.
    if (!form.projectStartDt) { toast.error('프로젝트 기간을 설정해주세요.'); return }
    if (!form.recruitStartDt || !form.recruitEndDt) { toast.error('모집 기간을 설정해주세요.'); return }
    // 두 DateRangeModal이 서로의 값을 모르기 때문에 여기서 관계를 본다(백엔드 @AssertTrue와 같은 규칙).
    // 모집 종료가 수행 시작보다 뒤인 것은 허용 — 수행 중 인력 추가 모집이 정상 케이스다.
    // 수행 종료일이 미정이면 비교할 대상이 없으므로 건너뛴다.
    if (form.projectEndDt && form.recruitEndDt > form.projectEndDt) {
      toast.error('모집 종료일이 프로젝트 종료일보다 늦습니다. 이미 끝난 프로젝트를 모집할 수는 없습니다.')
      return
    }
    if (form.workType.length === 0) { toast.error('근무 형태를 최소 하나 선택해주세요.'); return }
    if (form.recruitJob.length === 0) { toast.error('모집 직군을 최소 하나 선택해주세요.'); return }
    if (form.usingSkills.length === 0) { toast.error('사용 기술을 최소 하나 선택해주세요.'); return }
    if (preference.length > 255) { toast.error(`우대 사항이 너무 깁니다. (최대 255자 / 현재: ${preference.length}자)`); return }
    if (!form.description.trim()) { toast.error('상세 내용을 작성해주세요.'); return }
    if (interviewTimes.length === 0) { toast.error('인터뷰 가능 시간을 설정해주세요.'); return }
    // 단가는 세 조합을 모두 허용한다 — 단가만 / 협의만 / 단가+협의.
    // 협의를 체크하지 않았을 때만 단가가 필수다.
    if (form.salaryNegotiableYn !== 'Y' && (!form.projectSalary || isNaN(salaryNum) || salaryNum <= 0)) {
      toast.error('단가를 입력하거나 "단가 협의"를 선택해주세요.'); return
    }
    if (form.projectSalary && salaryNum > 100000000) { toast.error('단가는 1억 원 이하로 입력해주세요.'); return }

    // 비어있는 숫자 필드는 빈 문자열('') 대신 undefined로 보낸다 — 백엔드 Double/Long 필드가 ''를 파싱 못 해 400 에러 발생
    const numOrUndef = (v: string) => v === '' ? undefined : v

    const requestBody = {
      // 백엔드 ProjectCreateRequest.projectId가 primitive long이라 신규 등록 시 null을 보내면 역직렬화에서 실패한다
      projectId: projectSq ?? 0,
      projectTitle: form.projectTitle,
      // 미입력(협의만) 이면 0. 컬럼이 NOT NULL 이고, 조회 측 formatSalary 가 0을 '단가 협의'로 읽는다.
      projectSalary: form.projectSalary || '0',
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
      // 등급별 모드에서는 백엔드가 가장 낮은 등급으로 대표값을 다시 잡는다(검색 필터 호환용).
      // 대표 등급은 백엔드가 모집 인원에서 서열이 가장 낮은 것으로 다시 잡는다(검색 필터 호환용).
      // 여기서는 첫 줄을 넣어 두기만 한다.
      devGrade: form.gradeCounts[0]?.grade ?? '',
      recruitHeadcounts,
      educationLvl: form.educationLvl,
      projectStartDt: form.projectStartDt,
      // 「미정」이면 빈 문자열이 아니라 undefined 로 보낸다 — 백엔드 LocalDate 가 '' 를 파싱하지 못한다.
      projectEndDt: numOrUndef(form.projectEndDt),
      recruitStartDt: form.recruitStartDt,
      recruitEndDt: form.recruitEndDt,
      workType: form.workType,
      recruitJob: form.recruitJob,
      usingSkills: form.usingSkills,
      preferSkills: form.preferSkills,
      // 빈 문자열 대신 undefined 를 보내 DB 에 NULL 이 들어가게 한다 (컬럼은 NULL 허용)
      preference: preference || undefined,
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

      {/* 모집 인원 — 등급마다 한 줄. 줄이 하나면 예전의 "총 인원으로 모집" 과 결과가 같다.
          두 모드를 라디오로 고르게 하던 것을 없앴다(2026-09-02) */}
      <div className="space-y-3 rounded-lg border p-4">
        <label className="text-sm font-semibold">모집 인원</label>

        <div className="space-y-2">
            {form.gradeCounts.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={row.grade}
                  onChange={(e) => setGradeCount(idx, { grade: e.target.value })}
                  className="h-9 w-40 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">등급 선택</option>
                  {options.devGrades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <Input
                  value={row.count}
                  onChange={(e) => setGradeCount(idx, { count: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-20"
                  inputMode="numeric"
                  placeholder={row.unknown ? '—' : '0'}
                  disabled={row.unknown}
                />
                <span className="text-sm text-muted-foreground">명</span>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id={`headcount-unknown-${idx}`}
                    checked={row.unknown}
                    onCheckedChange={(v) => setGradeCount(idx, { unknown: v === true })}
                  />
                  <label htmlFor={`headcount-unknown-${idx}`} className="cursor-pointer text-xs text-muted-foreground">미정</label>
                </div>
                {form.gradeCounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGradeRow(idx)}
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          <div className="flex items-center justify-between">
            {/* 「등급 무관」은 단독으로만 쓴다 — 등급을 안 따진다면서 특정 등급을 함께 적을 수는 없다. */}
            {hasAnyGrade ? (
              <span className="text-xs text-muted-foreground">「등급 무관」은 다른 등급과 함께 선택할 수 없습니다.</span>
            ) : (
              <button type="button" onClick={addGradeRow} className="cursor-pointer text-xs text-muted-foreground hover:text-primary">
                + 등급 추가
              </button>
            )}
            <span className="text-sm">
              합계 <strong>{headcountTotal}</strong>명
              {hasUnknownHeadcount && <span className="ml-1 text-xs text-muted-foreground">(일부 미정)</span>}
            </span>
          </div>
        </div>
      </div>

      {/* 학력 */}
      <div className="space-y-1">
        <label className="text-sm font-semibold">학력</label>
        <select
          value={form.educationLvl}
          onChange={(e) => setF({ educationLvl: e.target.value })}
          className="h-9 w-full max-w-xs rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">선택</option>
          {options.educationLevels.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* 기간 — Vue 원본처럼 듀얼월 캘린더에서 한 번에 범위 선택, 입력창은 읽기전용 표시 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold">프로젝트 기간</label>
          </div>
          {/* 종료일은 미정일 수 있다 — 시작일만 있으면 「~ 미정」으로 보여준다. */}
          <Input
            readOnly
            value={form.projectStartDt ? `${form.projectStartDt} ~ ${form.projectEndDt || '미정'}` : ''}
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
              placeholder={form.salaryNegotiableYn === 'Y' ? '협의 후 결정' : '예: 5,000,000'}
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
        <p className="text-xs text-muted-foreground">
          단가만 입력하거나, 「단가 협의」만 선택하거나, 둘 다 지정할 수 있습니다.
        </p>
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
        label="우대 기술 (선택)"
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
          <div className="space-y-2 rounded-lg border p-3">
            {interviewTimes.map((e) => (
              <div key={e.date} className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="w-[5.5rem] shrink-0 font-medium">{e.date.replaceAll('-', '.')}</span>
                {e.times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    title="클릭하여 이 시각만 삭제"
                    onClick={() => removeInterviewTime(e.date, t)}
                    className="cursor-pointer rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground"
                  >
                    {t} ×
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setInterviewTimes((prev) => prev.filter((x) => x.date !== e.date))}
                  className="ml-auto cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  날짜 삭제
                </button>
              </div>
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
        <InfoTooltip label="알림 발신 여부 안내">
          <p className="font-semibold">알림 발신 여부</p>
          <ul className="mt-1 space-y-0.5">
            <li>· 우리 기업을 즐겨찾기한 회원에게 새 공고 등록 알림이 갑니다.</li>
            <li>· 사이트 알림(상단 종 아이콘)으로만 가며 이메일·문자는 보내지 않습니다.</li>
            <li>· 공고를 <span className="font-medium">수정</span>할 때는 발송되지 않습니다.</li>
          </ul>
        </InfoTooltip>
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
        allowCustom
        customPlaceholder="직군 검색 · 목록에 없으면 직접 입력"
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
      {/* 수행 기간만 「종료일 미정」을 허용한다. 모집 종료일은 D-day 계산의 근거라 비면 안 된다. */}
      <DateRangeModal
        open={projectPeriodModalOpen}
        allowUndecidedEnd
        onClose={() => setProjectPeriodModalOpen(false)}
        onConfirm={({ start, end }) => setF({ projectStartDt: start, projectEndDt: end ?? '' })}
      />
      <DateRangeModal
        open={recruitPeriodModalOpen}
        onClose={() => setRecruitPeriodModalOpen(false)}
        onConfirm={({ start, end }) => setF({ recruitStartDt: start, recruitEndDt: end ?? '' })}
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
