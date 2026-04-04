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
import type { ProjectPost } from '../data';
import { ProjectPrimaryButtons } from './project-primary-buttons';
import { useProject } from './project-provider';

type SortField =
  | 'id'
  | 'title'
  | 'author'
  | 'category'
  | 'status'
  | 'createdAt';

type SortOrder = 'asc' | 'desc';

type ColumnVisibility = {
  id: boolean;
  title: boolean;
  author: boolean;
  category: boolean;
  status: boolean;
  createdAt: boolean;
};

type Props = {
  data: ProjectPost[];
  keyword: string;
  setKeyword: (value: string) => void;
};

function compareValues(
  a: ProjectPost,
  b: ProjectPost,
  field: SortField,
  order: SortOrder
) {
  const multiplier = order === 'asc' ? 1 : -1;

  if (field === 'id') {
    return ((a[field] as number) - (b[field] as number)) * multiplier;
  }

  return String(a[field]).localeCompare(String(b[field])) * multiplier;
}

function getProjectColumns(params: {
  columnVisibility: ColumnVisibility;
  setSortField: React.Dispatch<React.SetStateAction<SortField>>;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>;
  setCurrentRow: (value: ProjectPost | null) => void;
  setOpen: (value: 'create' | 'view' | 'update' | 'delete' | null) => void;
}): ColumnDef<ProjectPost>[] {
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
          } satisfies ColumnDef<ProjectPost>,
        ]
      : []),

    ...(columnVisibility.title
      ? [
          {
            accessorKey: 'title',
            header: () => (
              <HeaderMenu
                label='제목'
                onAsc={() => {
                  setSortField('title');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('title');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, title: false }))
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
                {row.original.title}
              </button>
            ),
          } satisfies ColumnDef<ProjectPost>,
        ]
      : []),

    ...(columnVisibility.author
      ? [
          {
            accessorKey: 'author',
            header: () => (
              <HeaderMenu
                label='작성자'
                onAsc={() => {
                  setSortField('author');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('author');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, author: false }))
                }
              />
            ),
            cell: ({ row }) => row.original.author,
          } satisfies ColumnDef<ProjectPost>,
        ]
      : []),

    ...(columnVisibility.category
      ? [
          {
            accessorKey: 'category',
            header: () => (
              <HeaderMenu
                label='근무형태'
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
          } satisfies ColumnDef<ProjectPost>,
        ]
      : []),

    ...(columnVisibility.status
      ? [
          {
            accessorKey: 'status',
            header: () => (
              <HeaderMenu
                label='상태'
                onAsc={() => {
                  setSortField('status');
                  setSortOrder('asc');
                }}
                onDesc={() => {
                  setSortField('status');
                  setSortOrder('desc');
                }}
                onHide={() =>
                  setColumnVisibility((prev) => ({ ...prev, status: false }))
                }
              />
            ),
            cell: ({ row }) => row.original.status,
          } satisfies ColumnDef<ProjectPost>,
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
          } satisfies ColumnDef<ProjectPost>,
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

            <DropdownMenuContent align='end'>
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
                className='text-destructive'
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

export function ProjectTable({ data, keyword, setKeyword }: Props) {
  const { setOpen, setCurrentRow } = useProject();

  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    id: true,
    title: true,
    author: true,
    category: true,
    status: true,
    createdAt: true,
  });

  const filteredData = useMemo(() => {
    const lowerKeyword = keyword.toLowerCase();

    const searched = data.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerKeyword) ||
        item.author.toLowerCase().includes(lowerKeyword) ||
        item.category.toLowerCase().includes(lowerKeyword)
    );

    return [...searched].sort((a, b) =>
      compareValues(a, b, sortField, sortOrder)
    );
  }, [data, keyword, sortField, sortOrder]);

  const columns = useMemo(
    () =>
      getProjectColumns({
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
    <Card className='border-none shadow-none'>
      <CardContent className='space-y-4 pt-6'>
        <div className='flex justify-end'>
          <ProjectPrimaryButtons />
        </div>

        <div className='flex items-center justify-between'>
          <input
            className='h-9 w-[240px] rounded-md border px-3 text-sm'
            placeholder='제목/작성자/카테고리 검색...'
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

            <DropdownMenuContent align='end'>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.id}
                onCheckedChange={(v) =>
                  setColumnVisibility((prev) => ({ ...prev, id: !!v }))
                }
              >
                ID
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.title}
                onCheckedChange={(v) =>
                  setColumnVisibility((prev) => ({ ...prev, title: !!v }))
                }
              >
                제목
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.author}
                onCheckedChange={(v) =>
                  setColumnVisibility((prev) => ({ ...prev, author: !!v }))
                }
              >
                작성자
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.category}
                onCheckedChange={(v) =>
                  setColumnVisibility((prev) => ({ ...prev, category: !!v }))
                }
              >
                카테고리
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.status}
                onCheckedChange={(v) =>
                  setColumnVisibility((prev) => ({ ...prev, status: !!v }))
                }
              >
                상태
              </DropdownMenuCheckboxItem>

              <DropdownMenuCheckboxItem
                checked={columnVisibility.createdAt}
                onCheckedChange={(v) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    createdAt: !!v,
                  }))
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
                  <TableRow key={row.id} className='border-b'>
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
                    className='px-4 py-10 text-center text-muted-foreground'
                  >
                    검색 결과가 없습니다.
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
