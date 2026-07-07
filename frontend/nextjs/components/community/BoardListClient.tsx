'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BoardTable from '@/components/community/BoardTable'
import CommonPagination from '@/components/community/CommonPagination'
import CategoryTabs from '@/components/community/CategoryTabs'
import PopularWidget from '@/components/community/PopularWidget'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import { useCommunityStore } from '@/stores/communityStore'
import api from '@/lib/api'
import type { BoardItem, BoardListResponse } from '@/types'

type BoardCategory = 'board' | 'qna' | 'notice' | 'all'

const STATUS_OPTIONS = [
  { value: 'all', label: '상태' },
  { value: '1501', label: '진행중' },
  { value: '1502', label: '채택완료' },
  { value: '1503', label: '자체해결' },
  { value: '1504', label: '미해결' },
]

interface Props {
  boardCategory: BoardCategory
  // 서버에서 미리 조회한 첫 페이지(기본 정렬) — SEO용으로 초기 HTML에 목록을 포함시킨다.
  // 마운트 후 fetchList가 URL/스토어 필터 기준으로 1회 갱신한다(기존 동작 유지).
  initialData?: BoardListResponse | null
}

const PAGE_SIZE = 10

export default function BoardListClient({ boardCategory, initialData }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, authChecked } = useUserStore()
  const setCommunityFilters = useCommunityStore((s) => s.setFilters)

  const [boardList, setBoardList] = useState<BoardItem[]>(initialData?.boards ?? [])
  const [totalPages, setTotalPages] = useState(
    initialData ? Math.max(1, Math.ceil(initialData.totalElements / PAGE_SIZE)) : 1,
  )
  const [isLoading, setIsLoading] = useState(false)

  // 필터 state — URL 우선, 없으면 탭 전환 간 보존되는 communityStore 값으로 폴백
  // (getState()로 스냅샷만 읽어 store 변경에 이 컴포넌트가 불필요하게 재구독되지 않게 한다)
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1))
  const [sortType, setSortType] = useState(() => searchParams.get('sort') || useCommunityStore.getState().sort)
  const [searchType, setSearchType] = useState(() => searchParams.get('searchType') || useCommunityStore.getState().searchType)
  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') || useCommunityStore.getState().keyword)
  const [statusCd, setStatusCd] = useState(() => searchParams.get('status') || useCommunityStore.getState().status)
  const [tag, setTag] = useState(() => searchParams.get('tag') || '')

  const isQna = boardCategory === 'qna'
  const isNotice = boardCategory === 'notice'
  const isAll = boardCategory === 'all'
  // authChecked 전까지 로그인 상태를 단정하지 않아 SSR/클라 hydration 불일치 방지
  // 전체보기 탭은 등록 버튼을 숨기고(허브 QuickPostCard가 담당) 게시판 탭에서만 노출한다.
  const canRegister = authChecked && !isNotice && !isAll && isLoggedIn()

  const basePath = isAll ? '/community/list' : `/${boardCategory}`

  const fetchList = useCallback(async (p: number, sort: string, sType: string, kw: string, status: string, t: string) => {
    setIsLoading(true)
    try {
      let url = isAll
        ? `/community/boards?boardType=all&page=${p}&size=${PAGE_SIZE}&sortType=${sort}`
        : `/${boardCategory}?page=${p}&size=${PAGE_SIZE}&sortType=${sort}`
      if (kw.trim()) url += `&searchType=${sType}&keyword=${encodeURIComponent(kw.trim())}`
      if (isQna && status !== 'all') url += `&boardAdoptStatusCd=${status}`
      if (t) url += `&tag=${encodeURIComponent(t)}`

      const { data } = await api.get<{ output: BoardListResponse }>(url)
      const out = data.output
      const total = out.totalElements === 0 ? 1 : Math.ceil(out.totalElements / PAGE_SIZE)
      setTotalPages(total)
      setBoardList(out.boards)
    } catch { alertStore.show('게시글을 불러올 수 없습니다.', 'danger') }
    finally { setIsLoading(false) }
  }, [boardCategory, isQna, isAll])

  // URL 반영
  const syncUrl = useCallback((params: Record<string, string>) => {
    const qs = new URLSearchParams({ ...Object.fromEntries(searchParams), ...params })
    router.replace(`${basePath}?${qs.toString()}`)
  }, [basePath, router, searchParams])

  // 초기 + tag 변경 감지
  useEffect(() => {
    const t = searchParams.get('tag') || ''
    setTag(t)
    const p = Math.max(1, Number(searchParams.get('page')) || 1)
    setPage(p)
    fetchList(p, sortType, searchType, keyword, statusCd, t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('tag'), searchParams.get('page')])

  const onSort = (val: string) => {
    setSortType(val); setPage(1)
    syncUrl({ sort: val, page: '1' })
    setCommunityFilters({ sort: val })
    fetchList(1, val, searchType, keyword, statusCd, tag)
  }

  const onStatus = (val: string) => {
    setStatusCd(val); setPage(1)
    syncUrl({ status: val, page: '1' })
    setCommunityFilters({ status: val })
    fetchList(1, sortType, searchType, keyword, val, tag)
  }

  const onSearch = () => {
    setPage(1)
    syncUrl({ page: '1', searchType, keyword: keyword.trim() || '' })
    setCommunityFilters({ searchType, keyword: keyword.trim() })
    fetchList(1, sortType, searchType, keyword, statusCd, tag)
  }

  const onPageChange = (p: number) => {
    setPage(p); syncUrl({ page: String(p) })
    fetchList(p, sortType, searchType, keyword, statusCd, tag)
  }

  const title = tag
    ? `${boardCategory === 'board' ? '일반' : boardCategory === 'qna' ? 'QnA' : boardCategory === 'notice' ? '공지' : '전체'} 게시판 (#${tag})`
    : boardCategory === 'board' ? '일반 게시판'
    : boardCategory === 'qna' ? 'QnA 게시판'
    : boardCategory === 'notice' ? '공지사항'
    : '커뮤니티 전체글'

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {!isNotice && <CategoryTabs />}
      <div className="lg:flex lg:gap-6">
      <main className="min-w-0 flex-1">
      <h1 className="mb-6 text-2xl font-bold">{title}</h1>

      {/* 필터 영역 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          <select
            value={sortType}
            onChange={(e) => onSort(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="view">조회순</option>
            <option value="comment">댓글순</option>
            <option value="recommend">추천순</option>
          </select>
          {isQna && (
            <select
              value={statusCd}
              onChange={(e) => onStatus(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); onSearch() }}
          className="flex flex-wrap gap-2"
        >
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
          >
            <option value="all">전체</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
          </select>
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어 입력"
            className="h-8 w-36"
          />
          <Button type="submit" size="sm">검색</Button>
        </form>
      </div>

      {/* 리스트 — SSR된 초기 목록이 있으면 로딩 문구로 덮지 않고 갱신 완료 시 교체 */}
      {isLoading && boardList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">게시글을 불러오는 중입니다...</div>
      ) : (
        <>
          <BoardTable boardList={boardList} boardType={boardCategory} />
          {canRegister && (
            <div className="mt-3 flex justify-end">
              <Link
                href={`/${boardCategory}/register`}
                className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                등록
              </Link>
            </div>
          )}
          <CommonPagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </>
      )}
      </main>

      {!isNotice && (
        <aside className="mt-6 hidden w-[300px] shrink-0 lg:mt-0 lg:block">
          <PopularWidget />
        </aside>
      )}
      </div>
    </div>
  )
}
