/* eslint-disable react-refresh/only-export-components */
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { RotateCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { RECRUIT_STATUS_LABEL, type AdminProject } from '../data/schema'
import { useProject } from './project-provider'

function fmtDate(v?: string | null) {
  if (!v) return '-'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '-' : format(d, 'yy-MM-dd')
}

function fmtSalary(row: AdminProject) {
  if (row.salaryNegotiableYn === 'Y') return '협의'
  if (row.projectSalary == null) return '-'
  // 단가는 만원 단위로 보는 편이 읽기 쉽다(원 단위 그대로 두면 자릿수 세게 된다)
  return `${row.projectSalary.toLocaleString()}원`
}

const TitleCell = ({ row }: { row: Row<AdminProject> }) => {
  const { setOpen, setCurrentRow } = useProject()
  const deleted = row.original.isDeletedYn === 'Y'

  return (
    <div className='flex items-center gap-2'>
      {deleted && (
        <Badge variant='outline' className='shrink-0 text-muted-foreground'>
          삭제됨
        </Badge>
      )}
      <button
        type='button'
        className={`max-w-[320px] truncate text-left font-medium hover:text-blue-600 hover:underline ${
          deleted ? 'text-muted-foreground line-through' : ''
        }`}
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('view')
        }}
      >
        {row.original.projectTtl}
      </button>
    </div>
  )
}

const ActionCell = ({ row }: { row: Row<AdminProject> }) => {
  const { setOpen, setCurrentRow } = useProject()
  const deleted = row.original.isDeletedYn === 'Y'

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={deleted ? '복구' : '삭제'}
      onClick={() => {
        setCurrentRow(row.original)
        setOpen(deleted ? 'restore' : 'delete')
      }}
    >
      {deleted ? (
        <RotateCcw className='h-4 w-4 text-muted-foreground hover:text-blue-600' />
      ) : (
        <Trash2 className='h-4 w-4 text-muted-foreground hover:text-destructive' />
      )}
    </Button>
  )
}

export const projectColumns: ColumnDef<AdminProject>[] = [
  {
    id: 'projectTtl',
    accessorKey: 'projectTtl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='프로젝트명' />
    ),
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    id: 'recruitStatus',
    accessorKey: 'recruitStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='모집 상태' />
    ),
    cell: ({ row }) => {
      const s = RECRUIT_STATUS_LABEL[row.original.recruitStatus ?? '']
      if (!s) return <span className='text-sm text-muted-foreground'>-</span>
      return (
        <Badge className={`${s.color} border-none whitespace-nowrap text-white`}>
          {s.label}
        </Badge>
      )
    },
  },
  {
    id: 'companyNm',
    accessorKey: 'companyNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소속' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='max-w-[160px] truncate text-sm'>
          {row.original.companyNm ?? '-'}
        </span>
        <span className='text-[11px] text-muted-foreground'>
          {row.original.userId ?? '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'recruitEndDt',
    accessorKey: 'recruitEndDt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='모집 기간' />
    ),
    cell: ({ row }) => (
      <span className='text-xs whitespace-nowrap text-muted-foreground'>
        {fmtDate(row.original.recruitStartDt)} ~ {fmtDate(row.original.recruitEndDt)}
      </span>
    ),
  },
  {
    id: 'projectSalary',
    accessorKey: 'projectSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='단가' />
    ),
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>{fmtSalary(row.original)}</span>
    ),
  },
  {
    id: 'applicationCnt',
    accessorKey: 'applicationCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='지원' />
    ),
    cell: ({ row }) => {
      const cnt = row.original.applicationCnt ?? 0
      return (
        <span
          className={`text-sm ${cnt === 0 ? 'text-muted-foreground' : 'font-medium'}`}
        >
          {cnt}건
        </span>
      )
    },
  },
  {
    id: 'viewCnt',
    accessorKey: 'viewCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='조회' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>{row.original.viewCnt ?? 0}</span>
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='등록일' />
    ),
    cell: ({ row }) => (
      <span className='text-xs whitespace-nowrap text-muted-foreground'>
        {fmtDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]
