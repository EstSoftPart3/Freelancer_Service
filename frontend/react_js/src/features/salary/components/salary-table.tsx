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
  keyword: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  setSortType: (sortType: string) => void
}

export function SalaryTable({
  data,
  keyword,
  setKeyword,
  setPage,
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

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    // 백엔드는 latest/oldest/salary_desc 세 가지 정렬만 지원한다.
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      setSorting(nextSorting)
      const sort = nextSorting[0]
      if (!sort) return
      if (sort.id === 'annualSalary') setSortType('salary_desc')
      else if (sort.id === 'createdAtDtm' && !sort.desc) setSortType('oldest')
      else setSortType('latest')
      setPage(1)
    },

    onColumnVisibilityChange: setColumnVisibility,

    onGlobalFilterChange: (val) => {
      setKeyword(String(val))
      setPage(1)
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: (updater) => {
      onPaginationChange(updater)
      const nextState =
        typeof updater === 'function' ? updater(pagination) : updater
      setPage(nextState.pageIndex + 1)
    },
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
