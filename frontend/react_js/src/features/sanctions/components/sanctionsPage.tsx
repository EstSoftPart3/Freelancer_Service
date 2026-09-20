import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { sanctionsApi, SanctionUserItem } from '../api/sanctions-api'
import { sanctionsColumns } from './sanctions-columns'
import { SanctionsTable } from './sanctions-table'

export function SanctionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<SanctionUserItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')

  const fetchSanctions = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await sanctionsApi.getSanctionedUsers({
        page,
        size: 10,
        search_keyword: keyword || undefined,
      })

      if (res?.data) {
        setData(res.data.userList)
        setTotalCount(res.data.totalCount)
      }
    } catch (_) {
      toast.error('제재 유저 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [page, keyword])

  useEffect(() => {
    fetchSanctions()
  }, [fetchSanctions])

  return (
    <div>
      <Header fixed />
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">제재 유저 목록</h2>
          <p className="text-muted-foreground">제재 및 정지 유저 정보를 관리합니다.</p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <SanctionsTable
            columns={sanctionsColumns}
            data={data}
            totalCount={totalCount}
            page={page}
            keyword={keyword}
            setKeyword={setKeyword}
            setPage={setPage}
          />
        )}
      </Main>
    </div>
  )
}