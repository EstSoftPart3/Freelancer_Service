import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'

export const Route = createFileRoute('/_authenticated/freelancers/')({
  component: FreelancerListPage,
})

// 백엔드 응답 타입 정의
interface ProposalResponse {
  interviewSq: number
  companySq: number
  companyNm: string
  userNm: string
  interviewStatus: string  // A, R, W
  userSq: number
  interviewCreatedAt: string
  interviewModifiedAt: string
  interviewRequestTxt: string
}

function FreelancerListPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ProposalResponse | null>(null)
  const [proposals, setProposals] = useState<ProposalResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // API 호출
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await api.$get<{ status: string; message: string; output: ProposalResponse[] }>(
          '/admin/freelancers/proposals'
        )
        setProposals(response.output)
      } catch (error) {
        console.error('제안 목록 조회 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProposals()
  }, [])

  // 상태 코드를 텍스트로 변환
  const getStatusText = (status: string) => {
    switch (status) {
      case 'A': return '성사'
      case 'R': return '거절'
      case 'W': return '요청'
      default: return '알 수 없음'
    }
  }

  // 상태에 따른 Badge 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A': return 'bg-green-500 text-white hover:bg-green-600'
      case 'R': return 'bg-red-500 text-white hover:bg-red-600'
      case 'W': return 'bg-blue-500 text-white hover:bg-blue-600'
      default: return ''
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return dateStr
  }

  if (isLoading) {
    return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>프리랜서 제안 상황</h1>
        <p className='text-muted-foreground'>업체가 직접 인터뷰 요청하는 프리랜서 게시판 관리자 페이지</p>
      </div>

      <div className='rounded-md border bg-white'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50'>
              <TableHead className="w-[80px]">No.</TableHead>
              <TableHead>요청회사</TableHead>
              <TableHead>진행단계</TableHead>
              <TableHead>대상 프리랜서</TableHead>
              <TableHead>요청일</TableHead>
              <TableHead>완료일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.length > 0 ? (
              proposals.map((item) => (
                <TableRow 
                  key={item.interviewSq} 
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => {
                    setSelectedItem(item)
                    setIsOpen(true)
                  }}
                >
                  <TableCell>{item.interviewSq}</TableCell>
                  <TableCell className="font-medium">{item.companyNm}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.interviewStatus)}>
                      {getStatusText(item.interviewStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.userNm}</TableCell>
                  <TableCell>{formatDate(item.interviewCreatedAt)}</TableCell>
                  <TableCell>{formatDate(item.interviewModifiedAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                  제안 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerContent className="h-full w-full sm:w-[500px] ml-auto rounded-none">
          <div className="p-6 h-full flex flex-col">
            <DrawerHeader className="px-0 border-b pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <DrawerTitle className="text-2xl font-bold">매칭 상세 정보</DrawerTitle>
                  <DrawerDescription className="mt-1">
                    No. {selectedItem?.interviewSq} | {selectedItem?.companyNm} → {selectedItem?.userNm}
                  </DrawerDescription>
                </div>
                <Badge className={selectedItem && getStatusColor(selectedItem.interviewStatus)}>
                  {selectedItem && getStatusText(selectedItem.interviewStatus)}
                </Badge>
              </div>
            </DrawerHeader>

            {selectedItem && (
              <div className="flex-1 overflow-y-auto py-6 space-y-8">
                {/* 섹션 1: 기업 제안 내용 */}
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">기업측 인터뷰 요청</h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 italic text-slate-700">
                    "{selectedItem.interviewRequestTxt}"
                  </div>
                </section>

                <Separator />

                {/* 섹션 2: 프리랜서 핵심 정보 */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">인터뷰 정보</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">대상 프리랜서</p>
                      <p className="font-medium text-slate-900">{selectedItem.userNm}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">요청 회사</p>
                      <p className="font-medium text-slate-900">{selectedItem.companyNm}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">상태</p>
                      <p className="font-medium text-slate-900">{getStatusText(selectedItem.interviewStatus)}</p>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* 섹션 3: 히스토리 타임라인 */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">진행 이력</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1 bg-blue-500 rounded-full h-auto"></div>
                      <div>
                        <p className="text-sm font-bold">인터뷰 요청 발생</p>
                        <p className="text-xs text-slate-500">{formatDate(selectedItem.interviewCreatedAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className={`w-1 rounded-full h-auto ${selectedItem.interviewStatus === 'A' ? 'bg-green-500' : selectedItem.interviewStatus === 'R' ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                      <div>
                        <p className={`text-sm ${selectedItem.interviewStatus === 'A' || selectedItem.interviewStatus === 'R' ? 'font-bold' : 'text-slate-400'}`}>
                          {selectedItem.interviewStatus === 'A' ? '최종 성사 완료' : selectedItem.interviewStatus === 'R' ? '거절됨' : '대기 중'}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(selectedItem.interviewModifiedAt)}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            <DrawerFooter className="px-0 pt-6 border-t">
              <div className="flex gap-3">
                {/* <Button className="flex-1 bg-slate-900">상태 강제 수정</Button> */}
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">닫기</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}