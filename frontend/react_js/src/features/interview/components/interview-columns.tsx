import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { resultLabel } from '../data/constants'
import { type AdminInterview } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useInterview } from './interview-provider'

const CompanyCell = ({ row }: { row: Row<AdminInterview> }) => {
  const { setOpen, setCurrentRow } = useInterview()
  const review = row.original

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        className='max-w-[240px] truncate font-medium transition-colors hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(review)
          setOpen('view')
        }}
      >
        {row.getValue('companyNm')}
      </button>
      {review.interviewIsDeletedYn === 'Y' && (
        <Badge variant='destructive' className='shrink-0'>
          삭제됨
        </Badge>
      )}
    </div>
  )
}

export const interviewColumns: ColumnDef<AdminInterview>[] = [
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
    accessorKey: 'interviewReviewSq',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='번호' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('interviewReviewSq')}</div>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'companyNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='회사명' />
    ),
    cell: ({ row }) => <CompanyCell row={row} />,
  },
  {
    accessorKey: 'jobNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='직무' />
    ),
    cell: ({ row }) => (
      <div className='w-[100px] truncate'>{row.getValue('jobNm')}</div>
    ),
  },
  {
    accessorKey: 'careerLevel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='경력' />
    ),
    cell: ({ row }) => (
      <div className='w-[70px] text-center'>{row.getValue('careerLevel')}</div>
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
    accessorKey: 'difficultyStar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='난이도' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('difficultyStar') as number | null
      return (
        <div className='flex w-[70px] items-center justify-center gap-1'>
          {value ? (
            <>
              <Star size={14} className='fill-amber-400 text-amber-400' />
              {value}
            </>
          ) : (
            '-'
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'resultCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='결과' />
    ),
    cell: ({ row }) => (
      <div className='w-[70px] text-center'>
        {resultLabel(row.getValue('resultCd'))}
      </div>
    ),
  },
  {
    accessorKey: 'interviewViewCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='조회수' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('interviewViewCnt')}</div>
    ),
  },
  {
    accessorKey: 'interviewCreatedAtDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('interviewCreatedAtDtm'))
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
