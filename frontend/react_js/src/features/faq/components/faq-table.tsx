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
import type { Faq } from '../data/schema';
import { useFaq } from './faq-provider';

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

  const setColumnHidden = (field: SortField) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const toggleColumn = (field: keyof ColumnVisibility, checked: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const visibleColumnCount =
    Number(columnVisibility.id) +
    Number(columnVisibility.question) +
    Number(columnVisibility.category) +
    Number(columnVisibility.isPublic) +
    Number(columnVisibility.createdAt) +
    1;

  return (
    <Card>
      <CardContent className='space-y-4 pt-6'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <input
            className='h-9 w-[210px] rounded-md border px-3 text-sm'
            placeholder='제목으로 검색...'
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

        <div className='overflow-x-auto rounded-md border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/40'>
              <tr className='border-b'>
                {columnVisibility.id && (
                  <th className='px-4 py-3 text-left'>
                    <HeaderMenu
                      label='번호'
                      onAsc={() => {
                        setSortField('id');
                        setSortOrder('asc');
                      }}
                      onDesc={() => {
                        setSortField('id');
                        setSortOrder('desc');
                      }}
                      onHide={() => setColumnHidden('id')}
                    />
                  </th>
                )}

                {columnVisibility.question && (
                  <th className='px-4 py-3 text-left'>
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
                      onHide={() => setColumnHidden('question')}
                    />
                  </th>
                )}

                {columnVisibility.category && (
                  <th className='px-4 py-3 text-left'>
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
                      onHide={() => setColumnHidden('category')}
                    />
                  </th>
                )}

                {columnVisibility.isPublic && (
                  <th className='px-4 py-3 text-left'>
                    <HeaderMenu
                      label='표시 여부'
                      onAsc={() => {
                        setSortField('isPublic');
                        setSortOrder('asc');
                      }}
                      onDesc={() => {
                        setSortField('isPublic');
                        setSortOrder('desc');
                      }}
                      onHide={() => setColumnHidden('isPublic')}
                    />
                  </th>
                )}

                {columnVisibility.createdAt && (
                  <th className='px-4 py-3 text-left'>
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
                      onHide={() => setColumnHidden('createdAt')}
                    />
                  </th>
                )}

                <th className='px-4 py-3 text-left'></th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((faq) => (
                <tr key={faq.id} className='border-b'>
                  {columnVisibility.id && (
                    <td className='px-4 py-3'>{faq.id}</td>
                  )}
                  {columnVisibility.question && (
                    <td className='px-4 py-3'>{faq.question}</td>
                  )}
                  {columnVisibility.category && (
                    <td className='px-4 py-3'>{faq.category}</td>
                  )}
                  {columnVisibility.isPublic && (
                    <td className='px-4 py-3'>
                      {faq.isPublic ? '표시' : '숨김'}
                    </td>
                  )}
                  {columnVisibility.createdAt && (
                    <td className='px-4 py-3'>{faq.createdAt}</td>
                  )}

                  <td className='px-4 py-3 text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align='end' className='w-32'>
                        <DropdownMenuItem
                          onClick={() => {
                            setCurrentRow(faq);
                            setOpen('update');
                          }}
                        >
                          <Pencil className='mr-2 h-4 w-4' />
                          수정
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => {
                            setCurrentRow(faq);
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

              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={visibleColumnCount}
                    className='py-10 text-center text-sm text-muted-foreground'
                  >
                    등록된 FAQ가 없습니다.
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
          <ArrowUpDown className='h-3.5 w-3.5' />
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
