import { type ColumnDef } from '@tanstack/react-table';
import { baseUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
// import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/data-table';
import { LongText } from '@/components/long-text';
// import { callTypes, roles } from '../data/data'
import { type AdminUser } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';

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
      const type = row.original.userTypeCd as number;

      const typemMap: Record<number, { label: string; color: string }> = {
        301: { label: '일반', color: 'bg-green-500 hover:bg-green-600' },
        302: { label: '기업', color: 'bg-blue-500 hover:bg-blue-600' },
      };

      const currentType = typemMap[type] || {
        label: '미정',
        color: 'bg-slate-400',
      };

      return (
        <Badge className={`${currentType.color} border-none text-white`}>
          {currentType.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id) as number;
      return Array.isArray(value)
        ? value.map(Number).includes(rowValue)
        : Number(value) === rowValue;
    },
  },
  {
    accessorKey: 'profileImageUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='프로필 이미지' />
    ),
    cell: ({ row }) => {
      const { profileImageUrl } = row.original;
      const { userNm } = row.original;
      const serverRoot = baseUrl.slice(0, baseUrl.lastIndexOf('/api'));
      return (
        <Avatar className='h-8 w-8'>
          <AvatarImage
            src={profileImageUrl ? `${serverRoot}${profileImageUrl}` : ''}
          />
          <AvatarFallback className='text-sm'>
            {userNm?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='아이디' />
    ),
    cell: ({ row }) => {
      const { userId } = row.original;
      return <LongText className='max-w-36'>{userId}</LongText>;
    },
  },

  {
    accessorKey: 'userNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='이름' />
    ),
    cell: ({ row }) => {
      const { userNm } = row.original;
      return <LongText className='max-w-36'>{userNm}</LongText>;
    },
  },
  {
    accessorKey: 'companyNm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소속' />
    ),
    cell: ({ row }) => {
      const { companyNm } = row.original;
      return <LongText className='max-w-36'>{companyNm ?? '없음'}</LongText>;
    },
  },
  {
    accessorKey: 'userEmail',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='이메일' />
    ),
    cell: ({ row }) => {
      const { userEmail } = row.original;
      return (
        <LongText className='w-fit ps-2 text-nowrap'>{userEmail}</LongText>
      );
    },
  },
  {
    accessorKey: 'userPhoneNum',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='휴대폰' />
    ),
    cell: ({ row }) => {
      const { userPhoneNum } = row.original;
      const formatted = userPhoneNum?.replace(
        /(\d{3})(\d{4})(\d{4})/,
        '$1-$2-$3'
      );

      return (
        <LongText className='w-fit ps-2 text-nowrap'>{formatted}</LongText>
      );
    },
  },
  {
    accessorKey: 'userGenderCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='성별' />
    ),
    cell: ({ row }) => {
      const { userGenderCd } = row.original;

      const genderMap: Record<number, string> = {
        101: '남자',
        102: '여자',
      };

      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {genderMap[userGenderCd] ?? '미기입'}
        </LongText>
      );
    },
  },
  {
    accessorKey: 'userBirthDt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='생년월일' />
    ),
    cell: ({ row }) => {
      const { userBirthDt } = row.original;
      const formatted = userBirthDt
        ? new Date(userBirthDt)
            .toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\.|\s/g, '')
            .split('')
        : '-';
      return (
        <LongText className='w-fit ps-2 text-nowrap'>{formatted}</LongText>
      );
    },
  },
  {
    accessorKey: 'userCreatedDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='생성일시' />
    ),
    cell: ({ row }) => {
      const { userCreatedDtm } = row.original;
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userCreatedDtm.toLocaleString()}
        </LongText>
      );
    },
  },
  {
    accessorKey: 'userModifiedDtm',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='수정일시' />
    ),
    cell: ({ row }) => {
      const { userModifiedDtm } = row.original;
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userModifiedDtm.toLocaleString()}
        </LongText>
      );
    },
  },
  {
    accessorKey: 'userSignupTypeCd',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='로그인 유형' />
    ),
    cell: ({ row }) => {
      const { userSignupTypeCd } = row.original;

      const signupTypeMap: Record<number, string> = {
        204: '기존 회원',
        205: '소셜 회원',
      };

      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {signupTypeMap[userSignupTypeCd] ?? '-'}
        </LongText>
      );
    },
  },
  {
    accessorKey: 'userIsActivateYn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='계정 활성화 여부' />
    ),
    cell: ({ row }) => {
      const { userIsActivateYn } = row.original;
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userIsActivateYn}
        </LongText>
      );
    },
  },
  {
    accessorKey: 'userIsDeletedYn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='탈퇴 여부' />
    ),
    cell: ({ row }) => {
      const { userIsDeletedYn } = row.original;

      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userIsDeletedYn}
        </LongText>
      );
    },
  },
  {
    accessorKey: 'userAgreedPrivacyPolicyYn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='개인정보 이용 동의 여부' />
    ),
    cell: ({ row }) => {
      const { userAgreedPrivacyPolicyYn } = row.original;
      return (
        <LongText className='w-fit ps-2 text-nowrap'>
          {userAgreedPrivacyPolicyYn}
        </LongText>
      );
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
];
