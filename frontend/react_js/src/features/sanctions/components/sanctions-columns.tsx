import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { baseUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type SanctionUserItem } from '../api/sanctions-api'
import { DataTableRowActions } from '../../users/components/data-table-row-actions'

export const sanctionsColumns: ColumnDef<SanctionUserItem>[] = [
  {
    id: 'select',
    accessorKey: 'select',
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
    meta: {
      title: '',
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
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
    id: 'userType',
    accessorKey: 'userType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const userType = row.original.userType
      const typeMap: Record<string, { label: string; color: string }> = {
        '301': { label: '일반', color: 'bg-green-500 hover:bg-green-600' },
        '302': { label: '기업', color: 'bg-blue-500 hover:bg-blue-600' },
      }

      const currentType = typeMap[userType] || {
        label: userType || '일반',
        color: 'bg-green-500 hover:bg-green-600',
      }

      return (
        <Badge className={`${currentType.color} border-none text-white`}>
          {currentType.label}
        </Badge>
      )
    },
  },
  {
    id: 'profileImageUrl',
    accessorKey: 'profileImageUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { profileImageUrl, userNm } = row.original as any
      const serverRoot = baseUrl.includes('/api') 
        ? baseUrl.slice(0, baseUrl.lastIndexOf('/api')) 
        : baseUrl

      return (
        <Avatar className='h-8 w-8'>
          <AvatarImage
            src={profileImageUrl ? `${serverRoot}${profileImageUrl}` : ''}
          />
          <AvatarFallback className='text-sm'>
            {userNm?.charAt(0) ?? '유'}
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { email } = row.original
      return <LongText className='max-w-36'>{email}</LongText>
    },
  },
  {
    id: 'userNm',
    accessorKey: 'userNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { userNm } = row.original
      return <LongText className='max-w-36'>{userNm}</LongText>
    },
  },
  {
    id: 'companyNm',
    accessorKey: 'companyNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { companyNm } = row.original
      return <LongText className='max-w-36'>{companyNm ?? '-'}</LongText>
    },
  },
  {
    id: 'userEmail',
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { email } = row.original
      return <LongText className='w-fit ps-2 text-nowrap'>{email}</LongText>
    },
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { phone } = row.original
      const formatted = phone?.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
      return <LongText className='w-fit ps-2 text-nowrap'>{formatted ?? '-'}</LongText>
    },
  },
  {
    id: 'userGenderCd',
    accessorKey: 'userGenderCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: ({ row }) => {
      const { userGenderCd } = row.original as any
      const genderMap: Record<number, string> = {
        101: '남자',
        102: '여자',
      }
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {genderMap[userGenderCd] ?? '미기입'}
        </LongText>
      )
    },
  },
  {
    id: 'suspendedUntilDtm',
    accessorKey: 'suspendedUntilDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='정지 해제' />
    ),
    cell: ({ row }) => {
      const { suspendedUntilDtm } = row.original
      let formatted = '-'
      if (suspendedUntilDtm) {
        try {
          formatted = format(new Date(suspendedUntilDtm), 'yyyy.MM.dd HH:mm:ss')
        } catch (_) {
          formatted = suspendedUntilDtm
        }
      }
      return (
        <LongText className='w-fit ps-2 text-nowrap text-muted-foreground'>
          {formatted}
        </LongText>
      )
    },
  },
  {
    id: 'sanctionCount',
    accessorKey: 'sanctionCount',
    header: () => (
      <div className='ps-2 font-semibold text-nowrap'></div>
    ),
    cell: ({ row }) => {
      const { sanctionCount } = row.original
      return (
        <span className='ps-2 font-medium text-nowrap'>
          {sanctionCount ?? 0}회
        </span>
      )
    },
  },
  {
    id: 'sanctionStatus',
    accessorKey: 'sanctionStatus',
    header: () => (
      <div className='ps-2 font-semibold text-nowrap'></div>
    ),
    cell: ({ row }) => {
      const { sanctionStatus } = row.original

      const statusMap: Record<string | number, string> = {
        '3209': '7일',
        '3210': '30일',
        '3211': '영구정지',
    }

      const displayText = statusMap[sanctionStatus] ?? sanctionStatus ?? '정지 없음'
      

      return (
        <span className='ps-2 text-nowrap font-medium'>
          {displayText}
        </span>
      )
    },
  },
  {
    id: 'sanctionReason',
    accessorKey: 'sanctionReason',
    header: () => (
      <div className='ps-2 font-semibold text-nowrap'></div>
    ),
    cell: ({ row }) => {
      const { sanctionReason } = row.original
      return (
        <LongText className='max-w-60 ps-2' title={sanctionReason}>
          {sanctionReason ?? '-'}
        </LongText>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='' />
    ),
    cell: DataTableRowActions,
  },
]