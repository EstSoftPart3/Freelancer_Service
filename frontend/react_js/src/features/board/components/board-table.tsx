// src/features/board/components/board-table.tsx
import { useState, useMemo } from 'react'
// sorting 관리를 위해 추가
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { ANSWER_TYPE_CD } from '../data/board-type'
import { type AdminBoard } from '../data/schema'
import { boardColumns as columns } from './board-columns'

// 서버 필터링이므로 테이블의 columnFilters 는 URL 상태를 그대로 비추는 파생값이다.
function buildColumnFilters(typeCds: number[], categoryCds: number[]) {
  const filters: { id: string; value: string[] }[] = []
  if (typeCds.length) filters.push({ id: 'boardTypeCd', value: typeCds.map(String) })
  if (categoryCds.length)
    filters.push({ id: 'boardCategoryCd', value: categoryCds.map(String) })
  return filters
}

interface BoardTableProps {
  data: AdminBoard[]
  totalCount: number
  page: number
  typeCds: number[]
  categoryCds: number[]
  keyword: string
  sortField: string
  sortOrder: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  onSort: (field: string, order: string) => void
  onFilterType: (types: number[]) => void
  onFilterCategory: (categories: number[]) => void
  setTagKeyword: (val: string) => void
}

export function BoardTable({
  data,
  totalCount,
  page,
  typeCds,
  categoryCds,
  keyword,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterType,
  onFilterCategory,
  setTagKeyword: _setTagKeyword,
}: BoardTableProps) {
  const [rowSelection, setRowSelection] = useState({})

  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting, // [해결] 이제 정의한 sorting을 사용합니다.
      globalFilter: keyword,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: 10,
      },
      columnFilters: buildColumnFilters(typeCds, categoryCds),
    },
    enableRowSelection: true, // 행 선택 기능 활성화
    onRowSelectionChange: setRowSelection, // [연결] 행 선택 변경 함수 연결
    onGlobalFilterChange: setKeyword, // [연결] 사용하지 않던 setKeyword 연결
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / 10),
    enableMultiSort: false,

    onSortingChange: (updater) => {
      // 현재 sorting 상태를 넘겨서 다음 정렬 상태를 계산합니다.
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater

      if (nextSorting.length > 0) {
        const newField = nextSorting[0].id
        const newOrder = nextSorting[0].desc ? 'DESC' : 'ASC'

        onSort(newField, newOrder)
      } else {
        onSort('createdAt', 'DESC')
      }
    },

    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize: 10 })
          : updater
      setPage(nextState.pageIndex + 1)
    },

    onColumnFiltersChange: (updater) => {
      const currentFilters = buildColumnFilters(typeCds, categoryCds)
      const nextFilters =
        typeof updater === 'function' ? updater(currentFilters) : updater

      // 필터는 서버(URL 파라미터)가 정본이므로, 변경된 것만 골라 올리지 않고
      // 두 축을 매번 함께 반영한다. 한쪽만 올리면 다른 축이 조용히 초기화된다.
      const typeFilter = nextFilters.find((f) => f.id === 'boardTypeCd')
      const categoryFilter = nextFilters.find((f) => f.id === 'boardCategoryCd')
      onFilterType(typeFilter ? (typeFilter.value as string[]).map(Number) : [])
      onFilterCategory(
        categoryFilter ? (categoryFilter.value as string[]).map(Number) : []
      )
    },

    getCoreRowModel: getCoreRowModel(),
  })

  const typeOptions = [
    { label: '일반 게시글', value: '1401' },
    { label: 'Q&A 질문', value: '1402' },
    { label: '답변', value: String(ANSWER_TYPE_CD) },
  ]

  // FO는 공통코드 API에서 카테고리를 받아오지만, BO 필터는 목록 화면 하나뿐이라
  // 공통코드 조회를 새로 붙이지 않고 상수로 둔다. 코드 값이 바뀌면 여기도 함께 고칠 것.
  const categoryOptions = [
    { label: '자유', value: '3201' },
    { label: '현장정보', value: '3203' },
    { label: '기능요청', value: '3204' },
    { label: '정보', value: '3205' },
  ]

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='제목, 작성자 검색...'
        // [중요] 검색 입력창의 값이 부모의 keyword와 동기화되도록 함
        // 만약 DataTableToolbar 내부에서 입력을 따로 관리한다면 그 컴포넌트 수정이 필요함
        filters={[
          {
            columnId: 'boardTypeCd',
            title: '게시글 유형',
            options: typeOptions,
          },
          {
            columnId: 'boardCategoryCd',
            title: '카테고리',
            options: categoryOptions,
          },
        ]}
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
