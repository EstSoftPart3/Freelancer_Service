/* eslint-disable react-refresh/only-export-components */
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Lock, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { type AdminVoc } from '../data/schema'
import { useVoc } from './voc-provider'

const TitleCell = ({ row }: { row: Row<AdminVoc> }) => {
  const { setOpen, setCurrentRow } = useVoc()

  return (
    <div className='flex items-center gap-2'>
      {row.original.secret && (
        <Lock className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
      )}
      <button
        type='button'
        className='max-w-[360px] truncate font-medium hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('view')
        }}
      >
        {row.getValue('ttl')}
      </button>
    </div>
  )
}

const ActionCell = ({ row }: { row: Row<AdminVoc> }) => {
  const { setOpen, setCurrentRow } = useVoc()

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label='삭제'
      onClick={() => {
        setCurrentRow(row.original)
        setOpen('delete')
      }}
    >
      <Trash2 className='h-4 w-4 text-muted-foreground hover:text-destructive' />
    </Button>
  )
}

export const vocColumns: ColumnDef<AdminVoc>[] = [
  {
    id: 'ttl',
    accessorKey: 'ttl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='문의 제목' />
    ),
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    id: 'answerCnt',
    accessorKey: 'answerCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='처리 상태' />
    ),
    cell: ({ row }) => {
      const cnt = row.original.answerCnt ?? 0
      return cnt > 0 ? (
        <Badge className='border-none bg-green-600 text-white hover:bg-green-700'>
          답변완료
        </Badge>
      ) : (
        <Badge className='border-none bg-amber-500 text-white hover:bg-amber-600'>
          미답변
        </Badge>
      )
    },
  },
  {
    id: 'userNickname',
    accessorKey: 'userNickname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='작성자' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-sm'>{row.original.userNickname ?? '탈퇴한 사용자'}</span>
        <span className='text-[11px] text-muted-foreground'>
          {row.original.userId ?? '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'viewCnt',
    accessorKey: 'viewCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='조회' />
    ),
    cell: ({ row }) => (
      <div className='w-12 text-center text-sm'>{row.original.viewCnt ?? 0}</div>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt')
      if (!date) return null
      return (
        <div className='text-xs whitespace-nowrap text-muted-foreground'>
          {format(new Date(date as string), 'yyyy-MM-dd HH:mm')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]
