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

// 처리 상태 필터는 answerCnt 컬럼에 얹는다 — 서버는 boolean 한 개(answered)만 받으므로
// 두 값을 동시에 고르면 "전체"와 같다. 그 경우 필터를 보내지 않는다.
const ANSWERED_OPTIONS = [
  { label: '미답변', value: 'false' },
  { label: '답변완료', value: 'true' },
]

interface VocTableProps {
  data: AdminVoc[]
  totalCount: number
  page: number
  keyword: string
  answered?: boolean
  sortField: string
  sortOrder: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  onSort: (field: string, order: string) => void
  onFilterAnswered: (answered: boolean | undefined) => void
}

export function VocTable({
  data,
  totalCount,
  page,
  keyword,
  answered,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterAnswered,
}: VocTableProps) {
  const [rowSelection, setRowSelection] = useState({})

  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const columnFilters = useMemo(
    () =>
      answered === undefined
        ? []
        : [{ id: 'answerCnt', value: [String(answered)] }],
    [answered]
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
      // 하나만 골랐을 때만 서버 필터가 의미를 갖는다(둘 다 = 아무것도 = 전체)
      if (!picked || picked.length !== 1) onFilterAnswered(undefined)
      else onFilterAnswered(picked[0] === 'true')
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
