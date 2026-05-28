// [Freelancer Service] 배너 관리 페이지 (목 데이터 UI)
import { useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { BannerDialogs } from './components/banner-dialogs'
import { BannerPrimaryButtons } from './components/banner-primary-buttons'
import { BannerProvider, useBanner } from './components/banner-provider'
import { BannerTable } from './components/banner-table'
import type { Banner } from './data/schema'
// import { bannerApi } from './api/banner-api'

const routeApi = getRouteApi('/_authenticated/contents/banners/')

function getSortValue(banner: Banner, field: string): string | number {
  if (field === 'exposurePeriod') return banner.startDtm
  const value = banner[field as keyof Banner]
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'number') return value
  return value ?? ''
}

function compareSortValues(
  a: string | number,
  b: string | number,
  sortOrder: string
): number {
  if (a === b) return 0
  if (a < b) return sortOrder === 'ASC' ? -1 : 1
  return sortOrder === 'ASC' ? 1 : -1
}

function BannerListContent() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()
  const { banners } = useBanner()

  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 10
  const sortField = search.sortField ?? 'displayOrder'
  const sortOrder = search.sortOrder ?? 'ASC'

  const sorted = useMemo(() => {
    return [...banners].sort((a, b) =>
      compareSortValues(
        getSortValue(a, sortField),
        getSortValue(b, sortField),
        sortOrder
      )
    )
  }, [banners, sortField, sortOrder])

  const totalCount = sorted.length
  const data = sorted.slice((page - 1) * pageSize, page * pageSize)

  // useEffect(() => {
  //   bannerApi.getBanners({ page, size: pageSize, sortField, sortOrder })
  // }, [page, pageSize, sortField, sortOrder])

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage <= 1 ? undefined : newPage,
      }),
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        pageSize: newPageSize === 10 ? undefined : newPageSize,
        page: undefined,
      }),
    })
  }

  const handleSort = (field: string, order: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        sortField: field === 'displayOrder' ? undefined : field,
        sortOrder: order === 'ASC' ? undefined : order,
        page: undefined,
      }),
    })
  }

  return (
    <>
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
            <h2 className='text-2xl font-bold tracking-tight'>전체 배너 목록</h2>
            <p className='text-muted-foreground'>
              FO 메인 히어로 배너를 등록·노출 기간·활성 상태로 관리합니다.
            </p>
          </div>
          <BannerPrimaryButtons />
        </div>

        <BannerTable
          data={data}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          sortField={sortField}
          sortOrder={sortOrder}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSort={handleSort}
        />
      </Main>

      <BannerDialogs />
    </>
  )
}

export function BannerList() {
  return (
    <BannerProvider>
      <BannerListContent />
    </BannerProvider>
  )
}
