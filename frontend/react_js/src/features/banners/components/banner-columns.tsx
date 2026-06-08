import { format } from 'date-fns'
import { type ColumnDef, type Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { cn } from '@/lib/utils'
import { type Banner } from '../data/schema'
import { BannerImage } from './banner-image'
import { useBanner } from './banner-provider'
import { DataTableRowActions } from './data-table-row-actions'

/** 헤더·셀 공통: 가운데 정렬 + 컬럼 너비 비율 */
const colMeta = (width: string) => ({
  thClassName: cn('text-center align-middle', width),
  tdClassName: cn('text-center align-middle', width),
})

const cellCenter = 'flex w-full items-center justify-center'

const TitleCell = ({ row }: { row: Row<Banner> }) => {
  const { setOpen, setCurrentRow } = useBanner()

  return (
    <button
      type='button'
      className='mx-auto block w-full max-w-full truncate text-center font-medium transition-colors hover:text-blue-600 hover:underline'
      onClick={() => {
        setCurrentRow(row.original)
        setOpen('view')
      }}
    >
      {row.getValue('bannerTitle')}
    </button>
  )
}

const ThumbnailCell = ({ row }: { row: Row<Banner> }) => (
  <BannerImage
    src={row.original.bannerImageUrl}
    alt={row.original.bannerTitle}
    className='mx-auto h-12 w-20 shrink-0 rounded border object-cover'
    placeholderClassName='mx-auto flex h-12 w-20 items-center justify-center rounded border bg-muted'
  />
)

const formatDtm = (value: string) => {
  try {
    return format(new Date(value), 'yyyy-MM-dd')
  } catch {
    return value
  }
}

const headerCenter = 'w-full justify-center'

export const bannerColumns: ColumnDef<Banner>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className={cellCenter}>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='전체 선택'
          className='translate-y-[2px]'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className={cellCenter}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='행 선택'
          className='translate-y-[2px]'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: colMeta('w-[6%]'),
  },
  {
    accessorKey: 'bannerSq',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='ID'
        className={headerCenter}
      />
    ),
    cell: ({ row }) => (
      <div className={cn(cellCenter, 'tabular-nums')}>
        {row.getValue('bannerSq')}
      </div>
    ),
    enableSorting: true,
    enableHiding: false,
    meta: colMeta('w-[8%]'),
  },
  {
    accessorKey: 'bannerTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='제목' className={headerCenter} />
    ),
    cell: ({ row }) => (
      <div className={cellCenter}>
        <TitleCell row={row} />
      </div>
    ),
    enableSorting: true,
    meta: colMeta('w-[16%]'),
  },
  {
    id: 'thumbnail',
    header: () => (
      <div className={cn(cellCenter, 'text-sm font-medium')}>썸네일</div>
    ),
    cell: ({ row }) => (
      <div className={cellCenter}>
        <ThumbnailCell row={row} />
      </div>
    ),
    enableSorting: false,
    meta: colMeta('w-[12%]'),
  },
  {
    accessorKey: 'displayOrder',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='노출 순서'
        className={headerCenter}
      />
    ),
    cell: ({ row }) => (
      <div className={cn(cellCenter, 'tabular-nums')}>
        {row.getValue('displayOrder')}
      </div>
    ),
    enableSorting: true,
    meta: colMeta('w-[10%]'),
  },
  {
    id: 'exposurePeriod',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='노출 기간'
        className={headerCenter}
      />
    ),
    accessorFn: (row) => `${row.startDtm}_${row.endDtm}`,
    cell: ({ row }) => (
      <div
        className={cn(
          cellCenter,
          'text-sm whitespace-normal text-muted-foreground'
        )}
      >
        <span className='text-center'>
          {formatDtm(row.original.startDtm)} ~ {formatDtm(row.original.endDtm)}
        </span>
      </div>
    ),
    enableSorting: true,
    meta: {
      thClassName: 'w-[18%] text-center align-middle whitespace-normal',
      tdClassName: 'w-[18%] text-center align-middle whitespace-normal',
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='활성' className={headerCenter} />
    ),
    cell: ({ row }) => {
      const active = row.getValue('isActive') as boolean
      return (
        <div className={cellCenter}>
          <Badge
            className={cn(
              active
                ? 'bg-emerald-600 hover:bg-emerald-600'
                : 'bg-muted-foreground/80 hover:bg-muted-foreground/80'
            )}
          >
            {active ? '활성' : '비활성'}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    meta: colMeta('w-[10%]'),
  },
  {
    accessorKey: 'bannerClickCount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='클릭 수'
        className={headerCenter}
      />
    ),
    cell: ({ row }) => (
      <div className={cn(cellCenter, 'tabular-nums')}>
        {(row.getValue('bannerClickCount') as number).toLocaleString()}
      </div>
    ),
    enableSorting: true,
    meta: colMeta('w-[10%]'),
  },
  {
    id: 'actions',
    header: () => <div className={cellCenter} />,
    cell: ({ row }) => (
      <div className={cellCenter}>
        <DataTableRowActions row={row} />
      </div>
    ),
    enableSorting: false,
    meta: colMeta('w-[10%]'),
  },
]
