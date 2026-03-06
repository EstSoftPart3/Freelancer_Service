// [Freelancer Service]
/* eslint-disable react-refresh/only-export-components */
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type AdminReport } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { useReport } from './report-provider'

const TargetCell = ({ row }: { row: Row<AdminReport> }) => {
  const { setOpen, setCurrentRow } = useReport()

  return (
    <div className='flex flex-col gap-1'>
      <button
        type='button'
        className='max-w-[300px] truncate text-left font-medium hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('view')
        }}
      >
        {row.getValue('targetTtl')}
      </button>
      {row.original.content && (
        <span className='max-w-[280px] truncate text-[11px] text-muted-foreground'>
          {row.original.content}
        </span>
      )}
    </div>
  )
}

export const reportColumns: ColumnDef<AdminReport>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
  },
  {
    id: 'originTypeCd', // [수정] targetTypeCd 대신 원천 유형 코드를 식별자로 사용
    accessorKey: 'originTypeCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='대상 유형' />
    ),
    cell: ({ row }) => {
      const originType = row.original.originTypeCd
      const typeNm = row.original.targetTypeNm // 명칭은 쿼리에서 맵핑한 'Q&A 질문' 등 사용

      // [게시판 관리 성공 로직 이식] 배지 색상을 게시판과 통일
      const typeMap: Record<number, string> = {
        1401: 'bg-blue-500 hover:bg-blue-600', // 일반 게시글
        1402: 'bg-orange-500 hover:bg-orange-600', // Q&A 질문
        1404: 'bg-green-600 hover:bg-green-700', // 답변
        1405: 'bg-slate-500 hover:bg-slate-600', // 댓글/대댓글
      }

      return (
        <Badge
          className={`${typeMap[originType || 0] || 'bg-slate-400'} border-none text-white`}
        >
          {typeNm}
        </Badge>
      )
    },
    // 필터링 시에도 1400번대 코드를 사용할 수 있게 세팅
    filterFn: (row, id, value) => {
      return Array.isArray(value)
        ? value.includes(row.getValue(id))
        : value === row.getValue(id)
    },
  },
  {
    id: 'targetTtl',
    accessorKey: 'targetTtl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='신고 대상/내용' />
    ),
    cell: ({ row }) => <TargetCell row={row} />,
  },
  {
    id: 'reasonNm',
    accessorKey: 'reasonNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='신고 사유' />
    ),
    cell: ({ row }) => (
      <div className='w-[100px] text-sm font-semibold text-red-500 uppercase'>
        {row.getValue('reasonNm')}
      </div>
    ),
  },
  {
    id: 'reporterNm',
    accessorKey: 'reporterNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='신고자' />
    ),
    cell: ({ row }) => (
      <div className='w-[80px] text-center'>{row.getValue('reporterNm')}</div>
    ),
  },
  {
    id: 'statusCd',
    accessorKey: 'statusCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='처리 상태' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('statusCd') as number
      const statusNm = row.original.statusNm

      const statusMap: Record<
        number,
        { variant: 'default' | 'outline' | 'secondary' | 'destructive' }
      > = {
        2901: { variant: 'secondary' }, // 신고 접수
        2902: { variant: 'default' }, // 처리 완료
        2903: { variant: 'outline' }, // 신고 반려
      }

      const config = statusMap[status] || { variant: 'outline' }

      return (
        <Badge variant={config.variant} className='whitespace-nowrap'>
          {statusNm}
        </Badge>
      )
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='신고일' />
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
