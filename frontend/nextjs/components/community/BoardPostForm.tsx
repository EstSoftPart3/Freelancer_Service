'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SkillTagModal from '@/components/community/SkillTagModal'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import type { SkillTag, Attachment } from '@/types'
import 'react-quill-new/dist/quill.snow.css'

// SSR 비활성화 — Quill은 browser-only
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

type BoardCategory = 'board' | 'qna'

interface Props {
  boardCategory: BoardCategory
}

function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim() === ''
}

export default function BoardPostForm({ boardCategory }: Props) {
  const router = useRouter()
  const { boardData, editSq, resetBoard } = useBoardStore()

  const [ttl, setTtl] = useState(boardData.ttl)
  const [description, setDescription] = useState(boardData.description)
  const [normalTags, setNormalTags] = useState<string[]>(boardData.normalTags)
  const [skillTags, setSkillTags] = useState<SkillTag[]>(boardData.skillTags)
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(boardData.attachments)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [tagInput, setTagInput] = useState('')
  const [skillOpen, setSkillOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 수정 모드: editSq > 0이면 PUT, 아니면 POST
  const isEdit = editSq > 0
  // 기술태그는 QnA에서만 노출 (Vue 원본 isQna/skillActive 대응)
  const isQna = boardCategory === 'qna'

  useEffect(() => {
    return () => { resetBoard() }
  }, [resetBoard])

  const addTag = (val: string) => {
    const tag = val.trim()
    if (tag && !normalTags.includes(tag)) setNormalTags((prev) => [...prev, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => setNormalTags((prev) => prev.filter((t) => t !== tag))

  const removeSkillTag = (sq: number) => setSkillTags((prev) => prev.filter((t) => t.skillTagSq !== sq))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    e.target.value = ''
  }

  const handleCancel = () => {
    // 새 탭/직접 진입 등으로 히스토리가 없으면 router.back()이 무반응이므로 목록으로 이동한다.
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push(`/${boardCategory}`)
  }

  const handleSubmit = async () => {
    if (!ttl.trim()) { alertStore.show('제목을 입력해주세요.', 'danger'); return }
    if (isHtmlEmpty(description)) { alertStore.show('내용을 입력해주세요.', 'danger'); return }
    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE) { alertStore.show(`${f.name}의 크기가 1MB를 초과합니다.`, 'danger'); return }
    }

    const formData = new FormData()
    formData.append('ttl', ttl)
    formData.append('description', description)
    // Vue 원본과 동일하게 콤마조인 단일 필드로 전송 — 빈 배열이어도 필드가 존재해야 백엔드 null(NPE) 방지
    formData.append('normalTags', normalTags.join(','))
    formData.append('skillTagsJson', JSON.stringify(skillTags))
    formData.append('attachments', existingAttachments.map((a) => a.fileSq).join(','))
    newFiles.forEach((f) => formData.append('files', f))

    try {
      if (isEdit) {
        const { data } = await api.put<{ status: string; message: string }>(
          `/${boardCategory}/${editSq}`, formData,
        )
        if (data.status === 'OK') {
          alertStore.show(data.message, 'success')
          router.push(`/${boardCategory}`)
        } else alertStore.show('게시글 수정에 실패하였습니다.', 'danger')
      } else {
        const { data } = await api.post<{ status: string; message: string }>(
          `/${boardCategory}`, formData,
        )
        if (data.status === 'CREATED') {
          alertStore.show(data.message, 'success')
          router.push(`/${boardCategory}`)
        } else alertStore.show('게시글 등록에 실패하였습니다.', 'danger')
      }
    } catch { alertStore.show('게시글 등록에 실패하였습니다.', 'danger') }
  }

  return (
    <div className="space-y-4">
      {/* 제목 */}
      <div>
        <label className="mb-1 block text-sm font-medium">제목</label>
        <Input value={ttl} onChange={(e) => setTtl(e.target.value)} placeholder="제목을 입력하세요." />
      </div>

      {/* 내용 */}
      <div>
        <label className="mb-1 block text-sm font-medium">내용</label>
        <div className="min-h-[200px] rounded-lg border">
          <ReactQuill
            theme="snow"
            value={description}
            onChange={setDescription}
            placeholder="내용을 입력해주세요."
            style={{ minHeight: '200px' }}
          />
        </div>
      </div>

      {/* 태그 */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <label className="text-sm font-medium">태그</label>
          {isQna && (
            <Button type="button" size="sm" variant="secondary" onClick={() => setSkillOpen(true)}>
              기술 태그 선택하기
            </Button>
          )}
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) }
          }}
          placeholder="태그 입력 후 엔터를 입력해주세요."
        />
        {((isQna && skillTags.length > 0) || normalTags.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {isQna && skillTags.map((t) => (
              <span key={t.skillTagSq} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-3.5 w-3.5" />
                {t.skillTagNm}
                <button type="button" onClick={() => removeSkillTag(t.skillTagSq)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {normalTags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                #{t}
                <button type="button" onClick={() => removeTag(t)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 첨부파일 */}
      <div>
        <label className="mb-1 block text-sm font-medium">첨부파일</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*, .pdf, .doc, .docx, .zip"
          className="block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm"
          onChange={handleFileChange}
        />
        <ul className="mt-2 space-y-1 text-sm">
          {existingAttachments.map((a, i) => (
            <li key={a.fileSq} className="flex items-center gap-2">
              <span>{a.fileOriginalNm}</span>
              <button type="button" onClick={() => setExistingAttachments((prev) => prev.filter((_, idx) => idx !== i))}>
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
          {newFiles.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>{f.name}</span>
              <button type="button" onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit}>{isEdit ? '수정' : '등록'}</Button>
        <Button variant="outline" onClick={handleCancel}>취소</Button>
      </div>

      {isQna && (
        <SkillTagModal
          open={skillOpen}
          selected={skillTags}
          onClose={() => setSkillOpen(false)}
          onConfirm={setSkillTags}
        />
      )}
    </div>
  )
}
