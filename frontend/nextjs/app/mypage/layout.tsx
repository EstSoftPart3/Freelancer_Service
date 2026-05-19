'use client'

import { useState } from 'react'
import { X, Menu } from 'lucide-react'
import MyPageSidebar from '@/components/mypage/MyPageSidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 모바일: Sheet 햄버거 */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4 mr-2" />
              마이페이지 메뉴
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pt-10">
            <MyPageSidebar />
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
