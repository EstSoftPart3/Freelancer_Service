// [Freelancer Service]
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
  ArrowRight,
  Plus,
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
// [해결] 명칭 및 경로 수정
import { boardApi } from '../api/board-api'
import { type AdminBoard } from '../data/schema'
import { BoardMutateDrawer } from './board-mutate-drawer'
import { useBoard } from './board-provider'

// --- 타입 정의 ---
interface Attachment {
  fileSq: number
  fileOriginalNm: string
}

interface SkillTag {
  skillTagSq: number
  skillTagNm: string
}

interface AnswerDetail {
  sq: number
  ttl: string
  userNm: string
  createdAt: string
  isAdoptedYn: 'Y' | 'N'
  recommendCnt?: number
  commentCnt?: number
}

interface Comment {
  sq: number
  parentCommentSq: number | null
  description: string
  userNm: string
  createdAt: string
  isDeletedYn?: 'Y' | 'N'
  childComments?: Comment[]
}

// 상세 조회를 위한 확장 타입 (schema에 없는 comments 필드 대응)
interface BoardDetail extends Omit<AdminBoard, 'skillTags'> {
  comments?: Comment[]
  answers?: AnswerDetail[] // [추가] 답변 목록 필드
  parentBoardSq?: number
  parentBoardTypeCd?: number
  skillTags?: SkillTag[] // 여기서 다시 정의
}

// --- 댓글 아이템 컴포넌트 (Notice와 동일 로직 유지) ---
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
              <span className='font-semibold'>{comment.userNm}</span>
              <span className='text-xs text-muted-foreground'>
                {comment.createdAt}
              </span>
            </div>

            {comment.isDeletedYn !== 'Y' && (
              <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                {!comment.parentCommentSq && (
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
interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BoardViewDrawer({ open, onOpenChange }: Props) {
  // [해결] useBoard 훅 사용
  const { currentRow, setCurrentRow } = useBoard()
  const [detail, setDetail] = useState<BoardDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isAnswerDrawerOpen, setIsAnswerDrawerOpen] = useState(false)
  const [editingAnswerForDrawer, setEditingAnswerForDrawer] = useState<{
    sq: number
    boardTypeCd: number
  } | null>(null)

  const handleGoToQuestion = () => {
    if (!detail?.parentBoardSq) return

    // 현재 드로어를 닫지 않고 데이터만 교체하여 '이동' 효과를 줌
    setCurrentRow({
      sq: detail.parentBoardSq,
      boardTypeCd: detail.parentBoardTypeCd || 1402,
      // 필요한 다른 필드들은 fetchDetail에서 채워짐
    } as AdminBoard)

    toast.info('질문글로 이동합니다.')
  }

  const fetchDetail = useCallback(async () => {
    if (open && currentRow?.sq && currentRow.boardTypeCd !== undefined) {
      try {
        setIsLoading(true)
        const response = await boardApi.getBoardDetail(
          currentRow.sq,
          currentRow.boardTypeCd
        )

        // 3. [해결] 가져온 데이터를 BoardDetail 타입으로 강제 지정 (Property 'comments' 에러 해결)
        const output = response.output as BoardDetail
        setDetail(output)

        if (output.comments) {
          setComments(output.comments)
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

  /**
   * 1. 댓글 삭제 핸들러 (마스터 권한)
   */
  const handleDeleteComment = async (commentSq: number) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return

    try {
      await boardApi.deleteComment(commentSq)
      toast.success('댓글이 삭제되었습니다.')
      fetchDetail() // 목록 새로고침
    } catch (_) {
      toast.error('댓글 삭제에 실패했습니다.')
    }
  }

  /**
   * 2. 댓글 수정 핸들러 (마스터 권한)
   */
  const handleUpdateComment = async (commentSq: number, content: string) => {
    try {
      await boardApi.updateComment(commentSq, content)
      toast.success('댓글이 수정되었습니다.')
      fetchDetail() // 목록 새로고침
    } catch (_) {
      toast.error('댓글 수정에 실패했습니다.')
    }
  }

  /**
   * 3. 대댓글(답글) 등록 핸들러
   */
  const handleCreateReply = async (
    parentCommentSq: number,
    content: string
  ) => {
    if (!currentRow?.sq) return

    try {
      // 현재 보고 있는 글이 게시글인지 답변인지에 따라 boardSq 전송
      await boardApi.createComment(currentRow.sq, content, parentCommentSq)
      toast.success('답글이 등록되었습니다.')
      fetchDetail() // 목록 새로고침
    } catch (_) {
      toast.error('답글 등록에 실패했습니다.')
    }
  }

  /**
   * 4. 일반 댓글 등록 핸들러
   */
  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentRow?.sq) return

    try {
      await boardApi.createComment(currentRow.sq, newComment)
      toast.success('댓글이 등록되었습니다.')
      setNewComment('')
      fetchDetail() // 목록 새로고침
    } catch (_) {
      toast.error('댓글 등록 실패')
    }
  }

  /**
   * 5. 답변 삭제 핸들러
   */
  const handleDeleteAnswer = async (answerSq: number) => {
    if (!confirm('정말로 이 답변을 삭제하시겠습니까?')) return

    try {
      await boardApi.deleteBoard(answerSq, 'ANSWER')
      toast.success('답변이 삭제되었습니다.')
      fetchDetail() // 목록 새로고침
    } catch (_) {
      toast.error('답변 삭제에 실패했습니다.')
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <Loader2 className='animate-spin' />
          </div>
        ) : detail ? (
          <div className='space-y-6 pt-6'>
            {detail.mainType === 'ANSWER' && (
              <div className='flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50 p-4'>
                <div className='text-sm font-medium text-orange-800'>
                  이 글은 질문에 대한 <strong>답변</strong>입니다.
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  className='border-orange-200 bg-white text-orange-700 hover:bg-orange-100'
                  onClick={handleGoToQuestion}
                >
                  질문 바로가기 <ArrowRight size={14} className='ml-1' />
                </Button>
              </div>
            )}
            <SheetHeader className='border-b pb-6 text-left'>
              {/* 기술 태그 렌더링 수정 (객체 배열 대응) */}
              {detail.skillTags && detail.skillTags.length > 0 && (
                <div className='mb-2 flex flex-wrap gap-2'>
                  {detail.skillTags.map((tag: SkillTag) => (
                    <Badge key={tag.skillTagSq} className='bg-orange-500'>
                      {tag.skillTagNm}
                    </Badge>
                  ))}
                </div>
              )}

              {/* 일반 태그 영역 */}
              <div className='mb-2 flex flex-wrap gap-2'>
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

            {detail.boardTypeCd === 1402 && (
              <div className='space-y-4 border-t pt-6'>
                <div className='flex items-center justify-between'>
                  <h4 className='flex items-center gap-2 font-semibold text-orange-600'>
                    <MessageSquare size={16} /> 답변{' '}
                    {detail.answers?.length ?? 0}
                  </h4>
                </div>

                <div className='grid gap-3'>
                  {detail.answers && detail.answers.length > 0 ? (
                    detail.answers.map((answer: AnswerDetail) => (
                      <div
                        key={answer.sq}
                        className={`group cursor-pointer rounded-lg border p-4 transition-all hover:border-orange-300 hover:shadow-sm ${
                          answer.isAdoptedYn === 'Y'
                            ? 'border-orange-200 bg-orange-50/50'
                            : 'bg-card'
                        }`}
                        onClick={() => {
                          // 답변 클릭 시 해당 답변 상세(1404)로 이동
                          setCurrentRow({
                            sq: answer.sq,
                            boardTypeCd: 1404,
                          } as AdminBoard)
                          toast.info('답변 상세 내용으로 이동합니다.')
                        }}
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            {answer.isAdoptedYn === 'Y' && (
                              <Badge className='h-5 bg-orange-500 px-1.5 text-[10px] hover:bg-orange-600'>
                                채택됨
                              </Badge>
                            )}
                            <span className='text-sm font-bold transition-colors group-hover:text-orange-700'>
                              {answer.ttl}
                            </span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-6 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100'
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingAnswer(answer)
                                setAnswerTitle(answer.ttl)
                                setAnswerContent('') // 내용은 API에서 가져와야 할 수 있음
                                toast.info('답변 내용을 불러오는 중...')
                                // 답변 상세를 가져와서 내용 설정
                                boardApi
                                  .getBoardDetail(answer.sq, 1404)
                                  .then((res) => {
                                    setAnswerContent(
                                      res.output.description || ''
                                    )
                                  })
                                  .catch(() => {
                                    toast.error(
                                      '답변 내용을 불러올 수 없습니다.'
                                    )
                                  })
                                setEditingAnswerForDrawer({
                                  sq: answer.sq,
                                  boardTypeCd: 1404,
                                })
                                setIsAnswerDrawerOpen(true)
                              }}
                            >
                              <Pencil size={10} />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-6 px-2 text-xs text-destructive opacity-0 transition-opacity group-hover:opacity-100'
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAnswer(answer.sq)
                              }}
                            >
                              <Trash2 size={10} />
                            </Button>
                          </div>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <User size={12} /> {answer.userNm}
                          </div>
                          <div className='flex items-center gap-3 text-[11px] text-muted-foreground'>
                            <span>추천 {answer.recommendCnt || 0}</span>
                            <span>댓글 {answer.commentCnt || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className='rounded-lg border border-dashed bg-slate-50/50 py-12 text-center text-sm text-muted-foreground'>
                      아직 등록된 답변이 없습니다.
                    </div>
                  )}
                </div>

                <div className='flex justify-end'>
                  <Button
                    // variant='outline'
                    onClick={() => {
                      setEditingAnswerForDrawer(null)
                      setIsAnswerDrawerOpen(true)
                    }}
                    // className='w-full'
                    className='space-x-1'
                  >
                    {/* <Reply size={14} className='mr-2' /> 답변 등록 */}
                    <span>답변 등록</span> <Plus size={18} />
                  </Button>
                </div>

                <BoardMutateDrawer
                  open={isAnswerDrawerOpen}
                  onOpenChange={(open) => {
                    setIsAnswerDrawerOpen(open)
                    if (!open) {
                      setEditingAnswerForDrawer(null)
                      fetchDetail()
                    }
                  }}
                  parentBoardSq={currentRow?.sq}
                  currentRow={
                    editingAnswerForDrawer
                      ? ({
                          sq: editingAnswerForDrawer.sq,
                          boardTypeCd: 1404,
                        } as AdminBoard)
                      : undefined
                  }
                />
              </div>
            )}

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
                      onReply={handleCreateReply}
                      onUpdate={handleUpdateComment}
                    />
                  ))
                ) : (
                  <p className='py-10 text-center text-sm text-muted-foreground'>
                    등록된 댓글이 없습니다.
                  </p>
                )}
              </div>
              <div className='space-y-3 rounded-lg border bg-muted/20 p-4'>
                <Textarea
                  placeholder='댓글을 남겨주세요...'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className='min-h-[100px] resize-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0'
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
