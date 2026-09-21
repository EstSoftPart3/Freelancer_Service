import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { salaryApi } from './api/salary-api'
import { SalaryDialogs } from './components/salary-dialogs'
import { SalaryPrimaryButtons } from './components/salary-primary-buttons'
import { SalaryProvider } from './components/salary-provider'
import { SalaryTable } from './components/salary-table'
import { type AdminSalary } from './data/schema'

export function SalaryList() {
  const [data, setData] = useState<AdminSalary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [sortType, setSortType] = useState('latest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
      setPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword])

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await salaryApi.getSubmissions(page, 10, debouncedKeyword, undefined, sortType)

      if (response.status === 'OK' || response.output) {
        setData(response.output.submissions)
      }
    } catch (_) {
      toast.error('목록 조회 실패')
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedKeyword, sortType])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  return (
    <SalaryProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>연봉 제출건 관리</h2>
            <p className='text-muted-foreground'>
              연봉계산기·리포트·순위표가 읽는 제출 원자료를 등록·수정·삭제하는 페이지입니다.
            </p>
          </div>
          <SalaryPrimaryButtons />
        </div>

        {isLoading ? (
          <div className='flex h-32 items-center justify-center'>
            데이터를 불러오는 중...
          </div>
        ) : (
          <SalaryTable
            data={data}
            keyword={keyword}
            setKeyword={setKeyword}
            setPage={setPage}
            setSortType={setSortType}
          />
        )}
      </Main>

      <SalaryDialogs />
    </SalaryProvider>
  )
}
