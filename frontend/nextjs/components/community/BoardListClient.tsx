'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BoardTable from '@/components/community/BoardTable'
import CommonPagination from '@/components/community/CommonPagination'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/lib/api'
import type { BoardItem, BoardListResponse } from '@/types'

type BoardCategory = 'board' | 'qna' | 'notice'

const STATUS_OPTIONS = [
  { value: 'all', label: '상태' },
  { value: '1501', label: '진행중' },
  { value: '1502', label: '채택완료' },
  { value: '1503', label: '자체해결' },
  { value: '1504', label: '미해결' },
]

interface Props {
  boardCategory: BoardCategory
}

const PAGE_SIZE = 10

export default function BoardListClient({ boardCategory }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, authChecked } = useUserStore()

  const [boardList, setBoardList] = useState<BoardItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // 필터 state — URL searchParams에서 초기화
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1))
  const [sortType, setSortType] = useState(() => searchParams.get('sort') || 'latest')
  const [searchType, setSearchType] = useState(() => searchParams.get('searchType') || 'all')
  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') || '')
  const [statusCd, setStatusCd] = useState(() => searchParams.get('status') || 'all')
  const [tag, setTag] = useState(() => searchParams.get('tag') || '')

  const isQna = boardCategory === 'qna'
  const isNotice = boardCategory === 'notice'
  // authChecked 전까지 로그인 상태를 단정하지 않아 SSR/클라 hydration 불일치 방지
  const canRegister = authChecked && !isNotice && isLoggedIn()

  const fetchList = useCallback(async (p: number, sort: string, sType: string, kw: string, status: string, t: string) => {
    setIsLoading(true)
    try {
      let url = `/${boardCategory}?page=${p}&size=${PAGE_SIZE}&sortType=${sort}`
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
  }, [boardCategory, isQna])

  // URL 반영
  const syncUrl = useCallback((params: Record<string, string>) => {
    const qs = new URLSearchParams({ ...Object.fromEntries(searchParams), ...params })
    router.replace(`/${boardCategory}?${qs.toString()}`)
  }, [boardCategory, router, searchParams])

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
    fetchList(1, val, searchType, keyword, statusCd, tag)
  }

  const onStatus = (val: string) => {
    setStatusCd(val); setPage(1)
    syncUrl({ status: val, page: '1' })
    fetchList(1, sortType, searchType, keyword, val, tag)
  }

  const onSearch = () => {
    setPage(1)
    syncUrl({ page: '1', searchType, keyword: keyword.trim() || '' })
    fetchList(1, sortType, searchType, keyword, statusCd, tag)
  }

  const onPageChange = (p: number) => {
    setPage(p); syncUrl({ page: String(p) })
    fetchList(p, sortType, searchType, keyword, statusCd, tag)
  }

  const title = tag
    ? `${boardCategory === 'board' ? '일반' : boardCategory === 'qna' ? 'QnA' : '공지'} 게시판 (#${tag})`
    : boardCategory === 'board' ? '일반 게시판'
    : boardCategory === 'qna' ? 'QnA 게시판'
    : '공지사항'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
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

      {/* 리스트 */}
      {isLoading ? (
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
    </div>
  )
}
