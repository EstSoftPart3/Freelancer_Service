// [Freelancer Service] 견적의뢰서 관리 - 상세조회 및 수정 화면
import { useState } from 'react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export function EstimatesDetail({ data, onBackToList }) {
  const [isEditMode, setIsEditMode] = useState(false)

  const [formData, setFormData] = useState({
    ...data,
    budget_unknown:
      data.estimate_budget === '미정' ||
      data.estimate_budget === '협의 후 결정',
    period_unknown: !data.estimate_start_dt && !data.estimate_end_dt,
  })

  // 통합 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    // 체크박스 타입일 경우와 일반 입력창 타입 분기 처리
    if (type === 'checkbox') {
      setFormData((prev) => {
        const updated = { ...prev, [name]: checked }

        // '예산 잘 모르겠어요'를 체크하면 값을 '미정'으로 강제 전환
        if (name === 'budget_unknown' && checked) {
          updated.estimate_budget = '미정'
        }
        // '기간 잘 모르겠어요'를 체크하면 날짜를 null로 비움
        if (name === 'period_unknown' && checked) {
          updated.estimate_start_dt = null
          updated.estimate_end_dt = null
        }

        return updated
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? null : value,
      }))
    }
  }

  // 저장 버튼 액션
  const handleSave = () => {
    // 최종 저장 전 데이터 정돈
    const finalData = { ...formData }
    if (finalData.budget_unknown) finalData.estimate_budget = '미정(협의)'

    toast.success(
      `${finalData.user_name} 회원의 견적의뢰서가 성공적으로 수정되었습니다.`
    )
    setIsEditMode(false)

    // 최종 수정일시 강제 업데이트 반영
    const now = new Date()
    formData.estimate_updated_dtm = now.toLocaleString()
  }

  // 수정 취소 버튼
  const handleCancel = () => {
    setFormData({
      ...data,
      budget_unknown:
        data.estimate_budget === '미정' ||
        data.estimate_budget === '협의 후 결정',
      period_unknown: !data.estimate_start_dt && !data.estimate_end_dt,
    })
    setIsEditMode(false)
    toast.info('수정이 취소되었습니다.')
  }

  return (
    <>
      <Header fixed>
        <div className='flex items-center space-x-2 pl-4'>
          <span className='text-sm font-medium text-muted-foreground'>
            견적의뢰서 관리
          </span>
          <span className='text-sm font-medium text-muted-foreground'>/</span>
          <span className='text-sm font-bold text-gray-800'>
            {isEditMode ? '의뢰 정보 수정' : '의뢰 상세조회'}
          </span>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* 상단 타이틀 영역 */}
        <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-gray-900'>
              {formData.user_name} 회원{' '}
              {isEditMode ? '의뢰서 수정' : '상세 의뢰서'}
            </h2>
          </div>
          <button
            type='button'
            onClick={onBackToList}
            className='rounded border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50'
          >
            목록으로 돌아가기
          </button>
        </div>

        {/* 데이터 보드 */}
        <div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
          <div className='flex items-center justify-between border-b bg-muted/40 px-6 py-4'>
            <span className='text-xs font-bold tracking-wider text-muted-foreground uppercase'>
              견적의뢰 순번 : #{formData.estimate_sq}
            </span>

            {isEditMode ? (
              <div className='flex items-center space-x-2'>
                <span className='text-xs font-bold text-gray-500'>
                  승인상태 제어:
                </span>
                <select
                  name='estimate_admin_status'
                  value={formData.estimate_admin_status}
                  onChange={handleChange}
                  className='rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm outline-none'
                >
                  <option value='승인대기'>승인대기</option>
                  <option value='승인완료'>승인완료</option>
                  <option value='반려'>반려</option>
                </select>
              </div>
            ) : (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  formData.estimate_admin_status === '승인완료'
                    ? 'bg-blue-100 text-blue-800'
                    : formData.estimate_admin_status === '반려'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {formData.estimate_admin_status}
              </span>
            )}
          </div>

          <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2'>
            {/* 왼쪽 영역 */}
            <div className='space-y-4'>
              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  신청 회원명 (기업명)
                </span>
                <div className='cursor-not-allowed rounded-md border bg-gray-100/70 p-3 text-sm font-bold text-gray-500'>
                  {formData.user_name} (수정 불가)
                </div>
              </div>

              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  프로젝트 분야
                </span>
                {isEditMode ? (
                  <select
                    name='estimate_field'
                    value={formData.estimate_field}
                    onChange={handleChange}
                    className='w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none'
                  >
                    <option value='기획'>기획</option>
                    <option value='개발'>개발</option>
                    <option value='디자인'>디자인</option>
                  </select>
                ) : (
                  <div className='rounded-md border bg-gray-50 p-3 text-sm font-medium text-gray-800'>
                    {formData.estimate_field}
                  </div>
                )}
              </div>

              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  모집 형태
                </span>
                {isEditMode ? (
                  <select
                    name='estimate_hiring_type'
                    value={formData.estimate_hiring_type}
                    onChange={handleChange}
                    className='w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none'
                  >
                    <option value='프로젝트단위'>프로젝트단위</option>
                    <option value='기간제 상주'>기간제 상주</option>
                    <option value='시간제 상주'>시간제 상주</option>
                  </select>
                ) : (
                  <div className='rounded-md border bg-gray-50 p-3 text-sm text-gray-800'>
                    {formData.estimate_hiring_type}
                  </div>
                )}
              </div>

              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  진행 상황
                </span>
                {isEditMode ? (
                  <select
                    name='estimate_progress_status'
                    value={formData.estimate_progress_status}
                    onChange={handleChange}
                    className='w-full rounded-md border border-gray-300 bg-white p-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none'
                  >
                    <option value='신규 프로젝트'>신규 프로젝트</option>
                    <option value='유지보수'>유지보수</option>
                    <option value='고도화'>고도화</option>
                  </select>
                ) : (
                  <div className='rounded-md border bg-gray-50 p-3 text-sm text-gray-800'>
                    {formData.estimate_progress_status}
                  </div>
                )}
              </div>

              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  참고 서비스 URL
                </span>
                {isEditMode ? (
                  <input
                    type='url'
                    name='estimate_ref'
                    value={formData.estimate_ref || ''}
                    onChange={handleChange}
                    placeholder='참고 서비스 URL 입력'
                    className='w-full rounded-md border border-gray-300 bg-white p-2.5 font-mono text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none'
                  />
                ) : (
                  <div className='truncate rounded-md border bg-gray-50 p-3 font-mono text-sm text-blue-600'>
                    {formData.estimate_ref ? (
                      <a
                        href={formData.estimate_ref}
                        target='_blank'
                        rel='noreferrer'
                        className='hover:underline'
                      >
                        {formData.estimate_ref}
                      </a>
                    ) : (
                      <span className='text-gray-400 italic'>
                        등록된 참고 서비스 링크가 없습니다.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽 영역  */}
            <div className='space-y-4'>
              <div>
                <div className='mb-1 flex items-center justify-between'>
                  <span className='text-xs font-semibold text-muted-foreground'>
                    예산 범위
                  </span>
                  {isEditMode && (
                    <label className='flex cursor-pointer items-center space-x-1 text-xs text-gray-600 select-none'>
                      <input
                        type='checkbox'
                        name='budget_unknown'
                        checked={formData.budget_unknown}
                        onChange={handleChange}
                        className='rounded border-gray-300 accent-blue-600'
                      />
                      <span>잘 모르겠어요 (미정)</span>
                    </label>
                  )}
                </div>
                {isEditMode ? (
                  <input
                    type='text'
                    name='estimate_budget'
                    value={
                      formData.budget_unknown
                        ? '미정(협의 필요)'
                        : formData.estimate_budget
                    }
                    onChange={handleChange}
                    disabled={formData.budget_unknown}
                    className={`w-full rounded-md border p-2.5 text-sm font-bold shadow-sm focus:outline-none ${
                      formData.budget_unknown
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : 'border-blue-200 bg-blue-50/20 text-blue-700 focus:border-blue-500'
                    }`}
                  />
                ) : (
                  <div className='rounded-md border border-blue-100 bg-blue-50/50 p-3 text-base font-bold text-blue-700'>
                    {formData.estimate_budget || '미정'}
                  </div>
                )}
              </div>

              <div>
                <div className='mb-1 flex items-center justify-between'>
                  <span className='text-xs font-semibold text-muted-foreground'>
                    예상 기간
                  </span>
                  {isEditMode && (
                    <label className='flex cursor-pointer items-center space-x-1 text-xs text-gray-600 select-none'>
                      <input
                        type='checkbox'
                        name='period_unknown'
                        checked={formData.period_unknown}
                        onChange={handleChange}
                        className='rounded border-gray-300 accent-blue-600'
                      />
                      <span>잘 모르겠어요 (미정)</span>
                    </label>
                  )}
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <span className='mb-1 block text-[10px] text-muted-foreground'>
                      시작일
                    </span>
                    {isEditMode ? (
                      <input
                        type='date'
                        name='estimate_start_dt'
                        value={
                          formData.period_unknown
                            ? ''
                            : formData.estimate_start_dt || ''
                        }
                        onChange={handleChange}
                        disabled={formData.period_unknown}
                        className={`w-full rounded-md border p-2.5 font-mono text-sm shadow-sm focus:outline-none ${
                          formData.period_unknown
                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            : 'border-gray-300 bg-white text-gray-700 focus:border-blue-500'
                        }`}
                      />
                    ) : (
                      <div className='rounded-md border bg-gray-50 p-3 font-mono text-sm text-gray-700'>
                        {formData.estimate_start_dt || '미정'}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className='mb-1 block text-[10px] text-muted-foreground'>
                      종료일
                    </span>
                    {isEditMode ? (
                      <input
                        type='date'
                        name='estimate_end_dt'
                        value={
                          formData.period_unknown
                            ? ''
                            : formData.estimate_end_dt || ''
                        }
                        onChange={handleChange}
                        disabled={formData.period_unknown}
                        className={`w-full rounded-md border p-2.5 font-mono text-sm shadow-sm focus:outline-none ${
                          formData.period_unknown
                            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                            : 'border-gray-300 bg-white text-gray-700 focus:border-blue-500'
                        }`}
                      />
                    ) : (
                      <div className='rounded-md border bg-gray-50 p-3 font-mono text-sm text-gray-700'>
                        {formData.estimate_end_dt || '미정'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  의뢰 신청일시
                </span>
                <div className='cursor-not-allowed rounded-md border bg-gray-100/70 p-3 font-mono text-xs text-gray-500'>
                  {formData.estimate_created_dtm}
                </div>
              </div>

              <div>
                <span className='mb-1 block text-xs font-semibold text-muted-foreground'>
                  최종 수정일시
                </span>
                <div className='cursor-not-allowed rounded-md border bg-gray-100/70 p-3 font-mono text-xs text-gray-500'>
                  {formData.estimate_updated_dtm}
                </div>
              </div>

              {/* 하단 제어 버튼 구조 */}
              <div className='mt-4 border-t pt-2'>
                {isEditMode ? (
                  <div className='flex space-x-2'>
                    <button
                      type='button'
                      onClick={handleCancel}
                      className='flex-1 rounded-md border border-gray-300 bg-white py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50'
                    >
                      변경 취소
                    </button>
                    <button
                      type='button'
                      onClick={handleSave}
                      className='flex-1 rounded-md bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700'
                    >
                      수정 완료 내용 저장
                    </button>
                  </div>
                ) : (
                  <div className='flex space-x-2'>
                    <button
                      type='button'
                      onClick={() => setIsEditMode(true)}
                      className='flex-1 rounded-md border border-amber-300 bg-amber-50 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100'
                    >
                      의뢰 정보 수정하기
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        toast.success('의뢰가 최종 승인되었습니다.')
                        onBackToList()
                      }}
                      className='flex-1 rounded-md bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700'
                    >
                      의뢰 승인 확정
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
