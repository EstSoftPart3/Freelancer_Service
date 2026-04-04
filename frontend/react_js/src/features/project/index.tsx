import { useState } from 'react';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { ProjectDialogs } from './components/project-dialogs';
import { ProjectProvider } from './components/project-provider';
import { ProjectTable } from './components/project-table';
import type { ProjectPost } from './data';

const mockProjects: ProjectPost[] = [
  {
    id: 1,
    title: 'React 기반 관리자 페이지 구축 프로젝트',
    author: '네이버',
    category: '계약직',
    status: '모집중',
    createdAt: '2026-04-02',
    viewCount: undefined,
  },
  {
    id: 2,
    title: 'Spring Boot API 유지관리 프로젝트',
    author: '카카오',
    category: '프리랜서',
    status: '모집완료',
    createdAt: '2026-04-01',
    viewCount: undefined,
  },
];

export function ProjectList() {
  const [keyword, setKeyword] = useState('');

  return (
    <ProjectProvider>
      <Header fixed>
        <Search placeholder='통합검색...' />
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
              사용자용 프로젝트 게시판 및 게시글을 관리하는 페이지입니다.
            </p>
          </div>
        </div>

        <ProjectTable
          data={mockProjects}
          keyword={keyword}
          setKeyword={setKeyword}
        />
      </Main>

      <ProjectDialogs />
    </ProjectProvider>
  );
}
