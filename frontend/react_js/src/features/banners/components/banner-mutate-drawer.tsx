import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { bannerApi } from '../api/banner-api'
import { BannerImage } from './banner-image'
import { useBanner } from './banner-provider'
import { type Banner } from '../data/schema'

const formSchema = z
  .object({
    bannerTitle: z
      .string()
      .transform((v) => v.trim())
      .refine((v) => v.length > 0, '제목을 입력해주세요.'),
    bannerLinkUrl: z.string().optional(),
    displayOrder: z.coerce.number().int().min(0, '0 이상 입력해주세요.'),
    startDtm: z.string().min(1, '시작일을 선택해주세요.'),
    endDtm: z.string().min(1, '종료일을 선택해주세요.'),
    isActive: z.boolean(),
  })
  .refine((data) => data.startDtm <= data.endDtm, {
    message: '종료일은 시작일 이후여야 합니다.',
    path: ['endDtm'],
  })

type BannerForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Banner
}

function toDatetimeLocal(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const defaultValues: BannerForm = {
  bannerTitle: '',
  bannerLinkUrl: '',
  displayOrder: 1,
  startDtm: '',
  endDtm: '',
  isActive: true,
}

function toApiDateTime(value: string): string {
  if (value.length === 16) return `${value}:00`
  return value
}

export function BannerMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const { refreshBanners } = useBanner()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, reset } = useForm<BannerForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const isActive = watch('isActive')

  useEffect(() => {
    if (!open) return

    if (isUpdate && currentRow) {
      reset({
        bannerTitle: currentRow.bannerTitle,
        bannerLinkUrl: currentRow.bannerLinkUrl ?? '',
        displayOrder: currentRow.displayOrder,
        startDtm: toDatetimeLocal(currentRow.startDtm),
        endDtm: toDatetimeLocal(currentRow.endDtm),
        isActive: currentRow.isActive,
      })
      setPreviewUrl(currentRow.bannerImageUrl || null)
      setImageFile(null)
    } else {
      reset(defaultValues)
      setPreviewUrl(null)
      setImageFile(null)
    }
  }, [open, isUpdate, currentRow, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    e.target.value = ''
  }

  const clearImage = () => {
    setImageFile(null)
    setPreviewUrl(isUpdate && currentRow ? currentRow.bannerImageUrl : null)
  }

  const onInvalid = (errors: FieldErrors<BannerForm>) => {
    const first = Object.values(errors)[0]
    if (first?.message) toast.error(String(first.message))
  }

  const onSubmit = async (data: BannerForm) => {
    if (!isUpdate && !imageFile) {
      toast.error('배너 이미지를 선택해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append(
        'request',
        new Blob(
          [
            JSON.stringify({
              bannerTitle: data.bannerTitle,
              bannerLinkUrl: data.bannerLinkUrl || null,
              linkTargetBlankYn: 'N',
              displayOrder: data.displayOrder,
              startDtm: toApiDateTime(data.startDtm),
              endDtm: toApiDateTime(data.endDtm),
              isActive: data.isActive,
            }),
          ],
          { type: 'application/json' }
        )
      )
      if (imageFile) {
        formData.append('image', imageFile)
      }

      if (isUpdate && currentRow) {
        await bannerApi.updateBanner(currentRow.bannerSq, formData)
        toast.success('배너가 수정되었습니다.')
      } else {
        await bannerApi.createBanner(formData)
        toast.success('배너가 등록되었습니다.')
      }
      onOpenChange(false)
      await refreshBanners()
    } catch {
      toast.error(
        isUpdate ? '배너 수정에 실패했습니다.' : '배너 등록에 실패했습니다.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? '배너 수정' : '배너 등록'}</SheetTitle>
          <SheetDescription>
            FO 메인 히어로 배너 이미지·노출 기간·활성 상태를 설정합니다.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className='mt-6 space-y-6'
        >
          <div className='space-y-2'>
            <Label htmlFor='bannerTitle'>제목</Label>
            <Input
              id='bannerTitle'
              placeholder='배너 제목'
              {...register('bannerTitle')}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bannerImage'>배너 이미지</Label>
            <Input
              id='bannerImage'
              type='file'
              accept='image/*'
              onChange={handleImageChange}
            />
            {previewUrl ? (
              <div className='relative inline-block w-full max-w-md'>
                <BannerImage
                  src={previewUrl}
                  alt='미리보기'
                  className='h-32 w-full rounded-md border object-cover'
                  placeholderClassName='flex h-32 w-full items-center justify-center rounded-md border bg-muted/30'
                />
                <Button
                  type='button'
                  variant='secondary'
                  size='icon'
                  className='absolute top-2 right-2 h-7 w-7'
                  onClick={clearImage}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <div className='flex h-32 items-center justify-center rounded-md border border-dashed bg-muted/30'>
                <ImageIcon className='h-8 w-8 text-muted-foreground' />
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='bannerLinkUrl'>링크 URL</Label>
            <Input
              id='bannerLinkUrl'
              placeholder='/ 또는 https://...'
              {...register('bannerLinkUrl')}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='displayOrder'>노출 순서</Label>
            <Input
              id='displayOrder'
              type='number'
              min={0}
              {...register('displayOrder')}
            />
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='startDtm'>노출 시작</Label>
              <Input id='startDtm' type='datetime-local' {...register('startDtm')} />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endDtm'>노출 종료</Label>
              <Input id='endDtm' type='datetime-local' {...register('endDtm')} />
            </div>
          </div>

          <div className='flex items-center justify-between rounded-lg border p-3'>
            <div className='space-y-0.5'>
              <Label>활성 상태</Label>
              <p className='text-sm text-muted-foreground'>
                비활성 시 FO 메인 캐러셀에 노출되지 않습니다.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
          </div>

          <SheetFooter className='gap-2 sm:justify-end'>
            <SheetClose asChild>
              <Button type='button' variant='outline'>
                취소
              </Button>
            </SheetClose>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? '저장 중…' : isUpdate ? '수정 완료' : '등록하기'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
