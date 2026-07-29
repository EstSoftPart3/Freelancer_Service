import { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  Paperclip,
  Calendar,
  User,
  Trash2,
  CornerDownRight,
  MessageSquare,
  Reply,
  Pencil,
  Send,
} from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.bubble.css'
import { toast } from 'sonner'
import { baseUrl } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { noticeApi } from '../api/notice-api'
import { type Notice } from '../data/schema'
import { useNotice } from './notice-provider'

// --- 타입 정의 ---
interface Attachment {
  fileSq: number
  fileOriginalNm: string
}

interface Comment {
  sq: number
  parentCommentSq: number | null
  description: string
  userNickname: string
  createdAt: string
  isDeletedYn?: 'Y' | 'N' // '?'를 붙여서 optional로 변경!
  childComments?: Comment[] // 트리 구조용
}

// --- 댓글 아이템 컴포넌트 (재귀 호출) ---
function CommentItem({
  comment,
  onDelete,
  onReply,
  onUpdate,
}: {
  comment: Comment
  onDelete: (sq: number) => void
  onReply: (parentSq: number, content: string) => Promise<void>
  onUpdate: (sq: number, content: string) => Promise<void>
}) {
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.description)

  const handleUpdate = async () => {
    if (!editContent.trim()) return
    await onUpdate(comment.sq, editContent)
    setIsEditMode(false)
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return
    await onReply(comment.sq, replyContent)
    setReplyContent('')
    setIsReplyOpen(false)
  }

  return (
    <div className='group relative space-y-2 py-4'>
      <div className='flex items-start gap-2'>
        {comment.parentCommentSq && (
          <CornerDownRight size={16} className='mt-1 text-muted-foreground' />
        )}

        <div className='flex-1 space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm'>
              <span className='font-semibold'>{comment.userNickname}</span>
              <span className='text-xs text-muted-foreground'>
                {comment.createdAt}
              </span>
            </div>

            {/* 우측 버튼 그룹 (답글, 수정, 삭제) */}
            {comment.isDeletedYn !== 'Y' && (
              <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                {!comment.parentCommentSq && ( // 대댓글에는 답글 버튼 비노출 (기획에 따라 변경 가능)
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 px-2 text-xs'
                    onClick={() => setIsReplyOpen(!isReplyOpen)}
                  >
                    <Reply size={12} className='mr-1' /> 답글
                  </Button>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs'
                  onClick={() => {
                    setIsEditMode(!isEditMode)
                    setEditContent(comment.description)
                  }}
                >
                  <Pencil size={12} className='mr-1' /> 수정
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs text-destructive'
                  onClick={() => onDelete(comment.sq)}
                >
                  <Trash2 size={12} className='mr-1' /> 삭제
                </Button>
              </div>
            )}
          </div>

          {/* 수정 모드와 일반 모드 전환 */}
          <div className='text-sm text-foreground'>
            {comment.isDeletedYn === 'Y' ? (
              <span className='text-xs text-muted-foreground italic'>
                삭제된 댓글입니다.
              </span>
            ) : isEditMode ? (
              <div className='mt-2 space-y-2'>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className='min-h-[60px] text-sm'
                />
                <div className='flex justify-end gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setIsEditMode(false)}
                  >
                    취소
                  </Button>
                  <Button size='sm' onClick={handleUpdate}>
                    수정완료
                  </Button>
                </div>
              </div>
            ) : (
              <p className='whitespace-pre-wrap'>{comment.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* 답글 입력창 (답글 버튼 클릭 시 노출) */}
      {isReplyOpen && (
        <div className='mt-2 ml-6 space-y-2 rounded-lg border bg-muted/30 p-3'>
          <Textarea
            placeholder='답글을 입력하세요...'
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className='min-h-[80px] bg-background text-sm'
          />
          <div className='flex justify-end gap-2'>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => setIsReplyOpen(false)}
            >
              취소
            </Button>
            <Button size='sm' onClick={handleReply}>
              답글 등록
            </Button>
          </div>
        </div>
      )}

      {/* 대댓글 렌더링 */}
      {comment.childComments && comment.childComments.length > 0 && (
        <div className='ms-6 border-l ps-4'>
          {comment.childComments.map((child) => (
            <CommentItem
              key={child.sq}
              comment={child}
              onDelete={onDelete}
              onReply={onReply}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// --- 메인 Drawer 컴포넌트 ---
export function NoticeViewDrawer() {
  const { open, setOpen, currentRow } = useNotice()
  const [detail, setDetail] = useState<Notice | null>(null)
  const [comments, setComments] = useState<Comment[]>([]) // 트리 구조 댓글 상태
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')

  const fetchDetail = useCallback(async () => {
    if (open === 'view' && currentRow?.sq) {
      try {
        setIsLoading(true)
        const response = await noticeApi.getNoticeDetail(currentRow.sq)
        setDetail(response.output)

        // [수정] 백엔드에서 이미 트리 구조(childComments)로 오기 때문에
        // buildCommentTree 함수를 거치지 않고 바로 저장합니다.
        if (response.output.comments) {
          setComments(response.output.comments)
        }
      } catch (_) {
        toast.error('데이터를 불러오는 중 에러가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [open, currentRow])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // 메인 댓글 등록
  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentRow?.sq) return
    try {
      await noticeApi.createNoticeComment({
        boardSq: currentRow.sq,
        description: newComment,
        parentCommentSq: null,
      })
      setNewComment('')
      toast.success('댓글이 등록되었습니다.')
      fetchDetail()
    } catch (_) {
      toast.error('댓글 등록에 실패했습니다.')
    }
  }

  // 답글 등록
  const handleReply = async (parentSq: number, content: string) => {
    if (!currentRow?.sq) return
    try {
      await noticeApi.createNoticeComment({
        boardSq: currentRow.sq,
        description: content,
        parentCommentSq: parentSq,
      })
      toast.success('답글이 등록되었습니다.')
      fetchDetail()
    } catch (_) {
      toast.error('답글 등록에 실패했습니다.')
    }
  }

  // 댓글 수정
  const handleUpdateComment = async (commentSq: number, content: string) => {
    try {
      await noticeApi.updateNoticeComment(commentSq, { description: content })
      toast.success('댓글이 수정되었습니다.')
      fetchDetail()
    } catch (_) {
      toast.error('댓글 수정에 실패했습니다.')
    }
  }

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentSq: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      await noticeApi.deleteComment(commentSq)
      toast.success('댓글이 삭제되었습니다.')
      fetchDetail() // 삭제 후 데이터 갱신
    } catch (_) {
      toast.error('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 다운로드 URL 생성 헬퍼 함수
  const getDownloadUrl = (fileSq: number) => {
    // baseUrl이 'https://job.estsw.co.kr/api' 라면
    // 결과는 'https://job.estsw.co.kr/api/board/download/123' 이 됩니다.
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    return `${base}/board/download/${fileSq}`
  }

  return (
    <Sheet open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : detail ? (
          <div className='space-y-6 pt-6'>
            {/* 상단 헤더 섹션 */}
            <SheetHeader className='border-b pb-6 text-left'>
              <div className='mb-2 flex gap-2'>
                {detail.normalTags?.map((tag: string) => (
                  <Badge key={tag} variant='outline' className='text-blue-500'>
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

            {/* 본문 섹션 */}
            <div className='min-h-[200px] py-4'>
              <ReactQuill
                value={detail.description || ''}
                readOnly={true}
                theme='bubble'
              />
            </div>

            {/* 첨부파일 섹션 */}
            {(detail.attachments?.length ?? 0) > 0 && (
              <div className='space-y-3 border-t pt-6'>
                <h4 className='flex items-center gap-2 font-semibold'>
                  <Paperclip size={16} /> 첨부파일
                </h4>
                <div className='grid gap-2'>
                  {detail.attachments?.map((file: Attachment) => (
                    <Button
                      key={file.fileSq}
                      variant='secondary'
                      className='w-full justify-start truncate'
                      asChild
                    >
                      <a
                        href={getDownloadUrl(file.fileSq)}
                        download={file.fileOriginalNm} // 원본 파일명 제안
                        target='_blank' // 새 탭에서 열기 (브라우저 다운로드 처리)
                        rel='noopener noreferrer'
                      >
                        {file.fileOriginalNm}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* 댓글 섹션 */}
            <div className='space-y-4 pb-10'>
              <h4 className='flex items-center gap-2 font-semibold'>
                <MessageSquare size={16} /> 댓글 {detail.commentCnt ?? 0}
              </h4>

              <div className='divide-y'>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentItem
                      key={comment.sq}
                      comment={comment}
                      onDelete={handleDeleteComment}
                      onReply={handleReply}
                      onUpdate={handleUpdateComment}
                    />
                  ))
                ) : (
                  <p className='py-10 text-center text-sm text-muted-foreground'>
                    등록된 댓글이 없습니다.
                  </p>
                )}
              </div>
              {/* 메인 댓글 입력창 */}
              <div className='space-y-3 rounded-lg border bg-muted/20 p-4'>
                <Textarea
                  placeholder='댓글을 남겨주세요...'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className='min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0'
                />
                <div className='flex justify-end'>
                  <Button
                    onClick={handleCreateComment}
                    disabled={!newComment.trim()}
                  >
                    <Send size={14} className='mr-2' /> 댓글 등록
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
