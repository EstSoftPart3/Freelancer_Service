'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/lib/api'
import { useUserStore } from '@/stores/userStore'
import type { ProjectFilters, ProjectSearchParams, FilterOption } from '@/types'

interface Props {
  onSearch: (params: ProjectSearchParams) => void
}

const DISTANCE_OPTIONS = [
  { label: '전체', value: 0 },
  { label: '3km', value: 3 },
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
]

const PRICE_OPTIONS = [
  { label: '전체', value: 0 },
  { label: '200만원', value: 2000000 },
  { label: '300만원', value: 3000000 },
  { label: '400만원', value: 4000000 },
  { label: '500만원', value: 5000000 },
]

const SORT_OPTIONS = [
  { label: '최신순', sortBy: 'project_start_dt', sortOrder: 'desc' },
  { label: '조회순', sortBy: 'view_count', sortOrder: 'desc' },
  { label: '지원자순', sortBy: 'applicant_count', sortOrder: 'desc' },
]

const SEARCH_TYPES = ['전체', '제목', '회사명', '내용', '태그']

export default function ProjectFilterBar({ onSearch }: Props) {
  const { isLoggedIn, latitude } = useUserStore()
  const canUseDistance = isLoggedIn() && latitude != null

  const [filters, setFilters] = useState<ProjectFilters>({
    regions: [],
    careers: [],
    educations: [],
    jobTypes: [],
  })
  const [expanded, setExpanded] = useState(false)

  const [selectedRegions, setSelectedRegions] = useState<number[]>([])
  const [selectedCareers, setSelectedCareers] = useState<number[]>([])
  const [selectedEducations, setSelectedEducations] = useState<number[]>([])
  const [selectedJobTypes, setSelectedJobTypes] = useState<number[]>([])
  const [distance, setDistance] = useState(0)
  const [minPrice, setMinPrice] = useState(0)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchType, setSearchType] = useState('전체')
  const [sortIdx, setSortIdx] = useState(0)

  useEffect(() => {
    const types = ['지역', '경력', '학력', '직종']
    Promise.all(
      types.map((type) =>
        // params 객체 사용 → Axios가 한글을 URL 인코딩 처리
        api.get<{ output: FilterOption[] }>('/projects/filters', { params: { type } })
          .then((r) => r.data.output),
      ),
    )
      .then(([regions, careers, educations, jobTypes]) => {
        setFilters({ regions, careers, educations, jobTypes })
      })
      .catch(() => {})
  }, [])

  function buildParams(overrideSortIdx?: number): ProjectSearchParams {
    const sort = SORT_OPTIONS[overrideSortIdx ?? sortIdx]
    return {
      addressCodeSq: selectedRegions[0],
      projectDeveloperGradeCd: selectedCareers[0],
      educationCd: selectedEducations[0],
      jobRoleCd: selectedJobTypes[0],
      minPrice: minPrice > 0 ? minPrice : undefined,
      distance: distance > 0 ? distance : undefined,
      searchKeyword: searchKeyword || undefined,
      searchType: searchType !== '전체' ? searchType : undefined,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      page: 1,
    }
  }

  // 정렬 클릭 → 즉시 검색 (Vue 원본과 동일)
  function handleSortClick(idx: number) {
    setSortIdx(idx)
    onSearch(buildParams(idx))
  }

  function handleSearch() {
    onSearch(buildParams())
  }

  function handleReset() {
    setSelectedRegions([])
    setSelectedCareers([])
    setSelectedEducations([])
    setSelectedJobTypes([])
    setDistance(0)
    setMinPrice(0)
    setSearchKeyword('')
    setSearchType('전체')
    setSortIdx(0)
    const sort = SORT_OPTIONS[0]
    onSearch({ sortBy: sort.sortBy, sortOrder: sort.sortOrder, page: 1 })
  }

  function toggle(list: number[], setList: (v: number[]) => void, val: number) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val])
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      {/* 검색바 */}
      <div className="flex gap-2">
        <Select value={searchType} onValueChange={(v) => { if (v) setSearchType(v) }}>
          <SelectTrigger className="w-28 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="검색어를 입력하세요"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* 정렬 버튼 — 클릭 즉시 검색 실행 */}
      <div className="flex gap-2 flex-wrap">
        {SORT_OPTIONS.map((opt, i) => (
          <Button
            key={opt.label}
            variant={sortIdx === i ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            onClick={() => handleSortClick(i)}
          >
            {opt.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
        >
          상세 필터
          {expanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </Button>
      </div>

      {/* 상세 필터 */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t">
          {filters.regions.length > 0 && (
            <FilterSection label="지역">
              {filters.regions.map((r) => (
                <CheckItem
                  key={r.areaSq}
                  id={`region-${r.areaSq}`}
                  label={r.areaName ?? ''}
                  checked={selectedRegions.includes(r.areaSq!)}
                  onToggle={() => toggle(selectedRegions, setSelectedRegions, r.areaSq!)}
                />
              ))}
            </FilterSection>
          )}

          {filters.careers.length > 0 && (
            <FilterSection label="경력">
              {filters.careers.map((c) => (
                <CheckItem
                  key={c.common_code_sq}
                  id={`career-${c.common_code_sq}`}
                  label={c.common_code_nm ?? ''}
                  checked={selectedCareers.includes(c.common_code_sq!)}
                  onToggle={() => toggle(selectedCareers, setSelectedCareers, c.common_code_sq!)}
                />
              ))}
            </FilterSection>
          )}

          {filters.educations.length > 0 && (
            <FilterSection label="학력">
              {filters.educations.map((e) => (
                <CheckItem
                  key={e.common_code_sq}
                  id={`edu-${e.common_code_sq}`}
                  label={e.common_code_nm ?? ''}
                  checked={selectedEducations.includes(e.common_code_sq!)}
                  onToggle={() => toggle(selectedEducations, setSelectedEducations, e.common_code_sq!)}
                />
              ))}
            </FilterSection>
          )}

          {filters.jobTypes.length > 0 && (
            <FilterSection label="직종">
              {filters.jobTypes.map((j) => (
                <CheckItem
                  key={j.common_code_sq}
                  id={`job-${j.common_code_sq}`}
                  label={j.common_code_nm ?? ''}
                  checked={selectedJobTypes.includes(j.common_code_sq!)}
                  onToggle={() => toggle(selectedJobTypes, setSelectedJobTypes, j.common_code_sq!)}
                />
              ))}
            </FilterSection>
          )}

          {/* 거리 — Vue 원본과 동일하게 항상 선택 가능 (좌표 없으면 백엔드가 필터 무시) */}
          <FilterSection label="거리">
            <div className="flex flex-wrap gap-2">
              {DISTANCE_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.value}
                  active={distance === opt.value}
                  onClick={() => setDistance(opt.value)}
                >
                  {opt.label}
                </PillButton>
              ))}
            </div>
            {!canUseDistance && (
              <p className="mt-1 text-xs text-muted-foreground">
                ※ 거리 필터는 로그인 후 내 주소 등록 시 적용됩니다.
              </p>
            )}
          </FilterSection>

          {/* 단가 — 전체 포함 */}
          <FilterSection label="단가 (이상)">
            <div className="flex flex-wrap gap-2">
              {PRICE_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.value}
                  active={minPrice === opt.value}
                  onClick={() => setMinPrice(opt.value)}
                >
                  {opt.label}
                </PillButton>
              ))}
            </div>
          </FilterSection>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSearch} className="flex-1">검색</Button>
            <Button variant="outline" onClick={handleReset}>초기화</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">{children}</div>
    </div>
  )
}

function CheckItem({
  id, label, checked, onToggle,
}: { id: string; label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Checkbox id={id} checked={checked} onCheckedChange={() => onToggle()} />
      <label htmlFor={id} className="cursor-pointer text-sm">{label}</label>
    </div>
  )
}

function PillButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  )
}
