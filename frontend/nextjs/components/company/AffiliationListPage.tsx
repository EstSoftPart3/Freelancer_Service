'use client'
// Mirrors vue_js/src/fo/views/company/AffiliationListPage.vue
import { useCallback, useEffect, useState } from 'react'
import { Heart, Eye, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CommonPagination from '@/components/community/CommonPagination'
import { useUserStore } from '@/stores/userStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface AreaCode {
  areaCodeSq: number
  areaSigungu: string
  parentAreaCodeSq: number | null
  children?: AreaCode[]
}

export interface AffiliationItem {
  sq: number
  companyNm: string
  profileImg?: string
  viewCnt: number
  isScrap: boolean
  isApply: boolean
  tags: string[]
  greeting?: string
  ceoNm?: string
  openYear?: number
  address?: string
}

interface ResumeOption {
  resumeSq: number
  resumeTtl: string
}

type SortType = 'latest' | 'oldest' | 'view' | 'scrap' | 'applicant'
type SearchType = 'all' | 'company' | 'content' | 'tag'

const formatNum = (n: number) => {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
}

const removeAllTxt = (str: string) =>
  str.endsWith('전체') ? str.slice(0, -2) : str

const PAGE_SIZE = 8

interface Props {
  // 서버에서 미리 조회한 첫 페이지(기본 정렬) — SEO용으로 초기 HTML에 목록을 포함시킨다.
  // 마운트 후 fetchList가 1회 갱신한다(기존 동작 유지).
  initialData?: { companies: AffiliationItem[]; totalElements: number } | null
}

export default function AffiliationListPage({ initialData }: Props = {}) {
  const { affiliatedCompanySq, isLoggedIn, getUserType } = useUserStore()

  const [isLoading, setIsLoading] = useState(false)
  const [list, setList] = useState<AffiliationItem[]>(initialData?.companies ?? [])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(
    initialData && initialData.totalElements > 0 ? Math.ceil(initialData.totalElements / PAGE_SIZE) : 1,
  )

  // 필터 UI 상태
  const [sortType, setSortType] = useState<SortType>('latest')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [keyword, setKeyword] = useState('')
  // 실제 검색에 적용된 값 (제출 시에만 반영)
  const [activeKeyword, setActiveKeyword] = useState('')
  const [activeSearchType, setActiveSearchType] = useState<SearchType>('all')

  const [addressCdList, setAddressCdList] = useState<AreaCode[]>([])
  const [selectedParent, setSelectedParent] = useState<number | 'all'>('all')
  const [addressCd, setAddressCd] = useState<number | 'all'>('all')
  const [childList, setChildList] = useState<AreaCode[]>([])

  // 신청 모달
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAfltn, setSelectedAfltn] = useState<AffiliationItem | null>(null)
  const [applyLoading, setApplyLoading] = useState(false)
  const [resumes, setResumes] = useState<ResumeOption[]>([])
  const [selectedResumeSq, setSelectedResumeSq] = useState<number | ''>('')
  const [applyGreeting, setApplyGreeting] = useState('')

  const fetchAddresses = useCallback(async () => {
    try {
      const { data } = await api.get<{ output: AreaCode[] }>('/affiliation/address')
      const parents = data.output
        .filter((a) => a.parentAreaCodeSq === null)
        .map((parent) => ({
          ...parent,
          children: data.output.filter((a) => a.parentAreaCodeSq === parent.areaCodeSq),
        }))
        // 이슈 3: 시/도 가나다순 정렬
        .sort((a, b) => a.areaSigungu.localeCompare(b.areaSigungu, 'ko'))
      setAddressCdList(parents)
    } catch {
      alertStore.show('주소 정보 로드에 실패하였습니다.', 'danger')
    }
  }, [])

  // 이슈 4: keyword/searchType은 deps에서 제외 → 제출 시에만 activeKeyword/activeSearchType 업데이트
  const fetchList = useCallback(async (page: number) => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE, sortType }
      if (activeKeyword.trim()) {
        params.searchType = activeSearchType
        params.keyword = activeKeyword.trim()
      }
      if (addressCd !== 'all') params.addressCd = addressCd

      const { data } = await api.get<{ output: { companies: AffiliationItem[]; totalElements: number } }>(
        '/affiliation', { params },
      )
      const total = data.output.totalElements
      setTotalPages(total === 0 ? 1 : Math.ceil(total / PAGE_SIZE))
      setList(data.output.companies)
    } catch {
      alertStore.show('소속 공고를 불러올 수 없습니다.', 'danger')
    } finally {
      setIsLoading(false)
    }
  }, [sortType, activeKeyword, activeSearchType, addressCd])

  useEffect(() => { fetchAddresses() }, [fetchAddresses])
  useEffect(() => { fetchList(currentPage) }, [currentPage, fetchList])

  const handleParentChange = (val: string) => {
    const sq = val === 'all' ? 'all' : Number(val)
    setSelectedParent(sq)
    setAddressCd(sq)
    if (sq === 'all') {
      setChildList([])
    } else {
      const parent = addressCdList.find((a) => a.areaCodeSq === sq)
      setChildList(parent?.children ?? [])
    }
    setCurrentPage(1)
  }

  // 이슈 4: 검색은 버튼/Enter 클릭 시에만
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveKeyword(keyword)
    setActiveSearchType(searchType)
    setCurrentPage(1)
  }

  const clickScrap = async (sq: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn()) {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
      return
    }
    try {
      const { data } = await api.post<{ message: string }>(`/affiliation/${sq}/scrap`)
      alertStore.show(data.message, 'success')
      fetchList(currentPage)
    } catch {
      alertStore.show('로그인 후 이용해주세요.', 'danger')
    }
  }

  const fetchResumes = async () => {
    try {
      // 이슈 6: 올바른 이력서 목록 endpoint
      const { data } = await api.get<{ output: ResumeOption[] }>('/mypage/resume/select-list')
      setResumes(data.output ?? [])
    } catch {
      setResumes([])
    }
  }

  const clickApplication = async (afltn: AffiliationItem) => {
    api.patch(`/affiliation/${afltn.sq}/increment-view`).catch(() => {})
    setSelectedAfltn(afltn)
    setSelectedResumeSq('')
    setApplyGreeting('')
    setModalOpen(true)
    if (!afltn.isApply && isLoggedIn()) {
      await fetchResumes()
    }
  }

  const handleApply = async () => {
    if (!selectedAfltn) return
    if (!isLoggedIn()) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
    // Vue clickRecruit: 기업 회원은 소속(클랜) 신청 불가 — 이력서 체크보다 먼저
    if (getUserType() === 'COMPANY') { alertStore.show('기업 회원은 소속 신청할 수 없습니다.', 'danger'); return }
    if (!selectedResumeSq) { alertStore.show('이력서를 선택해주세요.', 'danger'); return }
    setApplyLoading(true)
    try {
      const { data } = await api.post<{ message: string }>('/affiliation/apply', {
        companySq: selectedAfltn.sq,
        resumeSq: selectedResumeSq,
        companyApplicationGreetingTxt: applyGreeting,
      })
      alertStore.show(data.message ?? '소속 신청이 완료되었습니다.', 'success')
      setModalOpen(false)
      fetchList(currentPage)
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } }).response?.data?.message
      alertStore.show(msg ?? '소속 신청에 실패하였습니다.', 'danger')
    } finally {
      setApplyLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">소속 모집 공고</h1>

      {/* 필터 영역 */}
      <div className="mb-6 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <select
            value={sortType}
            onChange={(e) => { setSortType(e.target.value as SortType); setCurrentPage(1) }}
            className="cursor-pointer rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="view">조회순</option>
            <option value="scrap">스크랩순</option>
            <option value="applicant">지원자순</option>
          </select>

          <select
            value={String(selectedParent)}
            onChange={(e) => handleParentChange(e.target.value)}
            className="cursor-pointer rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">시/도 선택</option>
            {addressCdList.map((a) => (
              <option key={a.areaCodeSq} value={String(a.areaCodeSq)}>
                {removeAllTxt(a.areaSigungu)}
              </option>
            ))}
          </select>

          {childList.length > 0 && (
            <select
              value={String(addressCd)}
              onChange={(e) => {
                setAddressCd(e.target.value === String(selectedParent) ? (selectedParent as number) : Number(e.target.value))
                setCurrentPage(1)
              }}
              className="cursor-pointer rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value={String(selectedParent)}>전체</option>
              {childList.map((a) => (
                <option key={a.areaCodeSq} value={String(a.areaCodeSq)}>
                  {a.areaSigungu}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 검색 — Enter 또는 버튼 클릭 시에만 반영 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="cursor-pointer rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">전체</option>
            <option value="company">회사명</option>
            <option value="content">내용</option>
            <option value="tag">태그</option>
          </select>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력"
            className="w-40 text-sm"
          />
          <Button type="submit" size="sm">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* 목록 — 이슈 1: Vue 원본과 동일한 카드 계층 구조 */}
      {isLoading && list.length === 0 ? (
        // SSR된 초기 목록이 있으면 스켈레톤으로 덮지 않고 갱신 완료 시 교체
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item) => (
            <article
              key={item.sq}
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              {/* 이미지 영역 */}
              <div className="relative flex h-40 items-center justify-center border-b bg-gray-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.profileImg || '/img/logos/Company_logo.png'}
                  alt={`${item.companyNm} 로고`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/img/logos/Company_logo.png' }}
                />
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                  <Eye className="h-3 w-3" />
                  <span>{formatNum(item.viewCnt)}</span>
                </div>
              </div>

              {/* 콘텐츠 영역 */}
              <div className="flex flex-1 flex-col bg-white p-3">
                {/* 회사명 + 스크랩 */}
                <div className="mb-2 flex items-start justify-between">
                  <button
                    type="button"
                    onClick={() => clickApplication(item)}
                    className="max-w-[85%] cursor-pointer truncate text-base font-bold text-primary hover:underline"
                  >
                    {item.companyNm}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => clickScrap(item.sq, e)}
                    className="ml-1 shrink-0 cursor-pointer"
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 transition-colors',
                        item.isScrap ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
                      )}
                    />
                  </button>
                </div>

                {/* 태그 */}
                <div className="mb-2 flex h-6 flex-wrap gap-1 overflow-hidden">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[0.68rem] text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 회사 소개 */}
                <div className="mb-3 min-h-[70px] flex-1 rounded bg-gray-100 p-2">
                  <p className="line-clamp-3 text-[0.85rem] leading-[1.4] text-gray-700">
                    {item.greeting?.trim() || '등록된 소개 문구가 없습니다.'}
                  </p>
                </div>

                {/* 신청 버튼 */}
                <button
                  type="button"
                  disabled={affiliatedCompanySq === item.sq || item.isApply}
                  onClick={() => clickApplication(item)}
                  className={cn(
                    'w-full cursor-pointer rounded-md py-1.5 text-sm font-medium transition-colors',
                    affiliatedCompanySq === item.sq || item.isApply
                      ? 'cursor-default bg-gray-100 text-gray-400'
                      : 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
                  )}
                >
                  {affiliatedCompanySq === item.sq
                    ? '소속 중'
                    : item.isApply
                      ? '소속 신청 완료'
                      : '소속 신청하기'}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/30 py-16 text-center">
          <p className="text-sm text-muted-foreground">등록된 소속 공고가 없습니다.</p>
        </div>
      )}

      <div className="mt-6">
        <CommonPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* 소속 신청/정보 모달 */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) { setApplyGreeting(''); setSelectedResumeSq('') }
          setModalOpen(open)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedAfltn?.isApply ? '소속 정보' : '소속 신청하기'}
            </DialogTitle>
          </DialogHeader>

          {selectedAfltn && (
            <div className="space-y-4 py-2 text-sm">
              <InfoRow label="회사명" value={selectedAfltn.companyNm} />
              <InfoRow label="대표자명" value={selectedAfltn.ceoNm} />
              <InfoRow label="개업년수" value={selectedAfltn.openYear != null ? `${selectedAfltn.openYear}년차` : undefined} />
              <InfoRow label="회사위치" value={selectedAfltn.address} />
              <InfoRow label="회사 설명" value={selectedAfltn.greeting} />

              {selectedAfltn.tags.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold text-primary">관련 태그</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAfltn.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {!selectedAfltn.isApply && (
                <>
                  <div>
                    <p className="mb-1 font-semibold text-primary">소속 신청할 이력서</p>
                    {resumes.length > 0 ? (
                      <select
                        value={String(selectedResumeSq)}
                        onChange={(e) => setSelectedResumeSq(Number(e.target.value))}
                        className="w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">이력서를 선택하세요.</option>
                        {resumes.map((r) => (
                          <option key={r.resumeSq} value={String(r.resumeSq)}>{r.resumeTtl}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-muted-foreground">등록된 이력서가 없습니다.</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-primary">간단한 자기소개</p>
                    <textarea
                      value={applyGreeting}
                      onChange={(e) => setApplyGreeting(e.target.value)}
                      placeholder="자기소개를 입력해주세요."
                      rows={4}
                      className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            {selectedAfltn?.isApply ? (
              <Button variant="outline" disabled>
                {affiliatedCompanySq === selectedAfltn?.sq ? '소속 중' : '소속 신청 완료'}
              </Button>
            ) : (
              <Button onClick={handleApply} disabled={applyLoading}>
                {applyLoading ? '신청 중...' : '소속 신청하기'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setModalOpen(false)}>닫기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="font-semibold text-primary">{label}</p>
      <p className="text-foreground">{value ?? '-'}</p>
    </div>
  )
}
