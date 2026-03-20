import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { MOCK_COMPANIES } from '../api/users-api';
// import { roles } from '../data/data'
import { type AdminUser } from '../data/schema';
import { usersColumns as columns } from './users-columns';
import { useUsers } from './users-provider';

type UserTableProps = {
  data: AdminUser[];
  totalCount: number;
  page: number;
  typeCds: number[];
  keyword: string;
  sortField: string;
  sortOrder: string;
  setKeyword: (val: string) => void;
  setPage: (page: number) => void;
  onSort: (field: string, order: string) => void;
  onFilterType: (types: number[]) => void;
  setTagKeyword: (val: string) => void;
};

export function UsersTable({
  data,
  totalCount,
  page,
  typeCds,
  keyword,
  sortField,
  sortOrder,
  setKeyword,
  setPage,
  onSort,
  onFilterType,
  setTagKeyword: _setTagKeyword,
}: UserTableProps) {
  const { setOpen, setCurrentRow } = useUsers();
  const [rowSelection, setRowSelection] = useState({});
  const sorting = useMemo(
    () => [{ id: sortField, desc: sortOrder === 'DESC' }],
    [sortField, sortOrder]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting, // [해결] 이제 정의한 sorting을 사용합니다.
      globalFilter: keyword,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: 10,
      },
      columnFilters: typeCds.length
        ? [{ id: 'userTypeCd', value: typeCds.map(String) }]
        : [],
    },
    enableRowSelection: true, // 행 선택 기능 활성화
    onRowSelectionChange: setRowSelection, // [연결] 행 선택 변경 함수 연결
    onGlobalFilterChange: setKeyword, // [연결] 사용하지 않던 setKeyword 연결
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / 10),
    enableMultiSort: false,

    onSortingChange: (updater) => {
      // 현재 sorting 상태를 넘겨서 다음 정렬 상태를 계산합니다.
      const nextSorting =
        typeof updater === 'function' ? updater(sorting) : updater;

      if (nextSorting.length > 0) {
        const newField = nextSorting[0].id;
        const newOrder = nextSorting[0].desc ? 'DESC' : 'ASC';

        onSort(newField, newOrder);
      } else {
        onSort('createdAt', 'DESC');
      }
    },

    onPaginationChange: (updater) => {
      const nextState =
        typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize: 10 })
          : updater;
      setPage(nextState.pageIndex + 1);
    },

    onColumnFiltersChange: (updater) => {
      const currentFilters = typeCds.length
        ? [{ id: 'userTypeCd', value: typeCds.map(String) }]
        : [];
      const nextFilters =
        typeof updater === 'function' ? updater(currentFilters) : updater;

      const typeFilter = nextFilters.find((f) => f.id === 'userTypeCd');
      if (typeFilter) {
        onFilterType((typeFilter.value as string[]).map(Number));
      } else {
        onFilterType([]);
      }
    },

    getCoreRowModel: getCoreRowModel(),
  });

  const typeOptions = [
    { label: '일반 회원', value: '301' },
    { label: '기업 회원', value: '302' },
  ];

  const genderOptions = [
    { label: '남성', value: '101' },
    { label: '여성', value: '102' },
  ];

  // Mock_companies 임시 데이터 (TODO: 추후 백엔드 연결 시 삭제)
  const companyOptions = MOCK_COMPANIES.map((company) => ({
    label: company.companyNm,
    value: company.companySq.toString(),
  }));

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='유저명을 입력해주세요'
        filters={[
          {
            columnId: 'userTypeCd',
            title: '유저 유형',
            options: typeOptions,
          },
          {
            columnId: 'companyNm',
            title: '소속',
            options: companyOptions,
          },
          {
            columnId: 'userGenderCd',
            title: '성별',
            options: genderOptions,
          },
        ]}
      />
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
                <TableRow
                  key={row.id}
                  className='cursor-pointer hover:bg-muted/50'
                  onClick={(e) => {
                    // 클릭된 타겟이 버튼, 링크, 체크박스 등 상호작용 요소일 경우 무시
                    const target = e.target as HTMLElement;
                    if (
                      target.closest(
                        'button, a, input, [role="checkbox"], [role="menuitem"], [data-radix-collection-item]'
                      )
                    ) {
                      return;
                    }
                    setCurrentRow(row.original);
                    setOpen('edit');
                  }}
                >
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
  );
}
