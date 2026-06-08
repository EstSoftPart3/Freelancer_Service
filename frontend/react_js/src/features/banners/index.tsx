// [Freelancer Service] 배너 관리 페이지
import { useEffect } from 'react'
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

const routeApi = getRouteApi('/_authenticated/contents/banners/')

function BannerListContent() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()
  const { banners, totalElements, isLoading, fetchBanners } = useBanner()

  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 10
  const sortField = search.sortField ?? 'displayOrder'
  const sortOrder = search.sortOrder ?? 'ASC'

  useEffect(() => {
    fetchBanners({
      page,
      size: pageSize,
      sortField,
      sortOrder,
    })
  }, [page, pageSize, sortField, sortOrder, fetchBanners])

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
          data={isLoading ? [] : banners}
          totalCount={totalElements}
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
