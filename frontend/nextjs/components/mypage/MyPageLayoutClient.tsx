'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import MyPageSidebar from '@/components/mypage/MyPageSidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function MyPageLayoutClient({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 모바일: Sheet 햄버거 — 메뉴 선택 시 닫힘 (Vue 오프캔버스 @navigate 동작) */}
      <div className="md:hidden mb-4">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent">
            <Menu className="h-4 w-4" />
            마이페이지 메뉴
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pt-10">
            <MyPageSidebar onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        {/* 데스크탑: 고정 사이드바 */}
        <aside className="hidden md:block w-56 shrink-0">
          <MyPageSidebar />
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
