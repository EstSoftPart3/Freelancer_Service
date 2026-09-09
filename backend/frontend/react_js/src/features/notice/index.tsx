// [Freelancer Service] 공지사항 관리 페이지
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { noticeApi } from './api/notice-api'
import { NoticeDialogs } from './components/notice-dialogs'
import { NoticePrimaryButtons } from './components/notice-primary-buttons'
import { NoticeProvider } from './components/notice-provider'
import { NoticeTable } from './components/notice-table'
import type { Notice } from './data/schema'

export function NoticeList() {
  const [data, setData] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [sortField, setSortField] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword)
      setPage(1) // 검색어가 바뀌면 1페이지로 이동
    }, 500) // 0.5초 대기

    return () => clearTimeout(timer) // 사용자가 계속 입력하면 타이머 초기화
  }, [keyword])

  const fetchNotices = useCallback(async () => {
    try {
      setIsLoading(true)
      // 실제 API 호출은 debouncedKeyword를 사용합니다.
      const response = await noticeApi.getNotices(
        page,
        10,
        debouncedKeyword,
        sortField,
        sortOrder
      )

      if (response.status === 'OK' || response.output) {
        setData(response.output.boards)
      }
    } catch (_) {
      toast.error('목록 조회 실패')
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedKeyword, sortField, sortOrder]) // 의존성 변경

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  return (
    <NoticeProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>공지사항 관리</h2>
            <p className='text-muted-foreground'>
              서비스의 주요 공지사항을 등록하고 관리하는 페이지입니다.
            </p>
          </div>
          <NoticePrimaryButtons />
        </div>

        {isLoading ? (
          <div className='flex h-32 items-center justify-center'>
            데이터를 불러오는 중...
          </div>
        ) : (
          <NoticeTable
            data={data}
            keyword={keyword}
            setKeyword={setKeyword}
            setPage={setPage}
            setSortField={setSortField}
            setSortOrder={setSortOrder}
          />
        )}
      </Main>

      <NoticeDialogs />
    </NoticeProvider>
  )
}
