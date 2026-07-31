// [Freelancer Service] 프로젝트 관리
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
import { projectApi } from './api/project-api'
import { ProjectDialogs } from './components/project-dialogs'
import { ProjectProvider } from './components/project-provider'
import { ProjectTable } from './components/project-table'
import type { AdminProject } from './data/schema'

const routeApi = getRouteApi('/_authenticated/management/project/')

export function ProjectList() {
  const navigate = routeApi.useNavigate()
  const search = routeApi.useSearch()

  const [data, setData] = useState<AdminProject[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState(search.keyword || '')

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await projectApi.getProjects({
        page: search.page || 1,
        size: 10,
        keyword: search.keyword || undefined,
        recruitStatuses: search.recruitStatuses?.length ? search.recruitStatuses : undefined,
        includeDeleted: search.includeDeleted || false,
        sortField: search.sortField || 'createdAt',
        sortOrder: search.sortOrder || 'DESC',
      })
      if (res.status === 'OK' && res.output) {
        setData(res.output.projects)
        setTotalCount(res.output.totalElements)
      }
    } catch (_) {
      toast.error('프로젝트 목록을 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

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
    <ProjectProvider refresh={fetchProjects}>
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
            <h2 className='text-2xl font-bold tracking-tight'>프로젝트 관리</h2>
            <p className='text-muted-foreground'>
              등록된 프로젝트 공고를 확인하고 수정·삭제합니다. 등록은 서비스 화면에서만 가능합니다.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <ProjectTable
            data={data}
            totalCount={totalCount}
            page={search.page || 1}
            keyword={keyword}
            recruitStatuses={search.recruitStatuses || []}
            includeDeleted={search.includeDeleted || false}
            sortField={search.sortField || 'createdAt'}
            sortOrder={search.sortOrder || 'DESC'}
            setKeyword={setKeyword}
            setPage={(p) => navigate({ search: (prev) => ({ ...prev, page: p }) })}
            onSort={(field, order) =>
              navigate({
                search: (prev) => ({ ...prev, sortField: field, sortOrder: order }),
              })
            }
            onFilterStatus={(statuses) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  recruitStatuses: statuses.length ? statuses : undefined,
                  page: 1,
                }),
              })
            }
            onToggleDeleted={(v) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  includeDeleted: v || undefined,
                  page: 1,
                }),
              })
            }
          />
        )}
      </Main>

      <ProjectDialogs />
    </ProjectProvider>
  )
}
