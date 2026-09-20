import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
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
import { type SanctionUserItem } from '../api/sanctions-api'
import { sanctionsColumns } from './sanctions-columns'
import { CompanySearchDialog } from '../../users/components/company-search-dialog'

type SanctionsTableProps = {
  columns?: ColumnDef<SanctionUserItem, any>[]
  data: SanctionUserItem[]
  totalCount: number
  page: number
  typeCds?: number[]
  companySqs?: number[]
  userGenderCds?: number[]
  keyword?: string
  sortField?: string
  sortOrder?: string
  setKeyword?: (val: string) => void
  setPage: (page: number) => void
  onSort?: (field: string, order: string) => void
  onFilterType?: (types: number[]) => void
  onFilterCompany?: (companySqs: number[]) => void
  onFilterGender?: (genderCds: number[]) => void
  setTagKeyword?: (val: string) => void
}

export function SanctionsTable({
  columns = sanctionsColumns as ColumnDef<SanctionUserItem, any>[],
  data,
  totalCount,
  page,
  typeCds = [],
  companySqs = [],
  userGenderCds = [],
  keyword = '',
  sortField = 'createdAt',
  sortOrder = 'DESC',
  setKeyword,
  setPage,
  onSort,
  onFilterType,
  onFilterCompany,
  onFilterGender,
  setTagKeyword: _setTagKeyword,
}: SanctionsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [isCompanySearchOpen, setIsCompanySearchOpen] = useState(false)
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
      columnFilters: [
        ...(typeCds.length
          ? [{ id: 'userTypeCd', value: typeCds.map(String) }]
          : []),
        ...(companySqs.length
          ? [{ id: 'companyNm', value: companySqs.map(String) }]
          : []),
        ...(userGenderCds.length
          ? [{ id: 'userGenderCd', value: userGenderCds.map(String) }]
          : []),
      ],
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

      if (nextSorting.length > 0 && onSort) {
        const newField = nextSorting[0].id
        const newOrder = nextSorting[0].desc ? 'DESC' : 'ASC'

        onSort(newField, newOrder)
      } else if (onSort) {
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
      const currentFilters = [
        ...(typeCds.length
          ? [{ id: 'userTypeCd', value: typeCds.map(String) }]
          : []),
        ...(companySqs.length
          ? [{ id: 'companyNm', value: companySqs.map(String) }]
          : []),
        ...(userGenderCds.length
          ? [{ id: 'userGenderCd', value: userGenderCds.map(String) }]
          : []),
      ]
      const nextFilters =
        typeof updater === 'function' ? updater(currentFilters) : updater

      const typeFilterValue =
        (
          nextFilters.find((f) => f.id === 'userTypeCd')?.value as string[]
        )?.map(Number) || []
      if (onFilterType && JSON.stringify(typeCds) !== JSON.stringify(typeFilterValue)) {
        onFilterType(typeFilterValue)
      }

      const companyFilterValue =
        (nextFilters.find((f) => f.id === 'companyNm')?.value as string[])?.map(
          Number
        ) || []
      if (onFilterCompany && JSON.stringify(companySqs) !== JSON.stringify(companyFilterValue)) {
        onFilterCompany(companyFilterValue)
      }

      const genderFilterValue =
        (
          nextFilters.find((f) => f.id === 'userGenderCd')?.value as string[]
        )?.map(Number) || []
      if (onFilterGender && JSON.stringify(userGenderCds) !== JSON.stringify(genderFilterValue)) {
        onFilterGender(genderFilterValue)
      }
    },

    getCoreRowModel: getCoreRowModel(),
  })

  const typeOptions = [
    { label: '일반 회원', value: '301' },
    { label: '기업 회원', value: '302' },
  ]

  const genderOptions = [
    { label: '남성', value: '101' },
    { label: '여성', value: '102' },
  ]

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='유저명을 입력해주세요'
        filters={[
        ]}
      />
      {onFilterCompany && (
        <CompanySearchDialog
          open={isCompanySearchOpen}
          onOpenChange={setIsCompanySearchOpen}
          onSelect={(companySq) => onFilterCompany([companySq])}
          multiple
          selectedCompanySqs={companySqs}
          onSelectMultiple={(sqs) => onFilterCompany(sqs)}
        />
      )}
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
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
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}