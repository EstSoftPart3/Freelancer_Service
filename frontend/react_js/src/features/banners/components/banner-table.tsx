import { useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
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
import { DataTablePagination } from '@/components/data-table'
import { cn } from '@/lib/utils'
import { type Banner } from '../data/schema'
import { bannerColumns as columns } from './banner-columns'

type BannerTableProps = {
  data: Banner[]
  totalCount: number
  page: number
  pageSize: number
  sortField: string
  sortOrder: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSort: (field: string, order: string) => void
}

export function BannerTable({
  data,
  totalCount,
  page,
  pageSize,
  sortField,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSort,
}: BannerTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const sorting = useMemo<SortingState>(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  )

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
    pageCount,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater
      if (nextSorting.length > 0) {
        onSort(nextSorting[0].id, nextSorting[0].desc ? 'DESC' : 'ASC')
      } else {
        onSort('displayOrder', 'ASC')
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize })
          : updater
      if (next.pageSize !== pageSize) {
        onPageSizeChange(next.pageSize)
        onPageChange(1)
        return
      }
      onPageChange(next.pageIndex + 1)
    },
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden rounded-md border'>
        <Table className='min-w-full table-fixed'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-center align-middle',
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'text-center align-middle',
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
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
                  className='h-24 text-center text-muted-foreground'
                >
                  등록된 배너가 없습니다.
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
