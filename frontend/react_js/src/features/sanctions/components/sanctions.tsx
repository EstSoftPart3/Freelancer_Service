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

import { sanctionsApi, type SanctionUserItem } from '../api/sanctions-api'
import { sanctionsColumns } from './sanctions-columns'
import { SanctionsTable } from './sanctions-table'

import { UsersProvider } from '@/features/users/components/users-provider'


const route = getRouteApi('/_authenticated/sanctions/')

export default function SanctionsPage() {

  return (
    <UsersProvider>
      <Sanctions /> 
    </UsersProvider>)

}

export function Sanctions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [data, setData] = useState<SanctionUserItem[]>([])
  const [keyword, setKeyword] = useState(search.keyword || '')

  const fetchSanctionedUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await sanctionsApi.getSanctionedUsers({
        page: search.page || 1,
        size: search.pageSize || 10,
        search_keyword: search.keyword || undefined,
      })

      const responseData = res?.data?.data || res?.data

      if (responseData) {
        const list = responseData.userList || responseData.data || []
        setData(Array.isArray(list) ? list : [])
        setTotalCount(responseData.totalCount || 0)
      } else {
        setData([])
        setTotalCount(0)
      }
    } catch (_) {
      toast.error('제재 유저 목록을 불러오는 데 실패했습니다.')
      setData([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchSanctionedUsers()
  }, [fetchSanctionedUsers])

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

  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) })
  }

  return (
    <div>
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
            <h2 className='text-2xl font-bold tracking-tight'>
              제재 유저 목록
            </h2>
            <p className='text-muted-foreground'>
              제재 및 정지 유저 정보를 관리합니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <SanctionsTable
            columns={sanctionsColumns}
            data={data || []}
            totalCount={totalCount}
            page={search.page || 1}
            keyword={keyword}
            setKeyword={setKeyword}
            setPage={handlePageChange}
          />
        )}
      </Main>
    </div>
  )
  
}