import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Edit } from 'lucide-react'
// Edit 아이콘 추가
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { noticeSchema } from '../data/schema'
import { useNotice } from './notice-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // 1. 변수명을 task에서 notice로 바꿔서 의미를 명확히 합니다.
  const notice = noticeSchema.parse(row.original)

  const { setOpen, setCurrentRow } = useNotice()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {/* 수정 메뉴 */}
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(notice)
            setOpen('update')
          }}
        >
          수정
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* 나중에 공지사항 상세보기를 모달로 띄운다면 여기에 추가하면 좋습니다. */}
        {/* <DropdownMenuItem onClick={() => setCurrentRow(notice)}>상세보기</DropdownMenuItem> */}

        <DropdownMenuSeparator />

        {/* 삭제 메뉴 */}
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => {
            setCurrentRow(notice)
            setOpen('delete')
          }}
        >
          삭제
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
