import { useCallback, useEffect, useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { userApi } from './api/users-api';
import { UsersDialogs } from './components/users-dialogs';
// import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider';
import { UsersTable } from './components/users-table';
import { type AdminUser } from './data/schema';

// import { users } from './data/users'

const route = getRouteApi('/_authenticated/users/');

export function Users() {
  const search = route.useSearch();
  const navigate = route.useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [data, setData] = useState<AdminUser[]>([]);

  // // 입력 중인 검색어 상태 (내부 입력 폼용)
  const [keyword, setKeyword] = useState(search.keyword || '');

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getUsers({
        page: search.page || 1,
        size: search.pageSize || 10,
        typeCds: search.typeCds?.length ? search.typeCds : undefined,
        companyNms: search.companyNms?.length ? search.companyNms : undefined,
        userGenderCds: search.userGenderCds?.length
          ? search.userGenderCds
          : undefined,
        keyword: search.keyword || undefined,
        tagKeyword: search.tagKeyword || undefined,
        sortField: search.sortField || 'createdAt',
        sortOrder: search.sortOrder || 'DESC',
      });

      if (response.status === 'OK' && response.output) {
        setData(response.output.users);
        setTotalCount(response.output.totalElements);
      }
    } catch (_) {
      toast.error('유저 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword !== (search.keyword || '')) {
        navigate({
          search: (prev) => ({
            ...prev,
            keyword: keyword || undefined,
            page: 1,
          }),
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, navigate, search.keyword]);

  // 4. 페이지, 정렬, 필터 변경 시 호출될 핸들러 (URL 업데이트)
  const handlePageChange = (newPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: newPage }) });
  };

  const handleFilterType = (types: number[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        typeCds: types.length ? types : undefined,
        page: 1,
      }),
    });
  };

  const handleFilterCompany = (companySqs: number[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        companyNms: companySqs.length ? companySqs : undefined,
        page: 1,
      }),
    });
  };

  const handleFilterGender = (genderCds: number[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        userGenderCds: genderCds.length ? genderCds : undefined,
        page: 1,
      }),
    });
  };

  const handleSort = (field: string, order: string) => {
    navigate({
      search: (prev) => ({ ...prev, sortField: field, sortOrder: order }),
    });
  };

  return (
    <UsersProvider>
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
              전체 유저 목록
            </h2>
            <p className='text-muted-foreground'>
              전체적인 유저 정보를 관리합니다.
            </p>
          </div>
          {/* <UsersPrimaryButtons /> */}
        </div>

        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
          </div>
        ) : (
          <UsersTable
            data={data}
            totalCount={totalCount}
            page={search.page || 1}
            typeCds={search.typeCds || []}
            companyNms={search.companyNms || []}
            userGenderCds={search.userGenderCds || []}
            keyword={keyword}
            sortField={search.sortField || 'createdAt'}
            sortOrder={search.sortOrder || 'DESC'}
            setKeyword={setKeyword}
            onFilterType={handleFilterType}
            onFilterCompany={handleFilterCompany}
            onFilterGender={handleFilterGender}
            setPage={handlePageChange}
            onSort={handleSort}
            setTagKeyword={(tag) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  tagKeyword: tag || undefined,
                  page: 1,
                }),
              })
            }
          />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  );
}
