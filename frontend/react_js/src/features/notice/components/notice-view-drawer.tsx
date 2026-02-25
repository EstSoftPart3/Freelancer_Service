// src/features/notice/components/notice-view-drawer.tsx
import { useEffect, useState } from 'react'
import { Loader2, Paperclip, Calendar, User } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.bubble.css'
import { toast } from 'sonner'
// 읽기전용은 bubble 테마가 깔끔합니다.
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { noticeApi } from '../api/notice-api'
import type { Notice } from '../data/schema'
import { useNotice } from './notice-provider'

interface Attachment {
  fileSq: number
  fileOriginalNm: string
}

export function NoticeViewDrawer() {
  const { open, setOpen, currentRow } = useNotice()
  const [detail, setDetail] = useState<Notice | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      if (open === 'view' && currentRow?.sq) {
        try {
          setIsLoading(true)
          const response = await noticeApi.getNoticeDetail(currentRow.sq)
          setDetail(response.output)
        } catch (_) {
          toast.error('데이터를 불러오는 중 에러가 발생했습니다.')
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchDetail()
  }, [open, currentRow])

  return (
    <Sheet open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <SheetContent className='overflow-y-auto sm:max-w-2xl'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : detail ? (
          <div className='space-y-6 pt-6'>
            <SheetHeader className='border-b pb-6 text-left'>
              <div className='mb-2 flex gap-2'>
                {detail.normalTags?.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant='outline' // 4. variant는 outline만!
                    className='text-blue-500' // 색상은 여기에!
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
              <SheetTitle className='text-2xl'>{detail.ttl}</SheetTitle>
              <div className='mt-2 flex items-center gap-4 text-sm text-muted-foreground'>
                <div className='flex items-center gap-1'>
                  <User size={14} /> {detail.userNm}
                </div>
                <div className='flex items-center gap-1'>
                  <Calendar size={14} /> {detail.createdAt}
                </div>
              </div>
            </SheetHeader>

            <div className='min-h-[300px] py-4'>
              {/* ReactQuill의 bubble 테마로 내용 표시 */}
              <ReactQuill
                value={detail.description || ''}
                readOnly={true}
                theme='bubble'
              />
            </div>

            {(detail.attachments?.length ?? 0) > 0 && (
              <div className='space-y-3 border-t pt-6'>
                <h4 className='flex items-center gap-2 font-semibold'>
                  <Paperclip size={16} /> 첨부파일
                </h4>
                <div className='grid gap-2'>
                  {/* 3. any 대신 Attachment 타입을 지정합니다. */}
                  {detail.attachments?.map((file: Attachment) => (
                    <Button
                      key={file.fileSq}
                      variant='secondary'
                      className='w-full justify-start truncate'
                      asChild
                    >
                      {/* 다운로드 경로 확인 필요 */}
                      <a href={`/api/files/download/${file.fileSq}`} download>
                        {file.fileOriginalNm}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
