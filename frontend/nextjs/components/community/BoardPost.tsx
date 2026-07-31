'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import DOMPurify from 'isomorphic-dompurify'
import { Eye, ThumbsUp, Flag, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import ReportModal from '@/components/community/ReportModal'
import { CategoryBadge, SecretBadge } from '@/components/community/CategoryBadge'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { enhanceBoardLinksInPlace } from '@/lib/htmlContent'
import type { BoardDetail } from '@/types'

function fmtDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const STATUS: Record<number, { label: string; cls: string }> = {
  1501: { label: '진행중', cls: 'bg-yellow-100 text-yellow-800' },
  1502: { label: '채택완료', cls: 'bg-green-100 text-green-800' },
  1503: { label: '자체해결', cls: 'bg-gray-100 text-gray-700' },
  1504: { label: '미해결', cls: 'bg-red-100 text-red-700' },
}

type BoardType = 'board' | 'qna' | 'answer' | 'notice' | 'voc'

interface Props {
  boardInfo: BoardDetail
  boardType: BoardType
  parentUserSq?: number
  adoptStatusCd?: number
  onRefresh: () => void
  onAnswerWrite?: () => void
  onAdopt?: () => void
  onEdit?: () => void
}

export default function BoardPost({
  boardInfo, boardType, parentUserSq = 0, adoptStatusCd = 0,
  onRefresh, onAnswerWrite, onAdopt, onEdit,
}: Props) {
  const router = useRouter()
  const { viewerSq, setBoard, resetBoard } = useBoardStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [statusConfirm, setStatusConfirm] = useState<{ open: boolean; cd: number }>({ open: false, cd: 0 })
  const [reportOpen, setReportOpen] = useState(false)

  const isOwner = boardInfo.userSq != null && viewerSq != null && boardInfo.userSq === viewerSq
  // 고객의 소리는 운영자에게 보내는 1:1 창구다 — 추천·신고 같은 커뮤니티 상호작용을 붙이지 않는다.
  // (신고는 "운영자에게 운영자를 신고"하는 꼴이 되고, 추천은 비공개 글에서 의미가 없다)
  const isVocOrNotice = boardType === 'notice' || boardType === 'voc'

  // 본문은 SSR 원본 그대로 렌더하고(hydration mismatch 방지) 링크 교정은 DOM에서 후처리
  const descriptionRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (descriptionRef.current) enhanceBoardLinksInPlace(descriptionRef.current)
  }, [boardInfo.description])

  const handleRecommend = async () => {
    if (viewerSq == null) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
    try {
      const { data } = await api.post<{ status: string; message: string }>(
        `/${boardType}/${boardInfo.sq}/recommend`,
      )
      if (data.status === 'OK') { alertStore.show(data.message, 'success'); onRefresh() }
      else alertStore.show('추천 반영에 실패하였습니다.', 'danger')
    } catch { alertStore.show('추천 반영에 실패하였습니다.', 'danger') }
  }

  const handleEdit = () => {
    if (viewerSq == null) { alertStore.show('로그인 후 이용해주세요.', 'danger'); return }
    setBoard({
      sq: boardInfo.sq, ttl: boardInfo.ttl, description: boardInfo.description,
      normalTags: boardInfo.normalTags, skillTags: boardInfo.skillTags,
      attachments: boardInfo.attachments,
      categoryCd: boardInfo.categoryCd ?? null,
      secret: boardInfo.secret ?? false,
    })
    router.push(`/${boardType}/register`)
  }

  const handleDelete = async () => {
    try {
      const { data } = await api.patch<{ status: string; message: string }>(
        `/${boardType}/${boardInfo.sq}`,
      )
      if (data.status === 'OK') {
        alertStore.show(data.message, 'success')
        if (boardType === 'answer') window.location.reload()
        else router.push(`/${boardType}`)
      } else alertStore.show('삭제에 실패하였습니다.', 'danger')
    } catch { alertStore.show('삭제에 실패하였습니다.', 'danger') }
    resetBoard()
  }

  const handleStatusUpdate = async (cd: number) => {
    try {
      const { data } = await api.put<{ status: string }>(
        `/qna/${boardInfo.sq}/status/${cd}`,
      )
      if (data.status === 'OK') {
        alertStore.show(`${cd === 1503 ? '자체해결' : '미해결'} 상태로 변경되었습니다.`, 'success')
        onRefresh()
      } else alertStore.show('상태 변경에 실패하였습니다.', 'danger')
    } catch { alertStore.show('상태 변경에 실패하였습니다.', 'danger') }
  }

  return (
    <div>
      {/* 상태 배지 */}
      {boardType === 'qna' && boardInfo.boardAdoptStatusCd && STATUS[boardInfo.boardAdoptStatusCd] && (
        <div className="mb-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[boardInfo.boardAdoptStatusCd].cls}`}>
            {STATUS[boardInfo.boardAdoptStatusCd].label}
          </span>
        </div>
      )}
      {boardInfo.isAdoptedYn === 'Y' && (
        <div className="mb-2 flex items-center gap-1 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4" /> 채택 답변
        </div>
      )}

      {boardType === 'voc' && boardInfo.secret && (
        <div className="mb-2">
          <SecretBadge />
        </div>
      )}

      {/* 카테고리 배지 — 일반게시판에만 있는 축이고, 미분류(null)면 그리지 않는다 */}
      {boardType === 'board' && boardInfo.categoryNm && (
        <div className="mb-2">
          <CategoryBadge name={boardInfo.categoryNm} />
        </div>
      )}

      {/* 제목 + 액션 버튼 */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 className="text-xl font-semibold text-primary">{boardInfo.ttl}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" /> 조회 {boardInfo.viewCnt}
          </span>
          {!isVocOrNotice && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              onClick={handleRecommend}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> 추천 {boardInfo.recommendCnt}
            </button>
          )}
          {!isVocOrNotice && !isOwner && viewerSq != null && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => setReportOpen(true)}
            >
              <Flag className="h-3.5 w-3.5" /> 신고
            </button>
          )}
        </div>
      </div>

      {/* 메타 */}
      <div className="mt-1 text-sm text-muted-foreground">
        By <span className="font-medium">{boardInfo.userNickname}</span>
        <span className="ml-3">{fmtDate(boardInfo.createdAt)}</span>
      </div>

      {/* 본문 — Quill HTML을 정제해서 렌더링 (저장된 원본에 스크립트가 섞여도 실행 차단) */}
      <div
        ref={descriptionRef}
        className="prose prose-sm mt-6 mb-6 max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(boardInfo.description) }}
      />

      {/* 첨부파일 */}
      {boardInfo.attachments?.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-1 text-sm font-semibold text-muted-foreground">첨부파일</h5>
          <ul className="space-y-0.5">
            {boardInfo.attachments.map((a) => (
              <li key={a.fileSq}>
                <a
                  href={`/api/board/download/${a.fileSq}`}
                  download
                  className="text-sm text-primary underline hover:no-underline"
                >
                  {a.fileOriginalNm}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 태그 */}
      {(boardInfo.normalTags?.length > 0 || boardInfo.skillTags?.length > 0) && (
        <div className="mb-4">
          <h5 className="mb-2 text-sm font-semibold text-muted-foreground">태그</h5>
          <div className="flex flex-wrap gap-2">
            {boardInfo.skillTags?.map((t) => (
              <span key={t.skillTagSq} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-3.5 w-3.5" />
                {t.skillTagNm}
              </span>
            ))}
            {boardInfo.normalTags?.map((t) => (
              <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 관리 버튼 */}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {boardType === 'qna' && !isOwner && viewerSq != null && (
          <Button size="sm" onClick={onAnswerWrite}>답변 작성</Button>
        )}
        {boardType === 'qna' && isOwner && boardInfo.boardAdoptStatusCd === 1501 && (
          <>
            <Button size="sm" variant="outline" onClick={() => setStatusConfirm({ open: true, cd: 1503 })}>자체 해결</Button>
            <Button size="sm" variant="outline" onClick={() => setStatusConfirm({ open: true, cd: 1504 })}>미해결</Button>
          </>
        )}
        {isOwner && boardType !== 'answer' && boardType !== 'notice' && (
          <Button size="sm" variant="outline" onClick={handleEdit}>수정</Button>
        )}
        {isOwner && boardType === 'answer' && onEdit && (
          <Button size="sm" variant="outline" onClick={onEdit}>수정</Button>
        )}
        {isOwner && boardType !== 'notice' && (
          <Button size="sm" variant="destructive" onClick={() => setConfirmOpen(true)}>삭제</Button>
        )}
        {boardType === 'answer' && parentUserSq === viewerSq && adoptStatusCd === 1501 && (
          <Button size="sm" onClick={onAdopt}>답변 채택하기</Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="게시글 삭제"
        message="정말 삭제하시겠습니까?"
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
      <ConfirmDialog
        open={statusConfirm.open}
        title="상태 변경"
        message={`${statusConfirm.cd === 1503 ? '자체해결' : '미해결'} 상태로 변경하시겠습니까?`}
        onConfirm={() => handleStatusUpdate(statusConfirm.cd)}
        onClose={() => setStatusConfirm({ open: false, cd: 0 })}
      />
      <ReportModal
        open={reportOpen}
        reportTypeCd={boardType === 'answer' ? 2002 : 2001}
        sq={boardInfo.sq}
        onClose={() => setReportOpen(false)}
      />
    </div>
  )
}
