// [Freelancer Service] 공지사항 관련
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Notice } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useNotice } from './notice-provider'

const TitleCell = ({ row }: { row: Row<Notice> }) => {
  const { setOpen, setCurrentRow } = useNotice()

  return (
    <div className='flex space-x-2'>
      <button
        type='button'
        className='max-w-[400px] truncate font-medium transition-colors hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('view')
        }}
      >
        {row.getValue('ttl')}
      </button>
      {row.original.commentCnt > 0 && (
        <span className='text-xs font-bold text-blue-500'>
          [{row.original.commentCnt}]
        </span>
      )}
    </div>
  )
}

export const noticeColumns: ColumnDef<Notice>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'sq', // board_sq
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='번호' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('sq')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'ttl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='제목' />
    ),
    // 2. 분리한 컴포넌트를 사용
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    accessorKey: 'userId', // 작성자 — 실명·닉네임은 바뀔 수 있어 목록에서는 아이디로 식별한다
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='작성자' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px] text-center'>{row.getValue('userId') ?? '-'}</div>
    ),
  },
  {
    accessorKey: 'viewCnt', // 조회수
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='조회수' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('viewCnt')}</div>
    ),
  },
  {
    accessorKey: 'recommendCnt', // 추천수
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='추천' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('recommendCnt')}</div>
    ),
  },
  {
    accessorKey: 'createdAt', // 등록일
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className='w-[100px] text-center text-muted-foreground'>
          {format(date, 'yyyy-MM-dd')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
