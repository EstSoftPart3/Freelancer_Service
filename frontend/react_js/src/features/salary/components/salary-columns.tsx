import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { employmentTypeLabel } from '../data/constants'
import { type AdminSalary } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useSalary } from './salary-provider'

const JobCell = ({ row }: { row: Row<AdminSalary> }) => {
  const { setOpen, setCurrentRow } = useSalary()
  const submission = row.original

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        className='max-w-[160px] truncate font-medium transition-colors hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(submission)
          setOpen('view')
        }}
      >
        {row.getValue('jobNm')}
      </button>
      {submission.isSeedYn === 'Y' && (
        <Badge variant='secondary' className='shrink-0'>
          시드
        </Badge>
      )}
      {submission.isDeletedYn === 'Y' && (
        <Badge variant='destructive' className='shrink-0'>
          삭제됨
        </Badge>
      )}
    </div>
  )
}

export const salaryColumns: ColumnDef<AdminSalary>[] = [
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
    accessorKey: 'salarySubmissionSq',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='번호' />
    ),
    cell: ({ row }) => (
      <div className='w-[60px] text-center'>{row.getValue('salarySubmissionSq')}</div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'jobNm',
    enableSorting: false, // 서버는 최신/오래된/연봉 정렬만 지원
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='직무' />
    ),
    cell: ({ row }) => <JobCell row={row} />,
  },
  {
    accessorKey: 'employmentType',
    enableSorting: false, // 서버는 최신/오래된/연봉 정렬만 지원
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='고용형태' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px] text-center'>
        {employmentTypeLabel(row.getValue('employmentType'))}
      </div>
    ),
  },
  {
    accessorKey: 'careerBucket',
    enableSorting: false, // 서버는 최신/오래된/연봉 정렬만 지원
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='연차' />
    ),
    cell: ({ row }) => (
      <div className='w-[70px] text-center'>{row.getValue('careerBucket')}</div>
    ),
  },
  {
    accessorKey: 'regionNm',
    enableSorting: false, // 서버는 최신/오래된/연봉 정렬만 지원
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='지역' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px] truncate text-center'>{row.getValue('regionNm')}</div>
    ),
  },
  {
    accessorKey: 'annualSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='연봉(만원)' />
    ),
    cell: ({ row }) => (
      <div className='w-[90px] text-right font-medium'>
        {(row.getValue('annualSalary') as number).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: 'userNickname',
    enableSorting: false, // 서버는 최신/오래된/연봉 정렬만 지원
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='작성자' />
    ),
    cell: ({ row }) => {
      const submission = row.original
      return (
        <div className='w-[80px] text-center'>
          {submission.isSeedYn === 'Y'
            ? (submission.seedNickname ?? '-')
            : (submission.userNickname ?? '탈퇴')}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAtDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => {
      const raw = row.getValue('createdAtDtm') as string | null
      return (
        <div className='w-[100px] text-center text-muted-foreground'>
          {raw ? format(new Date(raw), 'yyyy-MM-dd') : '-'}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
