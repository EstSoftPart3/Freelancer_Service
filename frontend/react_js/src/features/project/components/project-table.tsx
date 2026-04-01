import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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
import type { ProjectPost } from '../data';
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
    const searched = data.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
        item.author.toLowerCase().includes(keyword.toLowerCase()) ||
        item.category.toLowerCase().includes(keyword.toLowerCase())
    );

    return [...searched].sort((a, b) =>
      compareValues(a, b, sortField, sortOrder)
    );
  }, [data, keyword, sortField, sortOrder]);

  return (
    <Card className='border-none shadow-none'>
      <CardContent className='space-y-4 pt-6'>
        {/* 검색 + View */}
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

        {/* 🔥 테두리 제거된 테이블 */}
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/40'>
              <tr>
                {columnVisibility.id && <th className='px-4 py-3'>ID</th>}
                {columnVisibility.title && <th className='px-4 py-3'>제목</th>}
                {columnVisibility.author && (
                  <th className='px-4 py-3'>작성자</th>
                )}
                {columnVisibility.category && (
                  <th className='px-4 py-3'>카테고리</th>
                )}
                {columnVisibility.status && <th className='px-4 py-3'>상태</th>}
                {columnVisibility.createdAt && (
                  <th className='px-4 py-3'>등록일</th>
                )}
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
