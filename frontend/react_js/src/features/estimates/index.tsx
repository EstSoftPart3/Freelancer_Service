// [Freelancer Service] 견적의뢰서 관리
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { EstimatesDetail } from './detail'

export function EstimatesList() {
  const [viewMode, setViewMode] = useState('list')
  const [selectedData, setSelectedData] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('2026-05')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAllChecked, setIsAllChecked] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)

  const [checkedItems, setCheckedItems] = useState({
    10: false,
    9: false,
    8: false,
  })

  const handleDetailClick = (data) => {
    setSelectedData(data)
    setViewMode('detail')
    toast.info(`${data.user_name} 상세 화면으로 연결합니다.`)
  }

  const handleAllCheck = () => {
    const nextCheckedState = !isAllChecked
    setIsAllChecked(nextCheckedState)
    setCheckedItems({
      10: nextCheckedState,
      9: nextCheckedState,
      8: nextCheckedState,
    })
  }

  const handleSingleCheck = (id) => {
    setCheckedItems((prev) => {
      const currentStatus = prev[id] || false
      const updated = { ...prev, [id]: !currentStatus }
      setIsAllChecked(Object.values(updated).every(Boolean))
      return updated
    })
  }

  const handleBatchApprove = () => {
    const selectedIds = Object.keys(checkedItems).filter(
      (key) => checkedItems[key]
    )
    if (selectedIds.length === 0) return toast.error('선택된 내역이 없습니다.')
    toast.success(`선택된 ${selectedIds.length}건이 일괄 승인되었습니다.`)
  }

  const handleBatchDeleteClick = () => {
    const selectedIds = Object.keys(checkedItems).filter(
      (key) => checkedItems[key]
    )
    if (selectedIds.length === 0) return toast.error('선택된 내역이 없습니다.')
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false)
    toast.success('선택 항목이 정상적으로 삭제 처리 되었습니다.')
  }

  const handleSearch = () => {
    setCurrentPage(1)
    if (searchTerm.trim()) {
      toast.success(
        `기업명 "${searchTerm}" 및 ${selectedMonth}월 조건으로 검색이 완료되었습니다.`
      )
    } else {
      toast.success(`${selectedMonth}월 전체 목록 조회 완료`)
    }
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    toast.info(`${pageNumber} 페이지로 이동합니다.`)
  }

  if (viewMode === 'detail' && selectedData) {
    return (
      <EstimatesDetail
        data={selectedData}
        onBackToList={() => setViewMode('list')}
      />
    )
  }

  return (
    <>
      <Header fixed></Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-4 border-b border-gray-100 pb-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              견적의뢰서 관리
            </h2>
            <p className='mt-1 text-muted-foreground'>
              견적 의뢰서 목록을 조회하고 상세 내역을 수정할 수 있습니다.
            </p>
          </div>

          {/* 검색 */}
          <div className='flex items-center justify-end space-x-2'>
            <div className='flex items-center rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'>
              <span className='px-1 text-xs font-medium whitespace-nowrap text-muted-foreground'>
                기업명:
              </span>
              <input
                type='text'
                placeholder='기업명 입력...'
                className='w-40 bg-transparent text-sm font-medium text-gray-700 outline-none placeholder:text-gray-400'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className='flex items-center space-x-1 rounded border border-gray-300 bg-white p-1 shadow-sm'>
              <span className='px-1 text-xs font-medium whitespace-nowrap text-muted-foreground'>
                조회월 선택:
              </span>
              <input
                type='month'
                className='cursor-pointer bg-transparent text-sm font-semibold text-gray-700 outline-none'
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <button
              type='button'
              className='btn btn-primary btn-sm'
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>

        {/* 체크박스 */}
        <div className='flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-muted/30 p-2'>
          <div className='pl-1 text-xs font-medium text-muted-foreground'>
            {Object.values(checkedItems).filter(Boolean).length}개 항목 선택됨
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={handleBatchApprove}
              className='rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white'
            >
              선택 승인
            </button>
            <button
              onClick={handleBatchDeleteClick}
              className='rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600'
            >
              선택 삭제
            </button>
          </div>
        </div>

        {/* 테이블 */}
        <div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
          <table className='w-full border-collapse text-center text-sm'>
            <thead className='border-b bg-muted/50 font-medium text-muted-foreground'>
              <tr>
                <th className='w-12 p-3'>
                  <div className='flex items-center justify-center'>
                    <input
                      type='checkbox'
                      checked={isAllChecked}
                      onChange={handleAllCheck}
                      className='cursor-pointer'
                    />
                  </div>
                </th>
                <th className='p-3'>순번</th>
                <th className='p-3'>신청 기업명</th>
                <th className='p-3'>프로젝트 분야</th>
                <th className='p-3'>모집형태</th>
                <th className='p-3'>예산</th>
                <th className='p-3'>의뢰일자</th>
                <th className='p-3'>상태</th>
                <th className='p-3'>상세보기</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-b hover:bg-muted/20'>
                <td className='p-3'>
                  <div className='flex items-center justify-center'>
                    <input
                      type='checkbox'
                      checked={checkedItems[10]}
                      onChange={() => handleSingleCheck(10)}
                    />
                  </div>
                </td>
                <td className='p-3 font-mono text-xs text-gray-500'>10</td>
                <td className='p-3 font-semibold text-gray-900'>
                  (주)에이아이
                </td>
                <td className='p-3'>개발</td>
                <td className='p-3 text-xs'>프로젝트 단위</td>
                <td className='p-3 text-xs font-medium text-blue-600'>
                  1,500 만원
                </td>
                <td className='p-3 font-mono text-xs text-gray-500'>
                  2026-05-28
                </td>
                <td className='p-3'>
                  <span className='rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800'>
                    승인대기
                  </span>
                </td>
                <td className='p-3'>
                  <button
                    type='button'
                    onClick={() =>
                      handleDetailClick({
                        estimate_sq: 10,
                        user_sq: 8847,
                        user_name: '(주)에이아이',
                        estimate_field: '개발 (웹 퍼블리싱 및 UI 설계 외주)',
                        estimate_hiring_type: '프로젝트단위 모집',
                        estimate_progress_status: '신규 프로젝트 개발',
                        estimate_budget: '1,500 만원',
                        estimate_start_dt: '2026-06-15',
                        estimate_end_dt: '2026-08-30',
                        estimate_ref: 'https://ai-matching-platform.co.kr',
                        estimate_admin_status: '승인대기',
                        estimate_created_dtm: '2026-05-28 14:22:01',
                        estimate_updated_dtm: '2026-05-28 14:30:15',
                      })
                    }
                    className='text-xs font-bold text-blue-600 underline'
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/*  페이징 영역 */}
          <div className='flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3.5'>
            {/* 좌측 페이징 */}
            <div className='text-xs font-medium text-muted-foreground'>
              검색 결과: <span className='font-semibold text-gray-900'>10</span>
              건<span className='mx-2 text-gray-300'>|</span>
              <span className='font-mono'>{currentPage}</span> / 10 페이지
            </div>

            {/* 우측 페이징 버튼 */}
            <div className='flex items-center space-x-1'>
              {/* 처음으로 */}
              <button
                type='button'
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                className='rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white'
              >
                &lt;&lt;
              </button>
              {/* 이전 */}
              <button
                type='button'
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className='rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white'
              >
                &lt;
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  type='button'
                  onClick={() => handlePageChange(page)}
                  className={`rounded px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* 다음 */}
              <button
                type='button'
                disabled={currentPage === 10}
                onClick={() => handlePageChange(Math.min(10, currentPage + 1))}
                className='rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white'
              >
                &gt;
              </button>
              {/* 끝으로 */}
              <button
                type='button'
                disabled={currentPage === 10}
                onClick={() => handlePageChange(10)}
                className='rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white'
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </Main>

      {/* 모달 */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-sm rounded-lg bg-white p-6 shadow-xl'>
            <h3 className='mb-2 text-lg font-bold text-gray-900 text-red-600'>
              선택 항목 삭제 경고
            </h3>
            <p className='mb-5 text-sm text-gray-600'>
              선택하신 데이터를 삭제하시겠습니까?
            </p>
            <div className='flex justify-end space-x-2'>
              <button
                type='button'
                onClick={() => setIsDeleteModalOpen(false)}
                className='rounded border px-4 py-2 text-xs font-semibold text-gray-600'
              >
                취소
              </button>
              <button
                type='button'
                onClick={handleConfirmDelete}
                className='rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white'
              >
                삭제 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
