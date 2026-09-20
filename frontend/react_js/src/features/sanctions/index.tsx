import { useCallback, useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { sanctionApi } from './api/sanction-api'

const routeApi = getRouteApi('/_authenticated/sanctions')

export function SanctionList() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  const [data, setData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSanctions = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await sanctionApi.getSanctionedUsers({
        page: search.page || 1,
        size: search.pageSize || 10,
        keyword: search.keyword || undefined,
      })

      if (response.status === 'OK' && response.output) {
        setData(response.output.userList)
        setTotalCount(response.output.totalElements)
      }
    } catch (_) {
      toast.error('제재 내역을 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchSanctions()
  }, [fetchSanctions])

  return (
    <>
      <Header fixed />
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>제재 회원 관리</h2>
          <p className='text-muted-foreground'>
            제재된 회원 목록을 조회하고 관리합니다.
          </p>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <div>
            {/* 여기에 제재 목록 테이블 컴포넌트 연결 */}
          </div>
        )}
      </Main>
    </>
  )
}