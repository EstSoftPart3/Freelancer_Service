// [Freelancer Service] 공지사항 관련
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
import { type Notice } from '../data/schema'
// import { DataTableBulkActions } from './data-table-bulk-actions'
import { noticeColumns as columns } from './notice-columns'

const route = getRouteApi('/_authenticated/contents/notice/')

// 부모로부터 받는 Props 정의 (TypeScript 에러 해결)
type DataTableProps = {
  data: Notice[]
  keyword: string
  setKeyword: (val: string) => void
  setPage: (page: number) => void
  setSortField: (field: string) => void
  setSortOrder: (order: string) => void
}

export function NoticeTable({
  data,
  keyword,
  setKeyword,
  setPage,
  setSortField,
  setSortOrder,
}: DataTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
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
    // 서버 사이드 처리를 위한 핵심 설정
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,

    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    // 정렬 클릭 시 실행
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      setSorting(nextSorting)
      if (nextSorting.length > 0) {
        setSortField(nextSorting[0].id)
        setSortOrder(nextSorting[0].desc ? 'DESC' : 'ASC')
        setPage(1)
      }
    },

    onColumnVisibilityChange: setColumnVisibility,

    // 검색어 입력 시 실행
    onGlobalFilterChange: (val) => {
      setKeyword(String(val))
      setPage(1)
    },

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // 페이징 인터페이스 유지를 위해 필요
    onPaginationChange: (updater) => {
      onPaginationChange(updater)
      const nextState =
        typeof updater === 'function' ? updater(pagination) : updater
      setPage(nextState.pageIndex + 1)
    },
  })

  // URL 상태 동기화 (기존 로직 유지)
  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div className={cn('flex flex-1 flex-col gap-4')}>
      <DataTableToolbar
        table={table}
        searchPlaceholder='제목으로 검색...'
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
      {/* <DataTableBulkActions table={table} /> */}
    </div>
  )
}
