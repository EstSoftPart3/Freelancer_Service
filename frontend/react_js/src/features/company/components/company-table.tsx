import { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
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
import { COMPANY_AUTH, type CompanyRow } from '../api/company-api'
import { companyColumns as columns } from './company-columns'

const PAGE_SIZE = 10

interface Props {
  data: CompanyRow[]
  page: number
  keyword: string
  authCds: number[]
  setKeyword: (v: string) => void
  setPage: (p: number) => void
  onFilterAuth: (cds: number[]) => void
}

/**
 * 소속 목록 표.
 *
 * <p>검색만 서버가 하고 <b>페이징·인증상태 필터는 화면에서</b> 처리한다 —
 * 목록 API 가 조건에 맞는 소속을 한 번에 다 주기 때문이다({@code company-api.ts} 주석 참조).
 * 그래서 다른 관리 화면과 달리 `manualPagination` 을 켜지 않는다.</p>
 */
export function CompanyTable({
  data,
  page,
  keyword,
  authCds,
  setKeyword,
  setPage,
  onFilterAuth,
}: Props) {
  const [rowSelection, setRowSelection] = useState({})
  // 목록을 통째로 받아 화면에서 자르므로 정렬도 테이블이 직접 한다(서버 정렬 파라미터가 없다).
  // 예전에는 sorting 상태를 주지 않아 헤더를 눌러도 아무 일이 없었다.
  const [sorting, setSorting] = useState<SortingState>([])

  // 인증상태 필터는 클라이언트에서 건다(서버 파라미터가 없다).
  const filtered = useMemo(
    () =>
      authCds.length === 0
        ? data
        : data.filter((c) =>
            authCds.includes(c.companyAuthStatusCd ?? COMPANY_AUTH.PENDING)
          ),
    [data, authCds]
  )

  const columnFilters = useMemo(
    () =>
      authCds.length
        ? [{ id: 'companyAuthStatusCd', value: authCds.map(String) }]
        : [],
    [authCds]
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: {
      sorting,
      globalFilter: keyword,
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE },
      columnFilters,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setKeyword,
    // 목록을 통째로 받으므로 페이징은 테이블이 직접 계산한다.
    manualFiltering: true,
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
      const picked = next.find((f) => f.id === 'companyAuthStatusCd')?.value as
        | string[]
        | undefined
      onFilterAuth(picked ? picked.map(Number) : [])
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='소속명, 대표자, 사업자번호 검색...'
        filters={[
          {
            columnId: 'companyAuthStatusCd',
            title: '사업자 인증',
            options: [
              { label: '인증완료', value: String(COMPANY_AUTH.VERIFIED) },
              { label: '미인증', value: String(COMPANY_AUTH.PENDING) },
            ],
          },
        ]}
      />
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
                  등록된 소속이 없습니다.
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
