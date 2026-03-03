// src/features/report/components/report-table.tsx
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
import { type AdminReport } from '../api/report-api'
import { reportColumns as columns } from './report-columns'

interface ReportTableProps {
  data: AdminReport[]
  totalCount: number
  page: number
  statusCds: number[] // 처리 상태 필터 (2901, 2902, 2903)
  keyword: string
  sortField: string
  sortOrder: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  onSort: (field: string, order: string) => void
  onFilterStatus: (statuses: number[]) => void // 상태 필터 핸들러
}

export function ReportTable({
  data,
  totalCount,
  page,
  statusCds,
  keyword,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterStatus,
}: ReportTableProps) {
  const [rowSelection, setRowSelection] = useState({})

  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: keyword,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: 10,
      },
      columnFilters: statusCds.length
        ? [{ id: 'statusCd', value: statusCds.map(String) }]
        : [],
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setKeyword,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / 10),
    enableMultiSort: false,

    onSortingChange: (updater) => {
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
      const currentFilters = statusCds.length
        ? [{ id: 'statusCd', value: statusCds.map(String) }]
        : []
      const nextFilters =
        typeof updater === 'function' ? updater(currentFilters) : updater

      const statusFilter = nextFilters.find((f) => f.id === 'statusCd')
      if (statusFilter) {
        onFilterStatus((statusFilter.value as string[]).map(Number))
      } else {
        onFilterStatus([])
      }
    },

    getCoreRowModel: getCoreRowModel(),
  })

  // 신고 처리 상태 옵션 (공통코드 2900 계열)
  const statusOptions = [
    { label: '신고 접수', value: '2901' },
    { label: '처리 완료', value: '2902' },
    { label: '신고 반려', value: '2903' },
  ]

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='제목, 신고자, 사유 검색...'
        filters={[
          {
            columnId: 'statusCd',
            title: '처리 상태',
            options: statusOptions,
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
                  신고 내역이 없습니다.
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
