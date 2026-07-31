// [Freelancer Service] 고객의 소리 관리
import { useCallback, useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { vocApi } from './api/voc-api'
import { VocDeepLink } from './components/voc-deep-link'
import { VocDialogs } from './components/voc-dialogs'
import { VocProvider } from './components/voc-provider'
import { VocTable } from './components/voc-table'
import type { AdminVoc } from './data/schema'

const routeApi = getRouteApi('/_authenticated/contents/voc/')

export function VocList() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  const [data, setData] = useState<AdminVoc[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState(search.keyword || '')

  const fetchVocs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await vocApi.getVocs({
        page: search.page || 1,
        size: search.pageSize || 10,
        keyword: search.keyword || undefined,
        // 하나만 골랐을 때만 서버 필터가 의미를 갖는다(둘 다 = 전체)
        answered:
          search.answeredPicks?.length === 1
            ? search.answeredPicks[0] === 'true'
            : undefined,
        sortField: search.sortField || 'createdAt',
        sortOrder: search.sortOrder || 'DESC',
      })
      if (response.status === 'OK' && response.output) {
        setData(response.output.boards)
        setTotalCount(response.output.totalElements)
      }
    } catch (_) {
      toast.error('고객의 소리 목록을 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchVocs()
  }, [fetchVocs])

  // 검색어는 타이핑이 멈춘 뒤 URL 에 반영한다(게시글 관리와 같은 방식)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== (search.keyword || '')) {
        navigate({
          search: (prev) => ({ ...prev, keyword: keyword || undefined, page: 1 }),
        })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword, navigate, search.keyword])

  return (
    <VocProvider refresh={fetchVocs}>
      {/* 메일 링크(?view={sq})로 들어온 경우 해당 문의의 상세 패널을 자동으로 연다 */}
      <VocDeepLink viewSq={search.view} rows={data} isLoading={isLoading} />
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
            <h2 className='text-2xl font-bold tracking-tight'>고객의 소리 관리</h2>
            <p className='text-muted-foreground'>
              이용자가 남긴 문의·개선 의견을 확인하고 답변합니다. 답변을 등록하면
              문의자에게 알림이 발송됩니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <VocTable
            data={data}
            totalCount={totalCount}
            page={search.page || 1}
            keyword={keyword}
            answeredPicks={search.answeredPicks || []}
            sortField={search.sortField || 'createdAt'}
            sortOrder={search.sortOrder || 'DESC'}
            setKeyword={setKeyword}
            setPage={(newPage) =>
              navigate({ search: (prev) => ({ ...prev, page: newPage }) })
            }
            onSort={(field, order) =>
              navigate({
                search: (prev) => ({ ...prev, sortField: field, sortOrder: order }),
              })
            }
            onFilterPicked={(picks) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  answeredPicks: picks.length ? picks : undefined,
                  page: 1,
                }),
              })
            }
          />
        )}
      </Main>

      <VocDialogs />
    </VocProvider>
  )
}
