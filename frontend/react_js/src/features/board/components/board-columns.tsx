// [Freelancer Service]
/* eslint-disable react-refresh/only-export-components */
import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { type AdminBoard } from '../data/schema'
import { useBoard } from './board-provider'
import { DataTableRowActions } from './data-table-row-actions'

const TitleCell = ({ row }: { row: Row<AdminBoard> }) => {
  const { setOpen, setCurrentRow } = useBoard()

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        className='max-w-[300px] truncate font-medium hover:text-blue-600 hover:underline'
        onClick={() => {
          setCurrentRow(row.original)
          setOpen('view')
        }}
      >
        {row.getValue('ttl')}
      </button>
      {row.original.commentCnt > 0 && (
        <span className='text-[10px] font-bold text-blue-500'>
          [{row.original.commentCnt}]
        </span>
      )}
    </div>
  )
}

export const boardColumns: ColumnDef<AdminBoard>[] = [
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
    id: 'boardTypeCd',
    accessorKey: 'boardTypeCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='유형' />
    ),
    cell: ({ row }) => {
      // [확인] 현재 JSON 데이터에 boardTypeCd가 없어서 undefined가 나옵니다.
      const type = row.original.boardTypeCd as number

      const typeMap: Record<number, { label: string; color: string }> = {
        1401: { label: '일반', color: 'bg-blue-500 hover:bg-blue-600' }, // 색상 조금 더 선명하게 변경
        1402: { label: 'Q&A', color: 'bg-orange-500 hover:bg-orange-600' },
        1404: { label: '답변', color: 'bg-green-600 hover:bg-green-700' },
      }

      const currentType = typeMap[type] || {
        label: '미정', // '알 수 없음' 대신 데이터 로드 전임을 알리는 텍스트
        color: 'bg-slate-400',
      }

      return (
        <Badge className={`${currentType.color} border-none text-white`}>
          {currentType.label}
        </Badge>
      )
    },
    // [수정] 필터링 시 값이 배열로 들어올 때를 대비한 안전한 처리
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id)
      return Array.isArray(value)
        ? value.includes(rowValue)
        : value === rowValue
    },
  },
  {
    id: 'ttl',
    accessorKey: 'ttl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='제목' />
    ),
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    id: 'userId',
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='작성자' />
    ),
    // 실명·닉네임은 바뀔 수 있어 식별이 흔들린다. 목록은 변하지 않는 아이디로 보여주고,
    // 실명은 상세 드로어에서 확인한다.
    cell: ({ row }) => (
      <div className='w-[80px] text-center'>{row.getValue('userId') ?? '-'}</div>
    ),
  },
  {
    id: 'boardAdoptStatusCd',
    accessorKey: 'boardAdoptStatusCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='상태' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('boardAdoptStatusCd') as number
      // boardTypeCd가 없을 때를 대비해 safe check 추가
      const isGeneral = row.original.boardTypeCd === 1401

      if (!status || isGeneral) return null

      const statusMap: Record<number, string> = {
        1501: '진행중',
        1502: '채택완료',
        1503: '자체해결',
        1504: '미해결',
      }
      return (
        <Badge
          variant={status === 1502 ? 'default' : 'outline'}
          className='whitespace-nowrap'
        >
          {statusMap[status] || '-'}
        </Badge>
      )
    },
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
