// [Freelancer Service]
// eslint-disable react-hooks/exhaustive-deps
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { baseUrl } from '@/lib/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { DatePicker } from '@/components/date-picker'
import { type AdminUser } from '../data/schema'
import { CompanyDetailsDialog } from './company-details-dialog'
import { CompanySearchDialog } from './company-search-dialog'
import { useUsers } from './users-provider'

// 만 19세 기준 나이 계산
const getAdultCutoffDate = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 19)
  return date
}

// 만 19세 미만인지 확인 (미성년자 판단)
const isMinor = (date: Date | null | undefined) => {
  if (!date) return false
  return date > getAdultCutoffDate()
}

// 생년월일 변경 시 유효성 검사
const validateBirthDate = ({
  newBirth,
  isDirty,
}: {
  newBirth: Date | null | undefined
  isDirty: boolean
}) => {
  if (!newBirth) return null

  // 변경되지 않았다면 굳이 검증 안 함 (UX 개선)
  if (!isDirty) return null

  // 결과는 반드시 성인이어야 함
  if (isMinor(newBirth)) {
    return '회원의 나이는 만 19세 이상이어야 합니다.'
  }

  return null
}

const schema = z.object({
  userNm: z.string().min(1, '이름을 입력해주세요.'),
  userEmail: z.string(),
  userPw: z
    .string()
    .refine(
      (val) =>
        val === '' || /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(val),
      {
        message: '8자 이상, 영문·숫자·특수문자를 조합해 입력해주세요.',
      }
    ),
  userPhoneNum: z
    .string()
    .min(1, '휴대폰 번호를 입력해주세요.')
    .regex(
      /^(01[016789]\d{7,8}|02\d{7,8}|0[3-9][0-9]\d{6,7})$/,
      '올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)'
    ),
  userBirthDt: z.date().optional().nullable(),
  userTypeCd: z.number(),
  userGenderCd: z.number().nullable(),
  userIsActivateYn: z.string(),
  userIsDeletedYn: z.string(),
  userAgreedPrivacyPolicyYn: z.string(),
  companyNm: z.string().nullable(),
  companySq: z.number().nullable(),
})

type UserMutateForm = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: AdminUser
}

export function UsersMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  )
  const { setOpen, setPendingFormData } = useUsers()

  type CompanyDialogType = 'search' | 'details' | null
  const [companyDialog, setCompanyDialog] = useState<CompanyDialogType>(null)

  // 드로어 열릴 때의 원본 companySq (affiliationAction 계산용)
  const [originalCompanySq, setOriginalCompanySq] = useState<number | null>(
    null
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<UserMutateForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      userNm: '',
      userEmail: '',
      userPw: '',
      userPhoneNum: '',
      userBirthDt: null,
      companyNm: '',
      companySq: null,
      userTypeCd: 301,
      userGenderCd: 101,
      userIsActivateYn: 'Y',
      userIsDeletedYn: 'N',
      userAgreedPrivacyPolicyYn: 'Y',
    },
  })

  const serverRoot = baseUrl.slice(0, baseUrl.lastIndexOf('/api'))
  useEffect(() => {
    if (open) {
      if (isUpdate && currentRow) {
        const sq = currentRow.companySq ?? null
        reset({
          userNm: currentRow.userNm,
          userEmail: currentRow.userEmail,
          userPw: '', //빈 문자열로 둬서 입력 시 수정 되도록 변경
          userPhoneNum: currentRow.userPhoneNum,
          userBirthDt: currentRow.userBirthDt
            ? new Date(currentRow.userBirthDt)
            : null,
          companyNm: currentRow.companyNm,
          companySq: sq,
          userTypeCd: currentRow.userTypeCd,
          userGenderCd: currentRow.userGenderCd,
          userIsActivateYn: currentRow.userIsActivateYn,
          userIsDeletedYn: currentRow.userIsDeletedYn,
          userAgreedPrivacyPolicyYn: currentRow.userAgreedPrivacyPolicyYn,
        })
        setOriginalCompanySq(sq)
        setProfileImagePreview(
          currentRow.profileImageUrl
            ? `${serverRoot}${currentRow.profileImageUrl}`
            : null
        )
      } else {
        reset({
          userNm: '',
          userEmail: '',
          userPw: '',
          userPhoneNum: '',
          userBirthDt: null,
          companyNm: '',
          companySq: null,
          userTypeCd: 301,
          userGenderCd: 101,
          userIsActivateYn: 'Y',
          userIsDeletedYn: 'N',
          userAgreedPrivacyPolicyYn: 'Y',
        })
        setOriginalCompanySq(null)
        setProfileImagePreview(null)
      }
      setProfileImageFile(null)
      setCompanyDialog(null)
    }
  }, [open, isUpdate, currentRow, reset, serverRoot])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileImageFile(file)
    setProfileImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  // affiliationAction 계산
  const calcAffiliationAction = (currentCompanySq: number | null): string => {
    const orig = originalCompanySq
    if (orig === null && currentCompanySq !== null) return 'JOIN'
    if (orig !== null && currentCompanySq === null) return 'LEAVE'
    if (orig !== null && currentCompanySq !== null && orig !== currentCompanySq)
      return 'CHANGE'
    return 'NONE'
  }

  const onSubmit = async (data: UserMutateForm) => {
    if (!currentRow) return

    const errorMessage = validateBirthDate({
      newBirth: data.userBirthDt,
      isDirty: !!dirtyFields.userBirthDt,
    })

    if (errorMessage) {
      setError('userBirthDt', { message: errorMessage })
      return
    }

    const affiliationAction = calcAffiliationAction(data.companySq)

    const formData = new FormData()
    formData.append('userNm', data.userNm)
    formData.append('userEmail', data.userEmail)
    formData.append('userPhoneNum', data.userPhoneNum)
    if (data.userBirthDt) {
      formData.append(
        'userBirthDt',
        format(new Date(data.userBirthDt), 'yyyy-MM-dd')
      )
    }
    // else {
    //   formData.append('userBirthDt', '')
    // }
    formData.append('userTypeCd', String(data.userTypeCd))
    if (data.userGenderCd !== null) {
      formData.append('userGenderCd', String(data.userGenderCd))
    }
    formData.append('userIsActivateYn', data.userIsActivateYn)
    formData.append('userIsDeletedYn', data.userIsDeletedYn)
    formData.append('userAgreedPrivacyPolicyYn', data.userAgreedPrivacyPolicyYn)
    formData.append('affiliationAction', affiliationAction)
    if (data.companyNm) formData.append('companyNm', data.companyNm)
    if (data.companySq) formData.append('companySq', String(data.companySq))
    if (data.userPw) formData.append('userPw', data.userPw)
    if (profileImageFile) formData.append('profileImage', profileImageFile)

    setPendingFormData({ userSq: currentRow.userSq, formData })
    setOpen('master-pw')
  }

  const currentTypeCd = watch('userTypeCd')
  const currentCompanySq = watch('companySq')
  const currentCompanyNm = watch('companyNm')

  const handleAffiliationClick = () => {
    setCompanyDialog(currentTypeCd === 302 ? 'details' : 'search')
  }

  // 검색 다이얼로그에서 회사 선택 시
  const handleCompanySelect = (companySq: number, companyNm: string) => {
    setValue('companySq', companySq)
    setValue('companyNm', companyNm)
    setCompanyDialog(null)
  }

  // 기업 소속 있음 → CompanyDetailsDialog 저장 완료 시
  const handleCompanyUpdated = (
    newCompanyNm: string,
    newCompanySq?: number
  ) => {
    setValue('companyNm', newCompanyNm)
    if (typeof newCompanySq === 'number') {
      setValue('companySq', newCompanySq)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? '유저 수정' : '유저 추가'}</SheetTitle>
          <SheetDescription>유저 정보를 입력하고 저장하세요.</SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='mt-6 space-y-6 px-4 sm:px-8'
        >
          <div
            className='relative cursor-pointer'
            // onClick={() => fileInputRef.current?.click()}
            onClick={() => toast.error('이미지 변경은 관리자에게 문의하세요.')}
          >
            <Avatar className='h-24 w-24'>
              <AvatarImage src={profileImagePreview ?? ''} />
              <AvatarFallback className='text-2xl'>
                {watch('userNm')?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className='absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow'>
              <Camera size={14} />
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>
            이미지를 클릭해서 변경하세요.
          </p>
          <input
            type='file'
            ref={fileInputRef}
            accept='image/*'
            className='hidden'
            onChange={handleImageChange}
          />

          <div className='space-y-2'>
            <Label htmlFor='userNm'>이름</Label>
            <Input id='userNm' autoComplete='off' {...register('userNm')} />
            {errors.userNm && (
              <p className='text-sm text-destructive'>
                {errors.userNm.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='userEmail'>이메일</Label>
            <Input
              id='userEmail'
              autoComplete='off'
              {...register('userEmail')}
            />
            {errors.userEmail && (
              <p className='text-sm text-destructive'>
                {errors.userEmail.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='userPw'>비밀번호</Label>
            <Input
              id='userPw'
              type='password'
              autoComplete='off'
              {...register('userPw')}
            />
            {errors.userPw && (
              <p className='text-sm text-destructive'>
                {errors.userPw.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='userPhoneNum'>휴대폰</Label>
            <Input
              id='userPhoneNum'
              autoComplete='off'
              {...register('userPhoneNum')}
            />
            {errors.userPhoneNum && (
              <p className='text-sm text-destructive'>
                {errors.userPhoneNum.message}
              </p>
            )}
          </div>

          <div className='flex flex-col space-y-2'>
            <Label htmlFor='userBirthDt'>생년월일</Label>
            <Controller
              control={control}
              name='userBirthDt'
              render={({ field }) => (
                <DatePicker
                  selected={field.value ?? undefined}
                  onSelect={field.onChange}
                  placeholder='생년월일 선택'
                  defaultMonth={getAdultCutoffDate()}
                />
              )}
            />
            {errors.userBirthDt && (
              <p className='text-sm text-destructive'>
                {errors.userBirthDt.message}
              </p>
            )}
          </div>

          {/* ── 소속 필드 ── */}
          <div className='space-y-2'>
            <Label htmlFor='companyNm'>소속</Label>
            <div className='relative flex items-center'>
              <Input
                id='companyNm'
                autoComplete='off'
                placeholder={
                  currentTypeCd === 302
                    ? '클릭하여 회사 정보 수정'
                    : '클릭하여 소속 검색'
                }
                value={currentCompanyNm ?? ''}
                readOnly
                className='cursor-pointer pr-16'
                onClick={handleAffiliationClick}
              />
              <div className='absolute right-2 flex items-center gap-1'>
                {/* X 버튼: 일반 유저(301)가 소속 있을 때만 표시 */}
                {currentTypeCd !== 302 && currentCompanyNm && (
                  <button
                    type='button'
                    className='rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    onClick={(e) => {
                      e.stopPropagation()
                      setValue('companyNm', null)
                      setValue('companySq', null)
                    }}
                    title='소속 삭제'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
                {/* 검색 버튼: 기업 회원은 회사 정보 모달만 사용 */}
                {currentTypeCd !== 302 && (
                  <button
                    type='button'
                    className='rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                    onClick={handleAffiliationClick}
                    title='소속 검색'
                  >
                    <Search className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 소속 관련 다이얼로그 */}
          <CompanySearchDialog
            open={companyDialog === 'search'}
            onOpenChange={(isOpen) =>
              setCompanyDialog(isOpen ? 'search' : null)
            }
            onSelect={handleCompanySelect}
          />

          <CompanyDetailsDialog
            open={companyDialog === 'details'}
            onOpenChange={(isOpen) =>
              setCompanyDialog(isOpen ? 'details' : null)
            }
            companySq={currentCompanySq}
            initialValues={{
              userSq: currentRow?.userSq,
              companyNm: currentCompanyNm,
            }}
            onUpdated={handleCompanyUpdated}
          />

          <div className='space-y-2'>
            <Label>유저 유형</Label>
            <Select
              value={String(watch('userTypeCd'))}
              onValueChange={(val) => setValue('userTypeCd', Number(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='301'>일반</SelectItem>
                <SelectItem value='302'>기업</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>성별</Label>
            <Select
              value={
                watch('userGenderCd') === null
                  ? ''
                  : String(watch('userGenderCd'))
              }
              onValueChange={(val) => setValue('userGenderCd', Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder='선택 안 함' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='101'>남자</SelectItem>
                <SelectItem value='102'>여자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label>계정 활성화</Label>
              <p className='text-sm text-muted-foreground'>
                비활성화 시 로그인이 제한됩니다.
              </p>
            </div>
            <Switch
              checked={watch('userIsActivateYn') === 'Y'}
              onCheckedChange={(checked) =>
                setValue('userIsActivateYn', checked ? 'Y' : 'N')
              }
            />
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label>탈퇴 처리</Label>
              <p className='text-sm text-muted-foreground'>
                활성화 시 탈퇴 처리된 계정으로 변경됩니다.
              </p>
            </div>
            <Switch
              checked={watch('userIsDeletedYn') === 'Y'}
              onCheckedChange={(checked) =>
                setValue('userIsDeletedYn', checked ? 'Y' : 'N')
              }
            />
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label>개인정보 이용 동의</Label>
              <p className='text-sm text-muted-foreground'>
                개인정보 처리방침 동의 여부입니다.
              </p>
            </div>
            <Switch
              checked={watch('userAgreedPrivacyPolicyYn') === 'Y'}
              onCheckedChange={(checked) =>
                setValue('userAgreedPrivacyPolicyYn', checked ? 'Y' : 'N')
              }
            />
          </div>

          <SheetFooter>
            <Button type='submit'>{isUpdate ? '수정완료' : '등록하기'}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
