import { useEffect, useState, useCallback, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { salaryApi, apiErrorMessage } from './api/salary-api'
import { SalaryDialogs } from './components/salary-dialogs'
import { SalaryPrimaryButtons } from './components/salary-primary-buttons'
import { SalaryProvider } from './components/salary-provider'
import { SalaryTable } from './components/salary-table'
import { type AdminSalary } from './data/schema'

const route = getRouteApi('/_authenticated/contents/salary/')

export function SalaryList() {
  const [data, setData] = useState<AdminSalary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // 첫 조회가 끝난 뒤에는 표를 언마운트하지 않는다 — 다시 마운트되면 정렬 표시(sorting state)가
  // 기본값으로 돌아가 서버 정렬과 어긋나고, 검색 입력창도 포커스를 잃는다.
  const [loaded, setLoaded] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [sortType, setSortType] = useState('latest')
  // 페이지는 URL(page)이 유일한 출처 — 로컬 state 로 따로 두면 새로고침/정렬·검색 시 표와 어긋난다.
  const page = route.useSearch().page ?? 1
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword])

  // 검색어·정렬·페이지를 연달아 바꾸면 먼저 보낸 느린 응답이 나중 응답을 덮어쓸 수 있다 —
  // 가장 마지막에 보낸 요청의 응답만 반영한다.
  const requestSeqRef = useRef(0)

  const fetchSubmissions = useCallback(async () => {
    const seq = ++requestSeqRef.current
    try {
      setIsLoading(true)
      const response = await salaryApi.getSubmissions(page, 10, debouncedKeyword, undefined, sortType)
      if (seq !== requestSeqRef.current) return

      if (response.status === 'OK' || response.output) {
        setData(response.output.submissions)
        setTotalCount(response.output.totalElements)
        setLoaded(true)
      }
    } catch (err) {
      if (seq !== requestSeqRef.current) return
      toast.error(apiErrorMessage(err, '목록 조회 실패'))
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false)
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

        {isLoading && !loaded ? (
          <div className='flex h-32 items-center justify-center'>
            데이터를 불러오는 중...
          </div>
        ) : (
          <SalaryTable
            data={data}
            totalCount={totalCount}
            keyword={keyword}
            setKeyword={setKeyword}
            setSortType={setSortType}
          />
        )}
      </Main>

      <SalaryDialogs />
    </SalaryProvider>
  )
}
