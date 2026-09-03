'use client'
import { useState } from 'react'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import type { Comment } from '@/types'
import { useFormErrors } from '@/hooks/useFormErrors'

function fmtTime(iso: string) {
  const d = new Date(iso)
  let h = d.getHours(); const min = String(d.getMinutes()).padStart(2, '0')
  const period = h >= 12 ? 'pm' : 'am'
  if (h > 12) h -= 12
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${h}:${min} ${period}`
}

interface CommentItemProps {
  comment: Comment
  boardSq?: number
  answerSq?: number
  isAnswer: boolean
  viewerSq: number | null
  onRefresh: () => void
}

function CommentItem({ comment, boardSq, answerSq, isAnswer, viewerSq, onRefresh }: CommentItemProps) {
  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState(comment.description)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [delConfirm, setDelConfirm] = useState(false)
  const isOwner = viewerSq != null && comment.userSq === viewerSq
  // 한 컴포넌트에 입력이 둘(수정·답글)이라 키로 구분한다.
  const { markInvalid, fieldProps, clearField } = useFormErrors<'edit' | 'reply'>()

  const recommend = async () => {
    if (viewerSq == null) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
    try {
      const { data } = await api.post<{ status: string; message: string }>(`/comment/${comment.sq}/recommend`)
      if (data.status === 'OK') { alertStore.show(data.message, 'success'); onRefresh() }
    } catch { alertStore.show('추천 반영에 실패하였습니다.', 'danger') }
  }

  const submitEdit = async () => {
    if (!editText.trim()) { markInvalid(['edit'], '내용을 입력해주세요.'); return }
    try {
      const { data } = await api.put<{ status: string; message: string }>(`/comment/${comment.sq}`, { description: editText })
      if (data.status === 'OK') { alertStore.show(data.message, 'success'); setEditMode(false); onRefresh() }
    } catch { alertStore.show('댓글 수정에 실패하였습니다.', 'danger') }
  }

  const handleDelete = async () => {
    try {
      const { data } = await api.patch<{ status: string; message: string }>(`/comment/${comment.sq}`)
      if (data.status === 'OK') { alertStore.show(data.message, 'success'); onRefresh() }
    } catch { alertStore.show('댓글 삭제에 실패하였습니다.', 'danger') }
  }

  const submitReply = async () => {
    // 원래 조용히 돌아섰던 자리 — 문구는 그대로 두고 어느 칸이 비었는지만 보여준다.
    if (!replyText.trim()) { markInvalid(['reply']); return }
    try {
      const { data } = await api.post<{ status: string; message: string }>('/comment', {
        parentCommentSq: comment.sq,
        boardSq: isAnswer ? null : boardSq,
        answerSq: isAnswer ? answerSq : null,
        description: replyText,
      })
      if (data.status === 'CREATED' || data.status === 'OK') {
        alertStore.show(data.message, 'success')
        setShowReply(false); setReplyText(''); onRefresh()
      }
    } catch { alertStore.show('답글 등록 실패', 'danger') }
  }

  return (
    <li className="mb-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          {comment.userProfileImgUrl
            ? <img src={comment.userProfileImgUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            : <User className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 rounded-lg border bg-card p-3">
          {!editMode ? (
            <>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium text-primary text-sm">{comment.userNickname}</span>
                <div className="flex items-center gap-2">
                  {!comment.parentCommentSq && (
                    <button
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={() => {
                        if (viewerSq == null) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
                        setShowReply(!showReply)
                      }}
                    >답글</button>
                  )}
                  {isOwner ? (
                    <>
                      <span className="text-xs text-muted-foreground">추천 {comment.recommendCnt}</span>
                      <button className="text-xs text-muted-foreground hover:text-primary" onClick={() => { setEditText(comment.description); setEditMode(true) }}>수정</button>
                      <button className="text-xs text-destructive" onClick={() => setDelConfirm(true)}>삭제</button>
                    </>
                  ) : (
                    <button className="text-xs text-primary hover:underline" onClick={recommend}>
                      추천 {comment.recommendCnt}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm">{comment.description}</p>
              <span className="mt-1 block text-right text-xs text-muted-foreground">{fmtTime(comment.createdAt)}</span>
            </>
          ) : (
            <div className="flex gap-2">
              <Input {...fieldProps('edit')} value={editText} onChange={(e) => { clearField('edit'); setEditText(e.target.value) }} className="flex-1" />
              <Button size="sm" onClick={submitEdit}>수정 완료</Button>
              <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>취소</Button>
            </div>
          )}
        </div>
      </div>

      {/* 답글 입력 */}
      {showReply && (
        <div className="ml-13 mt-2 flex gap-2 pl-13">
          <div className="w-10 shrink-0" />
          <div className="flex flex-1 gap-2">
            <Input
              {...fieldProps('reply')}
              value={replyText}
              onChange={(e) => { clearField('reply'); setReplyText(e.target.value) }}
              placeholder="답글을 입력하세요"
            />
            <Button size="sm" onClick={submitReply}>등록</Button>
            <Button size="sm" variant="outline" onClick={() => setShowReply(false)}>취소</Button>
          </div>
        </div>
      )}

      {/* 대댓글 */}
      {comment.childComments && comment.childComments.length > 0 && (
        <ul className="ml-13 mt-2 border-l-2 border-border pl-4">
          {comment.childComments.map((child) => (
            <CommentItem
              key={child.sq}
              comment={child}
              boardSq={boardSq}
              answerSq={answerSq}
              isAnswer={isAnswer}
              viewerSq={viewerSq}
              onRefresh={onRefresh}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={delConfirm}
        title="댓글 삭제"
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onClose={() => setDelConfirm(false)}
      />
    </li>
  )
}

interface Props {
  comments: Comment[]
  boardSq?: number
  answerSq?: number
  isAnswer?: boolean
  onRefresh: () => void
}

export default function BoardComment({ comments, boardSq, answerSq, isAnswer = false, onRefresh }: Props) {
  const { viewerSq } = useBoardStore()
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { markInvalid, fieldProps, clearField } = useFormErrors<'comment'>()

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (viewerSq == null) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
    if (!newComment.trim()) { markInvalid(['comment'], '내용을 입력해주세요.'); return }
    setSubmitting(true)
    try {
      const { data } = await api.post<{ status: string; message: string }>('/comment', {
        boardSq: isAnswer ? null : boardSq,
        answerSq: isAnswer ? answerSq : null,
        description: newComment,
      })
      if (data.status === 'CREATED') {
        alertStore.show(data.message, 'success'); setNewComment(''); onRefresh()
      } else alertStore.show('댓글 등록에 실패하였습니다.', 'danger')
    } catch { alertStore.show('댓글 등록에 실패하였습니다.', 'danger') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="mt-8">
      <h4 className="mb-4 text-base font-semibold">댓글</h4>
      <ul className="space-y-1">
        {comments.map((c) => (
          <CommentItem
            key={c.sq}
            comment={c}
            boardSq={boardSq}
            answerSq={answerSq}
            isAnswer={isAnswer}
            viewerSq={viewerSq}
            onRefresh={onRefresh}
          />
        ))}
      </ul>
      <form onSubmit={submitComment} className="mt-6 rounded-lg bg-muted/40 p-4">
        <label className="mb-2 block text-sm font-medium">댓글 남기기</label>
        <div className="flex gap-2">
          <Input
            {...fieldProps('comment')}
            value={newComment}
            onChange={(e) => { clearField('comment'); setNewComment(e.target.value) }}
            placeholder="댓글을 입력해주세요"
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? '등록 중...' : '댓글 작성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
