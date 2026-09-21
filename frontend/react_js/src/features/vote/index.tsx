import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { voteApi } from './api/vote-api'
import { VoteDialogs } from './components/vote-dialogs'
import { VotePrimaryButtons } from './components/vote-primary-buttons'
import { VoteProvider } from './components/vote-provider'
import { VoteTable } from './components/vote-table'
import { type AdminVote } from './data/schema'

export function VoteList() {
  const [data, setData] = useState<AdminVote[]>([])
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

  const fetchVotes = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await voteApi.getVotes(page, 10, debouncedKeyword, undefined, sortType)

      if (response.status === 'OK' || response.output) {
        setData(response.output.votes)
      }
    } catch (_) {
      toast.error('목록 조회 실패')
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedKeyword, sortType])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  return (
    <VoteProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>투표 관리</h2>
            <p className='text-muted-foreground'>
              커뮤니티 투표(IT/일반)를 등록·수정·삭제하는 페이지입니다.
            </p>
          </div>
          <VotePrimaryButtons />
        </div>

        {isLoading ? (
          <div className='flex h-32 items-center justify-center'>
            데이터를 불러오는 중...
          </div>
        ) : (
          <VoteTable
            data={data}
            keyword={keyword}
            setKeyword={setKeyword}
            setPage={setPage}
            setSortType={setSortType}
          />
        )}
      </Main>

      <VoteDialogs />
    </VoteProvider>
  )
}
