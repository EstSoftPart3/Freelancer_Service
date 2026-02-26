// [Freelancer Service] 공지사항 수정/등록 서랍
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Paperclip, Loader2 } from 'lucide-react'
// 로딩 아이콘 추가
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { noticeApi } from '../api/notice-api'
import { type Notice } from '../data/schema'

interface Attachment {
  fileSq: number
  fileOriginalNm: string
}

const schema = z.object({
  title: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '제목을 입력해주세요.')
    .refine((val) => val.length <= 100, '제목은 100자 이내로 입력해주세요.'),
  description: z.string().refine((val) => {
    const stripped = val.replace(/<[^>]*>?/gm, '').trim()
    return stripped.length > 0
  }, '내용을 입력해주세요.'),
  tags: z.array(z.string()).optional(),
})

type NoticeForm = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Notice
}

export function NoticeMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const [normalTags, setNormalTags] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isFetching, setIsFetching] = useState(false) // 상세 데이터 로딩 상태

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<NoticeForm>({
      resolver: zodResolver(schema),
    })

  const descriptionContent = watch('description')

  // 핵심: 상세 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchDetail = async () => {
      if (!currentRow?.sq) return

      try {
        setIsFetching(true)
        // 백엔드 상세 조회 API 호출 (수정 시에만)
        const response = await noticeApi.getNoticeDetail(currentRow.sq)
        const detail = response.output

        // 받아온 상세 데이터로 폼과 상태 초기화
        reset({
          title: detail.ttl,
          description: detail.description || '',
        })
        setNormalTags(detail.normalTags || [])
        setAttachments(detail.attachments || [])
      } catch (_) {
        toast.error('데이터를 불러오는데 실패했습니다.')
        onOpenChange(false)
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      if (isUpdate) {
        fetchDetail()
      } else {
        // 등록 모드일 때 초기화
        reset({ title: '', description: '' })
        setNormalTags([])
        setFiles([])
        setAttachments([])
      }
    }
  }, [open, isUpdate, currentRow, reset, onOpenChange])

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!normalTags.includes(newTag)) {
        setNormalTags([...normalTags, newTag])
      }
      e.currentTarget.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)])
      e.target.value = ''
    }
  }

  const onInvalid = (errors: FieldErrors<NoticeForm>) => {
    if (errors.title) {
      toast.error(errors.title.message as string)
    } else if (errors.description) {
      toast.error(errors.description.message as string)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNormalTags(normalTags.filter((tag) => tag !== tagToRemove))
  }

  const onSubmit = async (data: NoticeForm) => {
    try {
      const formData = new FormData()
      formData.append('ttl', data.title)
      formData.append('description', data.description)

      if (normalTags.length > 0) {
        normalTags.forEach((tag) => formData.append('normalTags', tag))
      }

      files.forEach((file) => formData.append('files', file))

      if (isUpdate && currentRow) {
        attachments.forEach((att) =>
          formData.append('attachments', att.fileSq.toString())
        )
        await noticeApi.updateNotice(currentRow.sq, formData)
        toast.success('공지사항이 수정되었습니다.')
      } else {
        await noticeApi.createNotice(formData)
        toast.success('새로운 공지가 등록되었습니다.')
      }

      onOpenChange(false)
      setTimeout(() => window.location.reload(), 1000)
    } catch (_) {
      toast.error('저장에 실패했습니다.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-xl'>
        {isFetching ? (
          <div className='flex h-full flex-col items-center justify-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>
              데이터를 불러오는 중...
            </p>
          </div>
        ) : (
          <>
            <SheetHeader className='text-left'>
              <SheetTitle>
                {isUpdate ? '공지사항 수정' : '공지사항 작성'}
              </SheetTitle>
              <SheetDescription>
                사용자에게 노출될 공지사항 내용을 입력해주세요.
              </SheetDescription>
            </SheetHeader>

            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className='mt-6 space-y-6'
            >
              <div className='space-y-2'>
                <Label htmlFor='title'>제목</Label>
                <Input
                  id='title'
                  placeholder='제목을 입력하세요.'
                  {...register('title')}
                />
              </div>

              <div className='space-y-2'>
                <Label>내용</Label>
                <div className='mb-12 h-[300px]'>
                  <ReactQuill
                    theme='snow'
                    className='h-full'
                    value={descriptionContent || ''}
                    onChange={(val) => setValue('description', val)}
                    placeholder='내용을 입력해주세요.'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>태그</Label>
                <Input
                  placeholder='태그 입력 후 엔터를 눌러주세요.'
                  onKeyDown={addTag}
                />
                <div className='mt-2 flex flex-wrap gap-2'>
                  {normalTags.map((tag) => (
                    <Badge key={tag} variant='secondary' className='gap-1 pr-1'>
                      #{tag}
                      <button
                        type='button'
                        onClick={() => removeTag(tag)}
                        className='ml-1 rounded-full outline-none hover:bg-slate-200'
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label>첨부파일</Label>
                <div className='flex items-center gap-2'>
                  <Input
                    type='file'
                    id='file-upload'
                    className='hidden'
                    multiple
                    onChange={handleFileChange}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    <Paperclip className='mr-2 h-4 w-4' />
                    파일 선택
                  </Button>
                </div>

                <div className='mt-2 space-y-2'>
                  {attachments.map((att) => (
                    <div
                      key={att.fileSq}
                      className='flex items-center justify-between rounded border border-blue-100 bg-blue-50 p-2 text-sm'
                    >
                      <span className='truncate text-blue-700'>
                        {att.fileOriginalNm} (서버 파일)
                      </span>
                      <X
                        className='h-4 w-4 cursor-pointer text-blue-500'
                        onClick={() =>
                          setAttachments(
                            attachments.filter((a) => a.fileSq !== att.fileSq)
                          )
                        }
                      />
                    </div>
                  ))}

                  {files.map((file, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between rounded bg-muted p-2 text-sm'
                    >
                      <span className='truncate'>{file.name}</span>
                      <X
                        className='h-4 w-4 cursor-pointer'
                        onClick={() =>
                          setFiles(files.filter((_, idx) => idx !== i))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <SheetFooter className='mt-8'>
                <SheetClose asChild>
                  <Button variant='outline'>취소</Button>
                </SheetClose>
                <Button type='submit'>
                  {isUpdate ? '수정완료' : '등록하기'}
                </Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
