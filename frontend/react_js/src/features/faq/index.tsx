import { useState } from 'react';
import { ConfigDrawer } from '@/components/config-drawer';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { FaqDialogs } from './components/faq-dialogs';
import { FaqPrimaryButtons } from './components/faq-primary-buttons';
import { FaqProvider } from './components/faq-provider';
import { FaqTable } from './components/faq-table';
import type { Faq } from './data/schema';

const mockFaqs: Faq[] = [
  {
    id: 1,
    question: '회원가입은 어떻게 되나요?',
    category: '회원',
    isPublic: true,
    createdAt: '2026-03-31',
  },
  {
    id: 2,
    question: '비밀번호를 잊어버렸어요.',
    category: '계정',
    isPublic: true,
    createdAt: '2026-04-01',
  },
];

export function FaqList() {
  const [keyword, setKeyword] = useState('');

  return (
    <FaqProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>FAQ 관리</h2>
            <p className='text-muted-foreground'>
              서비스의 FAQ를 등록하고 관리하는 페이지입니다.
            </p>
          </div>
          <FaqPrimaryButtons />
        </div>

        <FaqTable data={mockFaqs} keyword={keyword} setKeyword={setKeyword} />
      </Main>

      <FaqDialogs />
    </FaqProvider>
  );
}
