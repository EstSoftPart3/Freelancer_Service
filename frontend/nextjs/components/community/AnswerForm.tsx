'use client'
import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SkillTagModal from '@/components/community/SkillTagModal'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import type { SkillTag, Attachment, BoardDetail } from '@/types'
import 'react-quill-new/dist/quill.snow.css'

// SSR 비활성화 — Quill은 browser-only
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim() === ''
}

interface Props {
  boardSq: string
  // 수정 모드: 기존 답변을 넘기면 PUT /answer/{sq}, 없으면 POST /answer
  editTarget?: BoardDetail | null
  onSuccess: () => void
  onCancel: () => void
}

export default function AnswerForm({ boardSq, editTarget = null, onSuccess, onCancel }: Props) {
  const isEdit = editTarget != null

  const [ttl, setTtl] = useState(editTarget?.ttl ?? '')
  const [description, setDescription] = useState(editTarget?.description ?? '')
  const [normalTags, setNormalTags] = useState<string[]>(editTarget?.normalTags ?? [])
  const [skillTags, setSkillTags] = useState<SkillTag[]>(editTarget?.skillTags ?? [])
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(editTarget?.attachments ?? [])
  const [tagInput, setTagInput] = useState('')
  const [skillOpen, setSkillOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  // Quill placeholder를 첫 입력(IME 조합 포함) 즉시 숨기기 위한 플래그
  const [editorTouched, setEditorTouched] = useState(!isHtmlEmpty(editTarget?.description ?? ''))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addNormalTag = (val: string) => {
    const tag = val.trim()
    if (tag && !normalTags.includes(tag)) setNormalTags((prev) => [...prev, tag])
    setTagInput('')
  }
  const removeNormalTag = (tag: string) => setNormalTags((prev) => prev.filter((t) => t !== tag))
  const removeSkillTag = (sq: number) => setSkillTags((prev) => prev.filter((t) => t.skillTagSq !== sq))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const picked = Array.from(e.target.files) // value='' 전에 먼저 캡처
    setFiles((prev) => [...prev, ...picked])
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (!ttl.trim()) { alertStore.show('제목을 입력해주세요.', 'danger'); return }
    if (isHtmlEmpty(description)) { alertStore.show('내용을 입력해주세요.', 'danger'); return }
    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) { alertStore.show(`${f.name}의 크기가 1MB를 초과합니다.`, 'danger'); return }
    }

    const formData = new FormData()
    formData.append('ttl', ttl)
    formData.append('description', description)
    formData.append('boardSq', boardSq)
    // Vue 원본과 동일하게 콤마조인 단일 필드로 전송 — 빈 배열이어도 필드가 존재해야 백엔드 null(NPE) 방지
    formData.append('normalTags', normalTags.join(','))
    formData.append('skillTagsJson', JSON.stringify(skillTags))
    formData.append('attachments', existingAttachments.map((a) => a.fileSq).join(','))
    files.forEach((f) => formData.append('files', f))

    setSubmitting(true)
    try {
      if (isEdit) {
        const { data } = await api.put<{ status: string; message: string }>(`/answer/${editTarget!.sq}`, formData)
        if (data.status === 'OK') { alertStore.show(data.message, 'success'); onSuccess() }
        else alertStore.show('답변 수정에 실패하였습니다.', 'danger')
      } else {
        const { data } = await api.post<{ status: string; message: string }>('/answer', formData)
        if (data.status === 'CREATED') { alertStore.show(data.message, 'success'); onSuccess() }
        else alertStore.show('답변 등록에 실패하였습니다.', 'danger')
      }
    } catch { alertStore.show(isEdit ? '답변 수정에 실패하였습니다.' : '답변 등록에 실패하였습니다.', 'danger') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-3">
      <Input value={ttl} onChange={(e) => setTtl(e.target.value)} placeholder="제목을 입력하세요." />

      <div
        className={`min-h-[260px] rounded-lg border ${editorTouched ? '[&_.ql-editor.ql-blank::before]:hidden' : ''}`}
        onKeyDown={() => { if (!editorTouched) setEditorTouched(true) }}
      >
        <ReactQuill
          theme="snow"
          value={description}
          onChange={setDescription}
          placeholder="답변 내용을 입력해주세요."
          style={{ minHeight: '260px' }}
        />
      </div>

      {/* 태그 */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <label className="text-sm font-medium">태그</label>
          <Button type="button" size="sm" variant="secondary" onClick={() => setSkillOpen(true)}>
            기술 태그 선택하기
          </Button>
        </div>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addNormalTag(tagInput) }
          }}
          placeholder="태그 입력 후 엔터를 입력해주세요."
        />
        {(skillTags.length > 0 || normalTags.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {skillTags.map((t) => (
              <span key={t.skillTagSq} className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                <img src={getSkillIconUrl(t.skillTagNm)} alt="" className="h-3.5 w-3.5" />
                {t.skillTagNm}
                <button type="button" onClick={() => removeSkillTag(t.skillTagSq)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {normalTags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs">
                #{t}
                <button type="button" onClick={() => removeNormalTag(t)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

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
        {(existingAttachments.length > 0 || files.length > 0) && (
          <ul className="mt-2 space-y-1 text-sm">
            {existingAttachments.map((a, i) => (
              <li key={a.fileSq} className="flex items-center gap-2">
                <span>{a.fileOriginalNm}</span>
                <button type="button" onClick={() => setExistingAttachments((prev) => prev.filter((_, idx) => idx !== i))}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span>{f.name}</span>
                <button type="button" onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}>
                  <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (isEdit ? '수정 중...' : '등록 중...') : (isEdit ? '수정' : '등록')}
        </Button>
        <Button variant="outline" onClick={onCancel}>취소</Button>
      </div>

      <SkillTagModal
        open={skillOpen}
        selected={skillTags}
        onClose={() => setSkillOpen(false)}
        onConfirm={setSkillTags}
      />
    </div>
  )
}
