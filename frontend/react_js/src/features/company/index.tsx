// [Freelancer Service] 소속(기업) 관리
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
import { companyApi, type CompanyRow } from './api/company-api'
import { CompanyDialogs } from './components/company-dialogs'
import { CompanyProvider } from './components/company-provider'
import { CompanyTable } from './components/company-table'

const routeApi = getRouteApi('/_authenticated/management/company/')

export function CompanyList() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  const [data, setData] = useState<CompanyRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState(search.keyword || '')

  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await companyApi.getCompanies(search.keyword || undefined)
      // 이 API 는 output 이 곧 배열이다(페이징 래퍼가 없다).
      setData((res.output ?? []) as CompanyRow[])
    } catch (_) {
      toast.error('소속 목록을 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [search.keyword])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

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
    <CompanyProvider refresh={fetchCompanies}>
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
            <h2 className='text-2xl font-bold tracking-tight'>소속 관리</h2>
            <p className='text-muted-foreground'>
              등록된 소속(기업)의 정보와 사업자 인증 상태를 확인하고 수정합니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <CompanyTable
            data={data}
            page={search.page || 1}
            keyword={keyword}
            authCds={search.authCds || []}
            setKeyword={setKeyword}
            setPage={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
            onFilterAuth={(cds) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  authCds: cds.length ? cds : undefined,
                  page: 1,
                }),
              })
            }
          />
        )}
      </Main>

      <CompanyDialogs />
    </CompanyProvider>
  )
}
