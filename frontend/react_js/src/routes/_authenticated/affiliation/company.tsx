import { useState, useMemo, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Plus, Pencil, Trash2,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useDaumPostcode } from '@/hooks/useDaumPostcode'

export const Route = createFileRoute('/_authenticated/affiliation/company')({
  component: AffiliationCompany,
})

function AffiliationCompany() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [ALL_DATA, setAllData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

  // 등록 모달 상태
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    companyNm: '',
    companyCeoNm: '',
    companyBizNum: '',
    companyOpenDt: '',
    companyIsRecruitingYn: 'N',
    zonecode: '',
    address: '',
    detailAddress: '',
    sigungu: '',
    latitude: '',
    longitude: '',
    areaCodeSq: '',



  })

  // 수정 모달 상태
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [selectedCompanySq, setSelectedCompanySq] = useState<number | null>(null)
  const [updateForm, setUpdateForm] = useState({
    companyNm: '',
    companyCeoNm: '',
    companyBizNum: '',
    companyOpenDt: '',
    companyIsRecruitingYn: 'N',
    companyRecruitStartDtm: '',
  })

  // 카카오 API 로드 확인
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 40
    
    const checkKakao = () => {
      if (window.kakao?.maps?.services?.Geocoder) {
        console.log('카카오 지도 API 로드 완료')
        setIsKakaoLoaded(true)
        return
      }
      
      retryCount++
      if (retryCount < maxRetries) {
        setTimeout(checkKakao, 500)
      } else {
        console.warn(' 카카오 지도 API 로드 타임아웃')
      }
    }
    
    checkKakao()
  }, [])

  // 주소검색 - 완전 자동화
  const { open: openPostcode } = useDaumPostcode({
    onComplete: (data) => {
      console.log('📍 주소 선택:', data)
      
      const address = data.userSelectedType === 'R' 
        ? (data as any).roadAddress
        : (data as any).jibunAddress
      
      const sigunguCode = data.sigunguCode || '1'
      
      // 주소 정보 채우기
      setCreateForm(prev => ({
        ...prev,
        zonecode: data.zonecode,
        address: address,
        sigungu: data.sigungu,
        areaCodeSq: sigunguCode,
      }))
      
      // 카카오 지도 API로 좌표 변환
      if (!isKakaoLoaded || !window.kakao?.maps) {
        console.warn('⚠️ 카카오 지도 API 미로드')
        alert('주소가 입력되었습니다.')
        return
      }
      
      const geocoder = new window.kakao.maps.services.Geocoder()
      
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          console.log('✅ 좌표 변환 성공:', result[0])
          
          setCreateForm(prev => ({
            ...prev,
            latitude: result[0].y,
            longitude: result[0].x,
          }))
          
          alert('주소와 좌표가 모두 자동으로 입력되었습니다!')
        } else {
          console.error('❌ 좌표 변환 실패:', status)
          alert('주소가 입력되었습니다.')
        }
      })
    }
  })

  // 회사 목록 조회
  const fetchCompanies = () => {
    setIsLoading(true)
    api.$get<{ status: string; message: string; output: any[] }>('/admin/affiliation/company')
      .then(res => setAllData(res.output))
      .catch(err => console.error('회사 목록 조회 실패:', err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  // 등록 처리
  const handleCreate = () => {
    console.log('등록 요청 데이터:', createForm)
    
    if (!createForm.companyNm) {
      alert('기업명을 입력해주세요.')
      return
    }
    if (!createForm.address) {
      alert('주소를 검색해주세요.')
      return
    }
    
    api.$post('/admin/affiliation/company', {
      companyNm: createForm.companyNm,
      companyCeoNm: createForm.companyCeoNm,
      companyBizNum: createForm.companyBizNum,
      companyOpenDt: createForm.companyOpenDt,
      companyIsRecruitingYn: createForm.companyIsRecruitingYn,
      zonecode: Number(createForm.zonecode),
      address: createForm.address,
      detailAddress: createForm.detailAddress,
      sigungu: createForm.sigungu,
      latitude: Number(createForm.latitude),
      longitude: Number(createForm.longitude),
      areaCodeSq: Number(createForm.areaCodeSq),
    })
      .then(() => {
        alert('등록되었습니다.')
        setIsCreateOpen(false)
        setCreateForm({
          companyNm: '', companyCeoNm: '', companyBizNum: '',
          companyOpenDt: '', companyIsRecruitingYn: 'N',
          zonecode: '', address: '', detailAddress: '',
          sigungu: '', latitude: '', longitude: '', areaCodeSq: '',
        })
        fetchCompanies()
      })
      .catch(err => {
        console.error('등록 실패:', err)
        alert('등록에 실패했습니다.')
      })
  }

  // 수정 모달 열기
  const handleUpdateOpen = (companySq: number) => {
    setSelectedCompanySq(companySq)
    api.$get<{ status: string; message: string; output: any }>(`/admin/affiliation/company/${companySq}`)
      .then(res => {
        const data = res.output
        setUpdateForm({
          companyNm: data.companyNm ?? '',
          companyCeoNm: data.companyCeoNm ?? '',
          companyBizNum: data.companyBizNum ?? '',
          companyOpenDt: data.companyOpenDt ?? '',
          companyIsRecruitingYn: data.companyIsRecruitingYn ?? 'N',
          companyRecruitStartDtm: data.companyRecruitStartDtm ?? '',
        })
        setIsUpdateOpen(true)
      })
      .catch(err => {
        console.error('상세 조회 실패:', err)
        alert('데이터를 불러오는데 실패했습니다.')
      })
  }

  // 수정 처리
  const handleUpdate = () => {
    if (!selectedCompanySq) return
    api.$put(`/admin/affiliation/company/${selectedCompanySq}`, updateForm)
      .then(() => {
        alert('수정되었습니다.')
        setIsUpdateOpen(false)
        fetchCompanies()
      })
      .catch(err => {
        console.error('수정 실패:', err)
        alert('수정에 실패했습니다.')
      })
  }

  // 삭제 처리
  const handleDelete = (companySq: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return
    api.$delete(`/admin/affiliation/company/${companySq}`)
      .then(() => {
        alert('삭제되었습니다.')
        fetchCompanies()
      })
      .catch(err => {
        console.error('삭제 실패:', err)
        alert('삭제에 실패했습니다.')
      })
  }

  // 검색 & 페이지네이션
  const filteredData = useMemo(() => {
    return ALL_DATA.filter((item) =>
      item.companyNm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyCeoNm?.includes(searchTerm)
    )
  }, [searchTerm, ALL_DATA])

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  if (isLoading) return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>

  return (
    <div className='p-8 space-y-6'>
      {/* 헤더 */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold tracking-tight'>전체 회사 목록</h1>
          <p className='text-muted-foreground text-sm'>등록된 기업의 모집 현황 및 통계를 관리합니다.</p>
        </div>
        <Button className='gap-2' onClick={() => setIsCreateOpen(true)}>
          <Plus className='w-4 h-4'/> 기업 등록
        </Button>
      </div>

      {/* 검색 */}
      <div className='flex items-center gap-4'>
        <div className='relative w-80'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
          <Input
            placeholder='기업명'
            className='pl-10'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className='rounded-xl border bg-white shadow-sm overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50/50 hover:bg-transparent'>
              <TableHead className='w-[80px] text-center font-semibold text-slate-600'>번호</TableHead>
              <TableHead className='font-semibold text-slate-600'>기업명</TableHead>
              <TableHead className='font-semibold text-slate-600 text-center'>대표자명</TableHead>
              <TableHead className='font-semibold text-slate-600 text-center'>모집여부</TableHead>
              <TableHead className='font-semibold text-slate-600 text-center'>조회수</TableHead>
              <TableHead className='font-semibold text-slate-600 text-right'>공고 시작일</TableHead>
              <TableHead className='font-semibold text-slate-600 text-center'>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={item.companySq} className='hover:bg-slate-50/30 transition-colors'>
                  <TableCell className='text-center text-slate-500 font-mono'>{item.companySq}</TableCell>
                  <TableCell className='font-bold text-slate-800'>{item.companyNm}</TableCell>
                  <TableCell className='text-center'>{item.companyCeoNm}</TableCell>
                  <TableCell className='text-center'>
                    <Badge
                      variant={item.companyIsRecruitingYn === 'Y' ? 'default' : 'secondary'}
                      className={item.companyIsRecruitingYn === 'Y' ? 'bg-blue-600' : 'bg-slate-100 text-slate-400 border-none'}
                    >
                      {item.companyIsRecruitingYn === 'Y' ? '모집중' : '마감'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-center font-mono text-slate-600'>{item.companyViewCnt?.toLocaleString()}</TableCell>
                  <TableCell className='text-right text-slate-500 font-mono'>
                    {/* {item.companyRecruitStartDtm} */}
                    {item.companyRecruitStartDtm 
                      ? new Date(item.companyRecruitStartDtm).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'
                    }
                    
                    </TableCell>
                  <TableCell className='text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleUpdateOpen(item.companySq)}
                      >
                        <Pencil className='w-4 h-4 text-slate-500' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(item.companySq)}
                      >
                        <Trash2 className='w-4 h-4 text-red-400' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-400">검색 결과가 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className='flex items-center justify-between px-2'>
        <div className='flex items-center gap-3'>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              setPageSize(Number(val))
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-9 w-[80px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-sm text-slate-500 font-medium'>Rows per page</span>
        </div>

        <div className='flex items-center gap-8'>
          <span className='text-sm font-medium text-slate-600'>
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='icon' onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <div className='flex items-center gap-1 mx-2'>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size='sm'
                  className={`w-8 h-8 p-0 ${currentPage === page ? 'bg-slate-900 text-white' : 'text-slate-500'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button variant='ghost' size='icon' onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages || totalPages === 0}>
              <ChevronRight className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='icon' onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>
              <ChevronsRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* 등록 모달 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='max-w-lg max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>기업 등록</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>기업명</Label>
              <Input 
                value={createForm.companyNm} 
                onChange={e => setCreateForm(f => ({ ...f, companyNm: e.target.value }))} 
                placeholder='필수'
              />
            </div>
            <div>
              <Label>대표자명</Label>
              <Input 
                value={createForm.companyCeoNm} 
                onChange={e => setCreateForm(f => ({ ...f, companyCeoNm: e.target.value }))} 
              />
            </div>
            <div>
              <Label>사업자등록번호</Label>
              <Input 
                value={createForm.companyBizNum} 
                onChange={e => setCreateForm(f => ({ ...f, companyBizNum: e.target.value }))} 
              />
            </div>
            <div>
              <Label>개업일자</Label>
              <Input 
                type='date' 
                value={createForm.companyOpenDt} 
                onChange={e => setCreateForm(f => ({ ...f, companyOpenDt: e.target.value }))} 
              />
            </div>
            <div>
              <Label>모집여부</Label>
              <Select 
                value={createForm.companyIsRecruitingYn} 
                onValueChange={val => setCreateForm(f => ({ ...f, companyIsRecruitingYn: val }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='Y'>모집중</SelectItem>
                  <SelectItem value='N'>마감</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 주소 섹션 */}
            <div className='space-y-2 pt-4 border-t'>
              <Label className='text-sm font-semibold'>주소 정보</Label>
              
              <div className='flex gap-2'>
                <Input 
                  placeholder='우편번호'
                  value={createForm.zonecode} 
                  readOnly 
                  className='flex-1 bg-slate-50'
                />
                <Button 
                  type='button'
                  variant='outline'
                  onClick={openPostcode}
                >
                  주소 검색
                </Button>
              </div>

              <Input 
                placeholder='도로명주소'
                value={createForm.address} 
                readOnly
                className='bg-slate-50'
              />

              <Input 
                placeholder='상세주소를 입력하세요'
                value={createForm.detailAddress} 
                onChange={e => setCreateForm(f => ({ ...f, detailAddress: e.target.value }))} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateOpen(false)}>취소</Button>
            <Button onClick={handleCreate}>등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 수정 모달 */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>기업 수정</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div>
              <Label>기업명</Label>
              <Input value={updateForm.companyNm} onChange={e => setUpdateForm(f => ({ ...f, companyNm: e.target.value }))} />
            </div>
            <div>
              <Label>대표자명</Label>
              <Input value={updateForm.companyCeoNm} onChange={e => setUpdateForm(f => ({ ...f, companyCeoNm: e.target.value }))} />
            </div>
            <div>
              <Label>사업자등록번호</Label>
              <Input value={updateForm.companyBizNum} onChange={e => setUpdateForm(f => ({ ...f, companyBizNum: e.target.value }))} />
            </div>
            <div>
              <Label>개업일자</Label>
              <Input type='date' value={updateForm.companyOpenDt} onChange={e => setUpdateForm(f => ({ ...f, companyOpenDt: e.target.value }))} />
            </div>
            <div>
              <Label>모집여부</Label>
              <Select value={updateForm.companyIsRecruitingYn} onValueChange={val => setUpdateForm(f => ({ ...f, companyIsRecruitingYn: val }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='Y'>모집중</SelectItem>
                  <SelectItem value='N'>마감</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>공고시작일</Label>
              <Input type='date' value={updateForm.companyRecruitStartDtm} onChange={e => setUpdateForm(f => ({ ...f, companyRecruitStartDtm: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsUpdateOpen(false)}>취소</Button>
            <Button onClick={handleUpdate}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}