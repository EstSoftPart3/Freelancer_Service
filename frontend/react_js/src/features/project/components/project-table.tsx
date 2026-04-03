import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortOrder('asc');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className='ml-1 h-4 w-4' />;
    }

    return sortOrder === 'asc' ? (
      <ArrowUp className='ml-1 h-4 w-4' />
    ) : (
      <ArrowDown className='ml-1 h-4 w-4' />
    );
  };

  const sortableHeaderClass =
    'px-4 py-3 text-left font-medium whitespace-nowrap';
  const sortableButtonClass =
    'inline-flex items-center text-sm font-medium text-foreground hover:text-primary';

  return (
    <Card className='border-none shadow-none'>
      <CardContent className='space-y-4 pt-6'>
        <div className='flex justify-end'>
          <ProjectPrimaryButtons />
        </div>

        {/* 2줄: 검색/보기 */}
        <div className='flex items-center justify-between'>
          <input
            className='h-9 w-[240px] rounded-md border px-3 text-sm'
            placeholder='제목/작성자/카테고리 검색...'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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

        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/40'>
              <tr>
                {columnVisibility.id && (
                  <th className={sortableHeaderClass}>
                    <button
                      type='button'
                      className={sortableButtonClass}
                      onClick={() => handleSort('id')}
                    >
                      ID
                      {renderSortIcon('id')}
                    </button>
                  </th>
                )}

                {columnVisibility.title && (
                  <th className={sortableHeaderClass}>
                    <button
                      type='button'
                      className={sortableButtonClass}
                      onClick={() => handleSort('title')}
                    >
                      제목
                      {renderSortIcon('title')}
                    </button>
                  </th>
                )}

                {columnVisibility.author && (
                  <th className={sortableHeaderClass}>
                    <button
                      type='button'
                      className={sortableButtonClass}
                      onClick={() => handleSort('author')}
                    >
                      작성자
                      {renderSortIcon('author')}
                    </button>
                  </th>
                )}

                {columnVisibility.category && (
                  <th className={sortableHeaderClass}>
                    <button
                      type='button'
                      className={sortableButtonClass}
                      onClick={() => handleSort('category')}
                    >
                      카테고리
                      {renderSortIcon('category')}
                    </button>
                  </th>
                )}

                {columnVisibility.status && (
                  <th className={sortableHeaderClass}>
                    <button
                      type='button'
                      className={sortableButtonClass}
                      onClick={() => handleSort('status')}
                    >
                      상태
                      {renderSortIcon('status')}
                    </button>
                  </th>
                )}

                {columnVisibility.createdAt && (
                  <th className={sortableHeaderClass}>
                    <button
                      type='button'
                      className={sortableButtonClass}
                      onClick={() => handleSort('createdAt')}
                    >
                      등록일
                      {renderSortIcon('createdAt')}
                    </button>
                  </th>
                )}

                <th className='px-4 py-3 text-right'>관리</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className='border-b'>
                    {columnVisibility.id && (
                      <td className='px-4 py-3'>{item.id}</td>
                    )}

                    {columnVisibility.title && (
                      <td className='px-4 py-3'>
                        <button
                          className='text-left text-primary hover:underline'
                          onClick={() => {
                            setCurrentRow(item);
                            setOpen('view');
                          }}
                        >
                          {item.title}
                        </button>
                      </td>
                    )}

                    {columnVisibility.author && (
                      <td className='px-4 py-3'>{item.author}</td>
                    )}

                    {columnVisibility.category && (
                      <td className='px-4 py-3'>{item.category}</td>
                    )}

                    {columnVisibility.status && (
                      <td className='px-4 py-3'>{item.status}</td>
                    )}

                    {columnVisibility.createdAt && (
                      <td className='px-4 py-3'>{item.createdAt}</td>
                    )}

                    <td className='px-4 py-3 text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentRow(item);
                              setOpen('update');
                            }}
                          >
                            <Pencil className='mr-2 h-4 w-4' />
                            수정
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className='text-destructive'
                            onClick={() => {
                              setCurrentRow(item);
                              setOpen('delete');
                            }}
                          >
                            <Trash className='mr-2 h-4 w-4' />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      Object.values(columnVisibility).filter(Boolean).length + 1
                    }
                    className='px-4 py-10 text-center text-muted-foreground'
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
