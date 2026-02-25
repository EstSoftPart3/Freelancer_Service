// [Freelancer Service] 공지사항 관리 페이지
import { useEffect, useState } from 'react'
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

  const fetchNotices = async () => {
    try {
      setIsLoading(true)
      const response = await noticeApi.getNotices(1, 10) // 1페이지, 10개씩

      if (response.status === 'OK' || response.output) {
        setData(response.output.boards) // 서버에서 온 실제 데이터 저장
      }
    } catch (_) {
      toast.error('목록 조회 실패', {
        description: '서버에서 데이터를 불러오는 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotices()
  }, [])

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
          <NoticeTable data={data} />
        )}
      </Main>

      <NoticeDialogs />
    </NoticeProvider>
  )
}
