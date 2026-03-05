import { AvatarImage } from '@radix-ui/react-avatar'
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='유형' />
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
  //     <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
  //   ),
  //   meta: {
  //     className: cn(
  //       'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
  //       'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
  //     ),
  //   },
  //   enableHiding: false,
  // },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='아이디' />
    ),
    cell: ({ row }) => {
      const { userId } = row.original
      return <LongText className='max-w-36'>{userId}</LongText>
    },
  },
  {
    accessorKey: 'profileImageUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='프로필 이미지' />
    ),
    cell: ({ row }) => {
      const { profileImageUrl } = row.original

      if (!profileImageUrl)
        return <LongText className='max-w-36'>미지정</LongText>
      return (
        <Avatar className='h-8 w-8'>
          <AvatarImage src={profileImageUrl ?? ''} />
        </Avatar>
      )
    },
  },
  {
    accessorKey: 'userNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='이름' />
    ),
    cell: ({ row }) => {
      const { userNm } = row.original
      return <LongText className='max-w-36'>{userNm}</LongText>
    },
  },
  {
    accessorKey: 'companyNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소속' />
    ),
    cell: ({ row }) => {
      const { companyNm } = row.original
      return <LongText className='max-w-36'>{companyNm ?? '없음'}</LongText>
    },
  },
  {
    accessorKey: 'userEmail',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='이메일' />
    ),
    cell: ({ row }) => {
      const { userEmail } = row.original
      return <LongText className='w-fit ps-2 text-nowrap'>{userEmail}</LongText>
    },
  },
  {
    accessorKey: 'userPhoneNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='휴대폰' />
    ),
    cell: ({ row }) => {
      const { userPhoneNum } = row.original
      return (
        <LongText className='w-fit ps-2 text-nowrap'>{userPhoneNum}</LongText>
      )
    },
  },
  {
    accessorKey: 'userGenderCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='성별' />
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
    accessorKey: 'userCreatedDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='생성일시' />
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='수정일시' />
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
    accessorKey: 'userIsDeletedYn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='탈퇴 여부' />
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
    accessorKey: 'userSignupTypeCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='로그인 유형' />
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='계정 활성화 여부' />
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
    accessorKey: 'userAgreedPrivacyPolicyYn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='개인정보 이용 동의 여부' />
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
  // {
  //   accessorKey: 'status',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Status' />
  //   ),
  //   cell: ({ row }) => {
  //     const { status } = row.original
  //     const badgeColor = callTypes.get(status)
  //     return (
  //       <div className='flex space-x-2'>
  //         <Badge variant='outline' className={cn('capitalize', badgeColor)}>
  //           {row.getValue('status')}
  //         </Badge>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  //   enableHiding: false,
  //   enableSorting: false,
  // },
  // {
  //   accessorKey: 'role',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title='Role' />
  //   ),
  //   cell: ({ row }) => {
  //     const { role } = row.original
  //     const userType = roles.find(({ value }) => value === role)

  //     if (!userType) {
  //       return null
  //     }

  //     return (
  //       <div className='flex items-center gap-x-2'>
  //         {userType.icon && (
  //           <userType.icon size={16} className='text-muted-foreground' />
  //         )}
  //         <span className='text-sm capitalize'>{row.getValue('role')}</span>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id))
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
