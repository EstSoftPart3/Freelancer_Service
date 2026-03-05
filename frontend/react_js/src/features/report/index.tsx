// [Freelancer Service]
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
import { reportApi } from './api/report-api'
import { ReportDialogs } from './components/report-dialogs'
import { ReportProvider } from './components/report-provider'
import { ReportTable } from './components/report-table'
import { type AdminReport } from './data/schema'

// [참고] 라우트 경로는 프로젝트 설정에 맞춰 수정하세요 (예: /_authenticated/contents/report/)
const routeApi = getRouteApi('/_authenticated/contents/report/')

export function ReportList() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  const [data, setData] = useState<AdminReport[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 입력 중인 검색어 상태
  const [keyword, setKeyword] = useState(search.keyword || '')

  useEffect(() => {
    setKeyword(search.keyword || '')
  }, [search.keyword])

  /**
   * 1. URL 파라미터 기반 데이터 호출
   */
  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await reportApi.getReports({
        page: search.page || 1,
        size: search.pageSize || 10,
        statusCds: search.statusCds?.length ? search.statusCds : undefined,
        keyword: search.keyword || undefined,
        sortField: search.sortField || 'createdAt',
        sortOrder: search.sortOrder || 'DESC',
      })

      // [수정] 이제 response가 곧 AdminReportListResponse입니다.
      // response.output 대신 response에서 바로 꺼냅니다.
      if (response && response.reports) {
        setData(response.reports)
        setTotalCount(response.totalElements)
      }
    } catch (_) {
      toast.error('신고 목록을 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [search])

  // fetchReports를 실행시키는 useEffect가 없다면 꼭 추가해 주세요.
  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  /**
   * 2. 검색어 디바운스 로직 (URL 업데이트)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      // state와 URL 상의 keyword가 다를 때만 navigate 실행
      const currentSearchKeyword = search.keyword || ''
      if (keyword !== currentSearchKeyword) {
        navigate({
          search: (prev) => ({
            ...prev,
            keyword: keyword || undefined,
            page: 1, // 검색 시 무조건 1페이지로 이동
          }),
          replace: true, // 히스토리가 너무 많이 쌓이지 않게 replace 권장
        })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [keyword, navigate, search.keyword])

  // 핸들러들
  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) })
  }

  const handleFilterStatus = (statuses: number[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        statusCds: statuses.length ? statuses : undefined,
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
    <ReportProvider>
      <Header fixed>
        <Search placeholder='통합 검색...' />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>신고 관리</h2>
            <p className='text-muted-foreground'>
              사용자들이 접수한 게시글 및 댓글 신고 내역을 검토하고 처리합니다.
            </p>
          </div>
          {/* [수정] PrimaryButtons 제거됨 */}
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <ReportTable
            data={data}
            totalCount={totalCount}
            page={search.page || 1}
            statusCds={search.statusCds || []}
            keyword={keyword}
            sortField={search.sortField || 'createdAt'}
            sortOrder={search.sortOrder || 'DESC'}
            setKeyword={setKeyword}
            onFilterStatus={handleFilterStatus}
            setPage={handlePageChange}
            onSort={handleSort}
          />
        )}
      </Main>

      <ReportDialogs />
    </ReportProvider>
  )
}
