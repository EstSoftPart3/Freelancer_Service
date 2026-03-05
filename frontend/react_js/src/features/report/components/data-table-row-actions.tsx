// [Freelancer Service] 신고 관리 행 액션
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// [수정] 신고 전용 스키마와 컨텍스트로 교체
import { adminReportSchema } from '../data/schema'
import { useReport } from './report-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // [수정] adminBoardSchema -> adminReportSchema
  const report = adminReportSchema.parse(row.original)

  // [수정] useBoard -> useReport
  const { setOpen, setCurrentRow } = useReport()

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
        {/* [수정] '수정' 대신 '상세 보기 및 처리'로 변경 */}
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(report)
            setOpen('view') // ReportViewDrawer를 엽니다.
          }}
        >
          상세 보기 / 처리
          <DropdownMenuShortcut>
            <Eye size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* [유지] 신고 기록 삭제 (필요 시) */}
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => {
            setCurrentRow(report)
            setOpen('delete') // ReportDialogs의 delete ConfirmDialog를 엽니다.
          }}
        >
          신고 기록 삭제
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
