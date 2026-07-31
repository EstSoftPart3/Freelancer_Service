import { useState, useMemo } from 'react'
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
import { type AdminVoc } from '../data/schema'
import { vocColumns as columns } from './voc-columns'

// 처리 상태 필터는 answerCnt 컬럼에 얹는다. 서버는 boolean 한 개(answered)만 받으므로
// 둘 다 고르면 결과적으로 "전체"지만, 선택 표시는 그대로 유지한다 —
// 예전에는 두 번째를 고르는 순간 선택이 통째로 풀려서 조작 실수처럼 보였다.
const ANSWERED_OPTIONS = [
  { label: '미답변', value: 'false' },
  { label: '답변완료', value: 'true' },
]

interface VocTableProps {
  data: AdminVoc[]
  totalCount: number
  page: number
  keyword: string
  /** 선택된 처리 상태 값들('true'|'false'). 둘 다 고르면 전체와 같다 */
  answeredPicks: string[]
  sortField: string
  sortOrder: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  onSort: (field: string, order: string) => void
  onFilterPicked: (picks: string[]) => void
}

export function VocTable({
  data,
  totalCount,
  page,
  keyword,
  answeredPicks,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterPicked,
}: VocTableProps) {
  const [rowSelection, setRowSelection] = useState({})

  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const columnFilters = useMemo(
    () => (answeredPicks.length ? [{ id: 'answerCnt', value: answeredPicks }] : []),
    [answeredPicks]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: keyword,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: 10 },
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setKeyword,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / 10),
    enableMultiSort: false,

    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      if (next.length > 0) onSort(next[0].id, next[0].desc ? 'DESC' : 'ASC')
      else onSort('createdAt', 'DESC')
    },

    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize: 10 })
          : updater
      setPage(next.pageIndex + 1)
    },

    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      const picked = next.find((f) => f.id === 'answerCnt')?.value as
        | string[]
        | undefined
      onFilterPicked(picked ?? [])
    },

    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='제목, 내용, 작성자 검색...'
        filters={[
          {
            columnId: 'answerCnt',
            title: '처리 상태',
            options: ANSWERED_OPTIONS,
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  등록된 문의가 없습니다.
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
