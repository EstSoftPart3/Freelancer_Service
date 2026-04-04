import { useMemo, useState } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Settings2,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/data-table';
import type { Faq } from '../data/schema';
import { useFaq, type OpenType } from './faq-provider';

type SortField = 'id' | 'question' | 'category' | 'isPublic' | 'createdAt';
type SortOrder = 'asc' | 'desc';

type ColumnVisibility = {
  id: boolean;
  question: boolean;
  category: boolean;
  isPublic: boolean;
  createdAt: boolean;
};

type FaqTableProps = {
  data: Faq[];
  keyword: string;
  setKeyword: (value: string) => void;
};

function compareValues(a: Faq, b: Faq, field: SortField, order: SortOrder) {
  const multiplier = order === 'asc' ? 1 : -1;
  const va = a[field];
  const vb = b[field];

  if (typeof va === 'boolean' && typeof vb === 'boolean') {
    return (Number(va) - Number(vb)) * multiplier;
  }

  if (typeof va === 'number' && typeof vb === 'number') {
    return (va - vb) * multiplier;
  }

  return String(va).localeCompare(String(vb)) * multiplier;
}

function getFaqColumns(params: {
  columnVisibility: ColumnVisibility;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  setCurrentRow: (value: Faq | null) => void;
  setOpen: (value: OpenType) => void;
}): ColumnDef<Faq>[] {
  const {
    columnVisibility,
    setSortField,
    setSortOrder,
    setColumnVisibility,
    setCurrentRow,
    setOpen,
  } = params;

  return [
    ...(columnVisibility.id
      ? [
          {
            accessorKey: 'id',
            header: () => (
              <HeaderMenu
                label='ID'
                onAsc={() => {
                  setSortField('id');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('id');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, id: false }))
                }
              />
            ),
            cell: ({ row }) => row.original.id,
          } satisfies ColumnDef<Faq>,
        ]
      : []),

    ...(columnVisibility.question
      ? [
          {
            accessorKey: 'question',
            header: () => (
              <HeaderMenu
                label='제목'
                onAsc={() => {
                  setSortField('question');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('question');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, question: false }))
                }
              />
            ),
            cell: ({ row }) => (
              <button
                type='button'
                className='text-left text-primary hover:underline'
                onClick={() => {
                  setCurrentRow(row.original);
                  setOpen('view');
                }}
              >
                {row.original.question}
              </button>
            ),
          } satisfies ColumnDef<Faq>,
        ]
      : []),

    ...(columnVisibility.category
      ? [
          {
            accessorKey: 'category',
            header: () => (
              <HeaderMenu
                label='카테고리'
                onAsc={() => {
                  setSortField('category');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('category');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, category: false }))
                }
              />
            ),
            cell: ({ row }) => row.original.category,
          } satisfies ColumnDef<Faq>,
        ]
      : []),

    ...(columnVisibility.isPublic
      ? [
          {
            accessorKey: 'isPublic',
            header: () => (
              <HeaderMenu
                label='상태'
                onAsc={() => {
                  setSortField('isPublic');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('isPublic');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, isPublic: false }))
                }
              />
            ),
            cell: ({ row }) => (row.original.isPublic ? '표시' : '숨김'),
          } satisfies ColumnDef<Faq>,
        ]
      : []),

    ...(columnVisibility.createdAt
      ? [
          {
            accessorKey: 'createdAt',
            header: () => (
              <HeaderMenu
                label='등록일'
                onAsc={() => {
                  setSortField('createdAt');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('createdAt');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    createdAt: false,
                  }))
                }
              />
            ),
            cell: ({ row }) => row.original.createdAt,
          } satisfies ColumnDef<Faq>,
        ]
      : []),

    {
      id: 'actions',
      header: () => <div className='text-right'></div>,
      cell: ({ row }) => (
        <div className='text-right'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-32'>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original);
                  setOpen('update');
                }}
              >
                <Pencil className='mr-2 h-4 w-4' />
                수정
              </DropdownMenuItem>

              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => {
                  setCurrentRow(row.original);
                  setOpen('delete');
                }}
              >
                <Trash className='mr-2 h-4 w-4' />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}

export function FaqTable({ data, keyword, setKeyword }: FaqTableProps) {
  const { setOpen, setCurrentRow } = useFaq();

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    question: true,
    category: true,
    isPublic: true,
    createdAt: true,
  });

  const filteredData = useMemo(() => {
    const searched = data.filter((faq) =>
      faq.question.toLowerCase().includes(keyword.toLowerCase())
    );

    return [...searched].sort((a, b) =>
      compareValues(a, b, sortField, sortOrder)
    );
  }, [data, keyword, sortField, sortOrder]);

  const toggleColumn = (field: keyof ColumnVisibility, checked: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const columns = useMemo(
    () =>
      getFaqColumns({
        columnVisibility,
        setSortField,
        setSortOrder,
        setColumnVisibility,
        setCurrentRow,
        setOpen,
      }),
    [columnVisibility, setCurrentRow, setOpen]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card>
      <CardContent className='space-y-4 pt-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <input
            className='h-9 w-[210px] rounded-md border px-3 text-sm'
            placeholder='제목으로 검색...'
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              table.setPageIndex(0);
            }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='space-x-1'>
                <Settings2 className='h-4 w-4' />
                <span>View</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-40'>
              <div className='px-2 py-1.5 text-sm font-medium'>열 토글</div>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.id}
                onCheckedChange={(checked) => toggleColumn('id', !!checked)}
              >
                번호
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.question}
                onCheckedChange={(checked) =>
                  toggleColumn('question', !!checked)
                }
              >
                제목
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.category}
                onCheckedChange={(checked) =>
                  toggleColumn('category', !!checked)
                }
              >
                카테고리
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.isPublic}
                onCheckedChange={(checked) =>
                  toggleColumn('isPublic', !!checked)
                }
              >
                표시 여부
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.createdAt}
                onCheckedChange={(checked) =>
                  toggleColumn('createdAt', !!checked)
                }
              >
                등록일
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader className='bg-muted/40'>
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
                    className='h-24 text-center text-muted-foreground'
                  >
                    등록된 FAQ가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination table={table} />
      </CardContent>
    </Card>
  );
}

type HeaderMenuProps = {
  label: string;
  onAsc: () => void;
  onDesc: () => void;
  onHide: () => void;
};

function HeaderMenu({ label, onAsc, onDesc, onHide }: HeaderMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='h-8 px-2 text-sm font-semibold hover:bg-muted'
        >
          <span>{label}</span>
          <span className='ml-1 flex flex-col leading-none'>
            <ChevronUp className='h-3 w-3 text-muted-foreground/60' />
            <ChevronDown className='-mt-1 h-3 w-3 text-muted-foreground/60' />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='w-28'>
        <DropdownMenuItem onClick={onAsc}>
          <ArrowUp className='mr-2 h-4 w-4' />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDesc}>
          <ArrowDown className='mr-2 h-4 w-4' />
          Desc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onHide}>
          <EyeOff className='mr-2 h-4 w-4' />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
