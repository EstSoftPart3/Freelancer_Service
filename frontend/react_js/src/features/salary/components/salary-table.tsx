import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type AdminSalary } from '../data/schema'
import { salaryColumns as columns } from './salary-columns'

const route = getRouteApi('/_authenticated/contents/salary/')

type DataTableProps = {
  data: AdminSalary[]
  totalCount: number
  keyword: string
  setKeyword: (val: string) => void
  setSortType: (sortType: string) => void
}

export function SalaryTable({
  data,
  totalCount,
  keyword,
  setKeyword,
  setSortType,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAtDtm', desc: true },
  ])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { pagination, onPaginationChange, ensurePageInRange } =
    useTableUrlState({
      search: route.useSearch(),
      navigate: route.useNavigate(),
      pagination: { defaultPage: 1, defaultPageSize: 10 },
    })

  // 정렬·검색이 바뀌면 URL 의 page 도 1 로 되돌린다(표시 페이지와 조회 페이지가 어긋나지 않게).
  const resetPage = () =>
    onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter: keyword,
      pagination,
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    // 서버 페이지네이션 — 전체 건수를 안 주면 pageCount 가 현재 페이지 행수(<=10)라 2페이지로 못 간다.
    pageCount: Math.ceil(totalCount / 10),

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    // 백엔드는 latest/oldest/salary_desc/salary_asc 네 가지 정렬만 지원한다.
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      setSorting(nextSorting)
      const sort = nextSorting[0]
      if (!sort) return
      if (sort.id === 'annualSalary')
        setSortType(sort.desc ? 'salary_desc' : 'salary_asc')
      else if (sort.id === 'createdAtDtm' && !sort.desc) setSortType('oldest')
      else setSortType('latest')
      resetPage()
    },

    onColumnVisibilityChange: setColumnVisibility,

    onGlobalFilterChange: (val) => {
      setKeyword(String(val))
      resetPage()
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='직무·회사명·작성자로 검색...'
        filters={[]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-xl'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
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
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
