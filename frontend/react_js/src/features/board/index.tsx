// src/features/board/index.tsx
import { useCallback, useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
// 추가
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { boardApi } from './api/board-api'
import { BoardDialogs } from './components/board-dialogs'
import { BoardPrimaryButtons } from './components/board-primary-buttons'
import { BoardProvider } from './components/board-provider'
import { BoardTable } from './components/board-table'
import type { AdminBoard } from './data/schema'

const routeApi = getRouteApi('/_authenticated/contents/board/')

export function BoardList() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  const [data, setData] = useState<AdminBoard[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 입력 중인 검색어 상태 (내부 입력 폼용)
  const [keyword, setKeyword] = useState(search.keyword || '')

  // 2. URL 파라미터가 바뀔 때마다 데이터를 가져오는 함수
  const fetchBoards = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await boardApi.getBoards({
        page: search.page || 1,
        size: search.pageSize || 10,
        typeCds: search.typeCds?.length ? search.typeCds : undefined,
        keyword: search.keyword || undefined,
        tagKeyword: search.tagKeyword || undefined,
        sortField: search.sortField || 'createdAt',
        sortOrder: search.sortOrder || 'DESC',
      })

      if (response.status === 'OK' && response.output) {
        setData(response.output.boards)
        setTotalCount(response.output.totalElements)
      }
    } catch (_) {
      toast.error('게시글 목록을 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [search]) // search 객체가 바뀔 때마다 실행

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  // 3. 검색어 타이핑 시 URL을 업데이트하는 디바운스 로직
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== (search.keyword || '')) {
        navigate({
          search: (prev) => ({
            ...prev,
            keyword: keyword || undefined,
            page: 1,
          }),
        })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword, navigate, search.keyword])

  // 4. 페이지, 정렬, 필터 변경 시 호출될 핸들러 (URL 업데이트)
  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) })
  }

  const handleFilterType = (types: number[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        typeCds: types.length ? types : undefined,
        page: 1,
      }),
    })
  }

  const handleSort = (field: string, order: string) => {
    navigate({
      search: (prev) => ({ ...prev, sortField: field, sortOrder: order }),
    })
  }

  return (
    <BoardProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>게시글 관리</h2>
            <p className='text-muted-foreground'>
              일반 게시글, Q&A, 답변을 통합 관리합니다.
            </p>
          </div>
          <BoardPrimaryButtons />
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <BoardTable
            data={data}
            totalCount={totalCount}
            page={search.page || 1}
            typeCds={search.typeCds || []}
            keyword={keyword}
            // [추가] 현재 URL의 정렬 상태를 전달합니다.
            sortField={search.sortField || 'createdAt'}
            sortOrder={search.sortOrder || 'DESC'}
            setKeyword={setKeyword}
            onFilterType={handleFilterType}
            setPage={handlePageChange}
            onSort={handleSort}
            setTagKeyword={(tag) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  tagKeyword: tag || undefined,
                  page: 1,
                }),
              })
            }
          />
        )}
      </Main>

      <BoardDialogs />
    </BoardProvider>
  )
}
