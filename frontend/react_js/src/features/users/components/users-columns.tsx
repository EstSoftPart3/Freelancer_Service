import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { baseUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
// import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
// import { callTypes, roles } from '../data/data'
import { type AdminUser } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<AdminUser>[] = [
  {
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
    accessorKey: 'userTypeCd',
    meta: { title: '회원유형' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const type = row.original.userTypeCd as number

      const typemMap: Record<number, { label: string; color: string }> = {
        301: { label: '일반', color: 'bg-green-500 hover:bg-green-600' },
        302: { label: '기업', color: 'bg-blue-500 hover:bg-blue-600' },
      }

      const currentType = typemMap[type] || {
        label: '미정',
        color: 'bg-slate-400',
      }

      return (
        <Badge className={`${currentType.color} border-none text-white`}>
          {currentType.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number
      return Array.isArray(value)
        ? value.map(Number).includes(rowValue)
        : Number(value) === rowValue
    },
  },
  {
    accessorKey: 'profileImageUrl',
    meta: { title: '프로필' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { profileImageUrl } = row.original
      const { userNm } = row.original
      const serverRoot = baseUrl.slice(0, baseUrl.lastIndexOf('/api'))
      return (
        <Avatar className='h-8 w-8'>
          <AvatarImage
            src={profileImageUrl ? `${serverRoot}${profileImageUrl}` : ''}
          />
          <AvatarFallback className='text-sm'>
            {userNm?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    accessorKey: 'userId',
    meta: { title: '아이디' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userId } = row.original
      return <LongText className='max-w-36'>{userId}</LongText>
    },
  },

  {
    accessorKey: 'userNm',
    meta: { title: '이름' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userNm } = row.original
      return <LongText className='max-w-36'>{userNm}</LongText>
    },
  },
  {
    accessorKey: 'userNickname',
    meta: { title: '닉네임' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userNickname } = row.original
      return <LongText className='max-w-36'>{userNickname ?? '-'}</LongText>
    },
  },
  {
    accessorKey: 'companyNm',
    meta: { title: '기업명' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { companyNm } = row.original
      return <LongText className='max-w-36'>{companyNm ?? '없음'}</LongText>
    },
  },
  {
    accessorKey: 'userEmail',
    meta: { title: '이메일' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userEmail } = row.original
      return <LongText className='w-fit ps-2 text-nowrap'>{userEmail}</LongText>
    },
  },
  {
    accessorKey: 'userPhoneNum',
    meta: { title: '휴대폰' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userPhoneNum } = row.original
      const formatted = userPhoneNum?.replace(
        /(\d{3})(\d{4})(\d{4})/,
        '$1-$2-$3'
      )

      return <LongText className='w-fit ps-2 text-nowrap'>{formatted}</LongText>
    },
  },
  {
    accessorKey: 'userGenderCd',
    meta: { title: '성별' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userGenderCd } = row.original

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
    accessorKey: 'userBirthDt',
    meta: { title: '생년월일' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userBirthDt } = row.original
      const formatted = userBirthDt
        ? format(new Date(userBirthDt), 'yyyy-MM-dd')
        : '-'
      return <LongText className='w-fit ps-2 text-nowrap'>{formatted}</LongText>
    },
  },
  {
    accessorKey: 'userCreatedDtm',
    meta: { title: '가입일' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userCreatedDtm } = row.original
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userCreatedDtm.toLocaleString()}
        </LongText>
      )
    },
  },
  {
    accessorKey: 'userModifiedDtm',
    meta: { title: '수정일' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userModifiedDtm } = row.original
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userModifiedDtm.toLocaleString()}
        </LongText>
      )
    },
  },
  {
    accessorKey: 'userSignupTypeCd',
    meta: { title: '가입경로' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userSignupTypeCd } = row.original

      const signupTypeMap: Record<number, string> = {
        204: '기존 회원',
        205: '소셜 회원',
      }

      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {signupTypeMap[userSignupTypeCd] ?? '-'}
        </LongText>
      )
    },
  },
  {
    accessorKey: 'userIsActivateYn',
    meta: { title: '활성' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userIsActivateYn } = row.original
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userIsActivateYn}
        </LongText>
      )
    },
  },
  {
    accessorKey: 'userIsDeletedYn',
    meta: { title: '삭제' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userIsDeletedYn } = row.original

      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userIsDeletedYn}
        </LongText>
      )
    },
  },
  {
    accessorKey: 'userAgreedPrivacyPolicyYn',
    meta: { title: '약관동의' },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={column.columnDef.meta?.title as string}
      />
    ),
    cell: ({ row }) => {
      const { userAgreedPrivacyPolicyYn } = row.original
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userAgreedPrivacyPolicyYn}
        </LongText>
      )
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
