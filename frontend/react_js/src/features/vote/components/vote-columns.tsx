import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { voteCategoryLabel } from '../data/vote-category'
import { type AdminVote } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useVote } from './vote-provider'

const TitleCell = ({ row }: { row: Row<AdminVote> }) => {
  const { setOpen, setCurrentRow } = useVote()
  const vote = row.original
  const isClosed = !!vote.voteEndDt && new Date(vote.voteEndDt) < new Date()

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        className='max-w-[360px] truncate font-medium transition-colors hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(vote)
          setOpen('view')
        }}
      >
        {row.getValue('voteTtl')}
      </button>
      {vote.voteIsDeletedYn === 'Y' && (
        <Badge variant='destructive' className='shrink-0'>
          삭제됨
        </Badge>
      )}
      {vote.voteIsDeletedYn !== 'Y' && isClosed && (
        <Badge variant='secondary' className='shrink-0'>
          마감
        </Badge>
      )}
    </div>
  )
}

export const voteColumns: ColumnDef<AdminVote>[] = [
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
    accessorKey: 'voteSq',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='번호' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('voteSq')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'voteTtl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='제목' />
    ),
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    accessorKey: 'voteCategoryCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='카테고리' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>
        {voteCategoryLabel(row.getValue('voteCategoryCd'))}
      </div>
    ),
  },
  {
    accessorKey: 'userNickname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='작성자' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px] text-center'>
        {row.getValue('userNickname') ?? '-'}
      </div>
    ),
  },
  {
    accessorKey: 'optionCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='선택지' />
    ),
    cell: ({ row }) => (
      <div className='w-[50px] text-center'>{row.getValue('optionCnt')}</div>
    ),
  },
  {
    accessorKey: 'totalVoteCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='참여수' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('totalVoteCnt')}</div>
    ),
  },
  {
    accessorKey: 'voteViewCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='조회수' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('voteViewCnt')}</div>
    ),
  },
  {
    accessorKey: 'voteEndDt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='마감일시' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('voteEndDt') as string | null
      return (
        <div className='w-[130px] text-center text-muted-foreground'>
          {value ? format(new Date(value), 'yyyy-MM-dd HH:mm') : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'voteCreatedAtDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('voteCreatedAtDtm'))
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
