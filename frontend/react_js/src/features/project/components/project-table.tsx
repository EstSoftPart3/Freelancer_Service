import { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { RECRUIT_STATUS, type AdminProject } from '../data/schema'
import { projectColumns as columns } from './project-columns'

const PAGE_SIZE = 10

interface Props {
  data: AdminProject[]
  totalCount: number
  page: number
  keyword: string
  recruitStatus?: string
  includeDeleted: boolean
  sortField: string
  sortOrder: string
  setKeyword: (v: string) => void
  setPage: (p: number) => void
  onSort: (field: string, order: string) => void
  onFilterStatus: (status: string | undefined) => void
  onToggleDeleted: (v: boolean) => void
}

export function ProjectTable({
  data,
  totalCount,
  page,
  keyword,
  recruitStatus,
  includeDeleted,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterStatus,
  onToggleDeleted,
}: Props) {
  const [rowSelection, setRowSelection] = useState({})

  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const columnFilters = useMemo(
    () => (recruitStatus ? [{ id: 'recruitStatus', value: [recruitStatus] }] : []),
    [recruitStatus]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: keyword,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE },
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setKeyword,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / PAGE_SIZE),
    enableMultiSort: false,

    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater
      if (next.length > 0) onSort(next[0].id, next[0].desc ? 'DESC' : 'ASC')
      else onSort('createdAt', 'DESC')
    },

    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize: PAGE_SIZE })
          : updater
      setPage(next.pageIndex + 1)
    },

    onColumnFiltersChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      const picked = next.find((f) => f.id === 'recruitStatus')?.value as
        | string[]
        | undefined
      // 서버는 상태 하나만 받는다. 여러 개를 고르면 필터를 걸지 않는 것과 같다.
      onFilterStatus(picked && picked.length === 1 ? picked[0] : undefined)
    },

    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex-1'>
          <DataTableToolbar
            table={table}
            searchPlaceholder='프로젝트명, 소속명, 계정 검색...'
            filters={[
              {
                columnId: 'recruitStatus',
                title: '모집 상태',
                options: [
                  { label: '모집중', value: RECRUIT_STATUS.RECRUITING },
                  { label: '모집예정', value: RECRUIT_STATUS.SCHEDULED },
                  { label: '마감', value: RECRUIT_STATUS.CLOSED },
                ],
              },
            ]}
          />
        </div>
        {/* 삭제된 공고는 기본으로 감춘다 — 되살릴 대상을 찾을 때만 켠다 */}
        <div className='flex shrink-0 items-center gap-2'>
          <Switch
            id='include-deleted'
            checked={includeDeleted}
            onCheckedChange={onToggleDeleted}
          />
          <Label htmlFor='include-deleted' className='text-sm whitespace-nowrap'>
            삭제 포함
          </Label>
        </div>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
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
                  프로젝트가 없습니다.
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
