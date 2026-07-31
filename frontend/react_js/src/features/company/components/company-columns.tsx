/* eslint-disable react-refresh/only-export-components */
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'
import { COMPANY_AUTH, type CompanyRow } from '../api/company-api'
import { useCompany } from './company-provider'

/** 사업자번호 표시용 하이픈 — DB에는 숫자만 들어 있다 */
function formatBizNum(raw?: string) {
  if (!raw) return '-'
  const d = raw.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}` : raw
}

const NameCell = ({ row }: { row: Row<CompanyRow> }) => {
  const { setOpen, setCurrentRow } = useCompany()

  return (
    <button
      type='button'
      className='max-w-[260px] truncate text-left font-medium hover:text-blue-600 hover:underline'
      onClick={() => {
        setCurrentRow(row.original)
        setOpen('edit')
      }}
    >
      {row.original.companyNm}
    </button>
  )
}

const ActionCell = ({ row }: { row: Row<CompanyRow> }) => {
  const { setOpen, setCurrentRow } = useCompany()

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label='수정'
      onClick={() => {
        setCurrentRow(row.original)
        setOpen('edit')
      }}
    >
      <Pencil className='h-4 w-4 text-muted-foreground' />
    </Button>
  )
}

export const companyColumns: ColumnDef<CompanyRow>[] = [
  {
    id: 'companyNm',
    accessorKey: 'companyNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소속명' />
    ),
    cell: ({ row }) => <NameCell row={row} />,
  },
  {
    id: 'companyAuthStatusCd',
    accessorKey: 'companyAuthStatusCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='사업자 인증' />
    ),
    cell: ({ row }) => {
      const verified = row.original.companyAuthStatusCd === COMPANY_AUTH.VERIFIED
      return verified ? (
        <Badge className='border-none bg-green-600 text-white hover:bg-green-700'>
          인증완료
        </Badge>
      ) : (
        <Badge className='border-none bg-slate-400 text-white hover:bg-slate-500'>
          미인증
        </Badge>
      )
    },
  },
  {
    id: 'companyCeoNm',
    accessorKey: 'companyCeoNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='대표자' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>{row.original.companyCeoNm || '-'}</span>
    ),
  },
  {
    id: 'companyBizNum',
    accessorKey: 'companyBizNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='사업자번호' />
    ),
    cell: ({ row }) => (
      <span className='text-sm whitespace-nowrap'>
        {formatBizNum(row.original.companyBizNum)}
      </span>
    ),
  },
  {
    id: 'memberCnt',
    accessorKey: 'memberCnt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소속원' />
    ),
    cell: ({ row }) => {
      const cnt = row.original.memberCnt ?? 0
      return (
        <span
          className={`text-sm ${cnt === 0 ? 'text-muted-foreground' : 'font-medium'}`}
        >
          {cnt}명
        </span>
      )
    },
  },
  {
    id: 'userId',
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소속 계정' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='text-sm'>{row.original.userNm ?? '-'}</span>
        <span className='text-[11px] text-muted-foreground'>
          {row.original.userId ?? '-'}
        </span>
      </div>
    ),
  },
  {
    id: 'companyAddress',
    accessorKey: 'companyAddress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='주소' />
    ),
    cell: ({ row }) => (
      <span className='block max-w-[240px] truncate text-sm text-muted-foreground'>
        {row.original.companyAddress || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell row={row} />,
  },
]
