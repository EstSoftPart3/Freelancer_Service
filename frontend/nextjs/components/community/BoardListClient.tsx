'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BoardTable from '@/components/community/BoardTable'
import BoardCardList from '@/components/community/BoardCardList'
import CommonPagination from '@/components/community/CommonPagination'
import CategoryTabs from '@/components/community/CategoryTabs'
import BoardCategoryTabs from '@/components/community/BoardCategoryTabs'
import PopularWidget from '@/components/community/PopularWidget'
import { alertStore } from '@/stores/alertStore'
import { useUserStore } from '@/stores/userStore'
import { useCommunityStore } from '@/stores/communityStore'
import api from '@/lib/api'
import { InfoTooltip } from '@/components/ui/tooltip'
import { BOARD_INTRO_TIPS, BOARD_PAGE_TITLE, supportsAnswer, hasCategory, type BoardType as BoardCategory } from '@/components/community/boardMeta'
import type { BoardItem, BoardListResponse } from '@/types'

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

// URL 파라미터는 문자열이라 그대로 두면 `categoryCd === 3203` 비교가 항상 거짓이 된다.
// 숫자가 아니면 전체(null)로 떨어뜨린다 — 손으로 고친 URL에 빈 목록을 주지 않기 위해서다.
function parseCategory(raw: string | null): number | null {
  if (!raw) return null
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default function BoardListClient({ boardCategory, initialData }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn, authChecked, userSq } = useUserStore()
  const setCommunityFilters = useCommunityStore((s) => s.setFilters)

  const [boardList, setBoardList] = useState<BoardItem[]>(initialData?.boards ?? [])
  const [totalPages, setTotalPages] = useState(
    initialData ? Math.max(1, Math.ceil(initialData.totalElements / PAGE_SIZE)) : 1,
  )
  const [isLoading, setIsLoading] = useState(false)
  // 정렬·검색·페이지 전환을 빠르게 연달아 누르면 먼저 보낸 느린 요청이 나중 요청보다 늦게
  // 응답할 수 있다 — 응답 순서가 아니라 "가장 마지막으로 보낸 요청"만 반영한다.
  const requestSeqRef = useRef(0)
  // onSort/onStatus/onSearch/onPageChange는 자기 값으로 곧장 fetchList를 부르면서 동시에
  // syncUrl로 page를 바꾼다 — 그 URL 변경이 page 파라미터를 실제로 바꾸면 아래
  // "초기 + tag 변경 감지" effect도 다시 깨워 방금 보낸 것과 같은 조회를 한 번 더 내보낸다
  // (요청 2배). 직접 호출한 (page,tag,category) 조합을 기억해 뒀다가, effect가 정확히 같은
  // 조합으로 깨어나면 그 1회만 건너뛴다 — 값으로 비교하므로 유효기간이 남는 boolean 플래그와
  // 달리 관계없는 다음 변경까지 잘못 건너뛰지 않는다.
  const pendingSkipKeyRef = useRef<string | null>(null)

  // 필터 state — URL 우선, 없으면 탭 전환 간 보존되는 communityStore 값으로 폴백
  // (getState()로 스냅샷만 읽어 store 변경에 이 컴포넌트가 불필요하게 재구독되지 않게 한다)
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1))
  const [sortType, setSortType] = useState(() => searchParams.get('sort') || useCommunityStore.getState().sort)
  const [searchType, setSearchType] = useState(() => searchParams.get('searchType') || useCommunityStore.getState().searchType)
  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') || useCommunityStore.getState().keyword)
  const [statusCd, setStatusCd] = useState(() => searchParams.get('status') || useCommunityStore.getState().status)
  const [tag, setTag] = useState(() => searchParams.get('tag') || '')
  // 카테고리는 일반게시판 전용 필터 — URL(?category=)만을 출처로 삼는다.
  // communityStore에 넣지 않는 이유: 탭을 Q&A로 옮겼다 돌아왔을 때 필터가 살아 있으면
  // 사용자가 "글이 없어졌다"고 느낀다(게시판 종류와 카테고리는 다른 축이다).
  const [categoryCd, setCategoryCd] = useState(() => parseCategory(searchParams.get('category')))

  // 답변+채택을 지원하는 게시판(QnA·커리어소통·기술소통) — 채택상태 필터·드롭다운을 함께 보여준다.
  const isAnswerBoard = supportsAnswer(boardCategory)
  const isNotice = boardCategory === 'notice'
  const isVoc = boardCategory === 'voc'
  const isAll = boardCategory === 'all'
  // 중분류(카테고리) 필터 줄 — hasCategory()가 정본이다(중분류가 실제로 있는 종류인지).
  // 예전엔 "notice/voc/all이 아니면 전부"로 하드코딩해서, 중분류가 없는 요즘회사(company)에도
  // 이 축이 있는 것처럼 취급돼 불필요한 카테고리 조회·잘못된 category 파라미터 전송으로 샜다.
  // hasCategory()의 BOARD_CATEGORY_FALLBACK엔 'board'(일반게시판) 키가 없다 — 옛 3200 그룹이
  // 지금은 전부 비활성이라 "새로 고를 수 있는" 카테고리가 없다는 뜻으로 뺀 것이지만, 이미 옛
  // 카테고리가 달려 있는 기존 글을 그 카테고리로 걸러보는 조회 기능 자체는 여전히 유효하다
  // (BoardTypeCode.NORMAL도 hasCategory=true로 선언돼 있다) — 'board'는 명시적으로 포함한다.
  const hasCategoryTabs = boardCategory === 'board' || hasCategory(boardCategory)
  // authChecked 전까지 로그인 상태를 단정하지 않아 SSR/클라 hydration 불일치 방지
  // 전체보기 탭은 등록 버튼을 숨기고(허브 QuickPostCard가 담당) 게시판 탭에서만 노출한다.
  const canRegister = authChecked && !isNotice && !isAll && isLoggedIn()

  const basePath = isAll ? '/community/list' : `/${boardCategory}`

  const fetchList = useCallback(async (p: number, sort: string, sType: string, kw: string, status: string, t: string, cat: number | null) => {
    const seq = ++requestSeqRef.current
    setIsLoading(true)
    try {
      let url = isAll
        ? `/community/boards?boardType=all&page=${p}&size=${PAGE_SIZE}&sortType=${sort}`
        : `/${boardCategory}?page=${p}&size=${PAGE_SIZE}&sortType=${sort}`
      if (kw.trim()) url += `&searchType=${sType}&keyword=${encodeURIComponent(kw.trim())}`
      if (isAnswerBoard && status !== 'all') url += `&boardAdoptStatusCd=${status}`
      if (t) url += `&tag=${encodeURIComponent(t)}`
      if (hasCategoryTabs && cat !== null) url += `&category=${cat}`

      const { data } = await api.get<{ output: BoardListResponse }>(url)
      if (seq !== requestSeqRef.current) return // 그 사이 더 최신 요청이 나갔다 — 이 응답은 버린다
      const out = data.output
      const total = out.totalElements === 0 ? 1 : Math.ceil(out.totalElements / PAGE_SIZE)
      setTotalPages(total)
      setBoardList(out.boards)
    } catch {
      if (seq !== requestSeqRef.current) return
      alertStore.show('게시글을 불러올 수 없습니다.', 'danger')
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false)
    }
  }, [boardCategory, isAnswerBoard, isAll, hasCategoryTabs])

  // URL 반영
  const syncUrl = useCallback((params: Record<string, string>) => {
    const qs = new URLSearchParams({ ...Object.fromEntries(searchParams), ...params })
    router.replace(`${basePath}?${qs.toString()}`)
  }, [basePath, router, searchParams])

  // 초기 + tag 변경 감지
  useEffect(() => {
    const t = searchParams.get('tag') || ''
    setTag(t)
    const cat = parseCategory(searchParams.get('category'))
    setCategoryCd(cat)
    const p = Math.max(1, Number(searchParams.get('page')) || 1)
    setPage(p)
    const key = `${p}|${t}|${cat}`
    if (pendingSkipKeyRef.current === key) {
      pendingSkipKeyRef.current = null
    } else {
      fetchList(p, sortType, searchType, keyword, statusCd, t, cat)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('tag'), searchParams.get('page'), searchParams.get('category')])

  const onSort = (val: string) => {
    setSortType(val)
    // page가 이미 1이면 URL의 page 파라미터가 안 바뀌어 effect가 재실행되지 않는다 —
    // 그럴 때 pendingSkipKeyRef를 세팅하면 다음 실제 변경 때까지 값이 남아 엉뚱한 조회를 건너뛰게 된다.
    if (page !== 1) pendingSkipKeyRef.current = `1|${tag}|${categoryCd}`
    setPage(1)
    syncUrl({ sort: val, page: '1' })
    setCommunityFilters({ sort: val })
    fetchList(1, val, searchType, keyword, statusCd, tag, categoryCd)
  }

  const onStatus = (val: string) => {
    setStatusCd(val)
    if (page !== 1) pendingSkipKeyRef.current = `1|${tag}|${categoryCd}`
    setPage(1)
    syncUrl({ status: val, page: '1' })
    setCommunityFilters({ status: val })
    fetchList(1, sortType, searchType, keyword, val, tag, categoryCd)
  }

  const onSearch = () => {
    if (page !== 1) pendingSkipKeyRef.current = `1|${tag}|${categoryCd}`
    setPage(1)
    syncUrl({ page: '1', searchType, keyword: keyword.trim() || '' })
    setCommunityFilters({ searchType, keyword: keyword.trim() })
    fetchList(1, sortType, searchType, keyword, statusCd, tag, categoryCd)
  }

  const onPageChange = (p: number) => {
    if (p !== page) pendingSkipKeyRef.current = `${p}|${tag}|${categoryCd}`
    setPage(p)
    syncUrl({ page: String(p) })
    fetchList(p, sortType, searchType, keyword, statusCd, tag, categoryCd)
  }

  // 카테고리만은 URL 변경에 반응하는 위 useEffect가 조회까지 맡는다.
  // 여기서 fetchList를 또 부르면 같은 목록을 두 번 요청하게 된다.
  const onCategory = (cat: number | null) => {
    const qs = new URLSearchParams(Object.fromEntries(searchParams))
    if (cat === null) qs.delete('category')
    else qs.set('category', String(cat))
    qs.set('page', '1')
    router.replace(`${basePath}?${qs.toString()}`)
  }

  const title = tag ? `${BOARD_PAGE_TITLE[boardCategory]} (#${tag})` : BOARD_PAGE_TITLE[boardCategory]

  // 탭 줄 오른쪽(공지는 단독 줄)에 들어가는 필터·검색 컨트롤
  const filterControls = (
    <>
      <select
        value={sortType}
        onChange={(e) => onSort(e.target.value)}
        className="h-8 shrink-0 rounded-lg border border-border bg-background px-2 text-sm"
      >
        <option value="latest">최신순</option>
        <option value="oldest">오래된순</option>
        <option value="view">조회순</option>
        <option value="comment">댓글순</option>
        <option value="recommend">추천순</option>
      </select>
      {isAnswerBoard && (
        <select
          value={statusCd}
          onChange={(e) => onStatus(e.target.value)}
          className="h-8 shrink-0 rounded-lg border border-border bg-background px-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      <form
        onSubmit={(e) => { e.preventDefault(); onSearch() }}
        className="flex w-full gap-2 md:w-auto"
      >
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="h-8 shrink-0 rounded-lg border border-border bg-background px-2 text-sm"
        >
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어 입력"
          className="h-8 w-full min-w-0 flex-1 md:w-36 md:flex-none"
        />
        <Button type="submit" size="sm" className="shrink-0">검색</Button>
      </form>
    </>
  )

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {!isNotice && <CategoryTabs rightSlot={filterControls} />}
      <div className="lg:flex lg:gap-6">
      <main className="min-w-0 flex-1">
      <h1 className="mb-6 flex items-center gap-1.5 text-2xl font-bold">
        {title}
        {BOARD_INTRO_TIPS[boardCategory] && (
          <InfoTooltip label={`${BOARD_PAGE_TITLE[boardCategory]} 안내`}>{BOARD_INTRO_TIPS[boardCategory]}</InfoTooltip>
        )}
      </h1>

      {/* 공지는 카테고리 탭이 없으므로 필터를 단독 줄로 노출 */}
      {isNotice && (
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-4">{filterControls}</div>
      )}

      {/* 게시판 중분류 — 공지·고객의소리·전체보기에는 이 축이 없다. 중분류가 없는 게시판은
          BoardCategoryTabs 스스로 아무것도 그리지 않는다. */}
      {hasCategoryTabs && <BoardCategoryTabs boardType={boardCategory} selected={categoryCd} onSelect={onCategory} />}

      {isVoc && (
        <p className="mb-4 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          서비스 이용 중 불편한 점이나 개선 의견을 남겨주세요. 운영자가 확인 후 답변드립니다.
          <br />
          <span className="font-medium text-foreground">비공개</span>로 등록하면 작성자와 운영자만 볼 수 있습니다.
        </p>
      )}

      {/* 리스트 — SSR된 초기 목록이 있으면 로딩 문구로 덮지 않고 갱신 완료 시 교체.
          md 미만 카드 / md 이상 리스트형 행 — CSS 이중 렌더로 SSR·hydration 안전 */}
      {isLoading && boardList.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">게시글을 불러오는 중입니다...</div>
      ) : (
        <>
          <div className="md:hidden">
            <BoardCardList boardList={boardList} boardType={boardCategory} viewerSq={userSq} />
          </div>
          <div className="hidden md:block">
            <BoardTable boardList={boardList} boardType={boardCategory} viewerSq={userSq} />
          </div>
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

      {!isNotice && !isVoc && (
        <aside className="mt-6 hidden w-[300px] shrink-0 lg:mt-0 lg:block">
          <PopularWidget />
        </aside>
      )}
      </div>
    </div>
  )
}
