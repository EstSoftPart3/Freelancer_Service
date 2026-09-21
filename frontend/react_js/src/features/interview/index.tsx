import { useEffect, useState, useCallback, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { interviewApi } from './api/interview-api'
import { InterviewDialogs } from './components/interview-dialogs'
import { InterviewPrimaryButtons } from './components/interview-primary-buttons'
import { InterviewProvider } from './components/interview-provider'
import { InterviewTable } from './components/interview-table'
import { type AdminInterview } from './data/schema'

const route = getRouteApi('/_authenticated/contents/interview/')

export function InterviewList() {
  const [data, setData] = useState<AdminInterview[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  const fetchReviews = useCallback(async () => {
    const seq = ++requestSeqRef.current
    try {
      setIsLoading(true)
      const response = await interviewApi.getReviews(page, 10, debouncedKeyword, sortType)
      if (seq !== requestSeqRef.current) return

      if (response.status === 'OK' || response.output) {
        setData(response.output.reviews)
        setTotalCount(response.output.totalElements)
      }
    } catch (_) {
      if (seq !== requestSeqRef.current) return
      toast.error('목록 조회 실패')
    } finally {
      if (seq === requestSeqRef.current) setIsLoading(false)
    }
  }, [page, debouncedKeyword, sortType])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return (
    <InterviewProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>면접후기 관리</h2>
            <p className='text-muted-foreground'>
              면접후기 게시물을 등록·수정·삭제하는 페이지입니다.
            </p>
          </div>
          <InterviewPrimaryButtons />
        </div>

        {isLoading ? (
          <div className='flex h-32 items-center justify-center'>
            데이터를 불러오는 중...
          </div>
        ) : (
          <InterviewTable
            data={data}
            totalCount={totalCount}
            keyword={keyword}
            setKeyword={setKeyword}
            setSortType={setSortType}
          />
        )}
      </Main>

      <InterviewDialogs />
    </InterviewProvider>
  )
}
