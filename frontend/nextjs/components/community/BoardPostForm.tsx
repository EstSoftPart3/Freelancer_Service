'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Paperclip, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InfoTooltip } from '@/components/ui/tooltip'
import SkillTagModal from '@/components/community/SkillTagModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { templateFor } from '@/components/community/boardTemplates'
import { BOARD_CATEGORY_TIPS } from '@/components/community/boardMeta'
import { useBoardCategories } from '@/hooks/useBoardCategories'
import { getSkillIconUrl } from '@/lib/skillIconMap'
import { useBoardStore } from '@/stores/boardStore'
import { alertStore } from '@/stores/alertStore'
import api from '@/lib/api'
import type { SkillTag, Attachment } from '@/types'
import 'react-quill-new/dist/quill.snow.css'

// SSR 비활성화 — Quill은 browser-only
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// 백엔드와 반드시 같은 값이어야 한다.
//   용량  : application.yml  spring.servlet.multipart.max-file-size / max-request-size
//   확장자: FileStorageService.ALLOWED_EXTENSIONS
// 한쪽만 바꾸면 "FO는 통과했는데 서버가 거부"하는 원인 불명 실패가 된다.
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_EXTENSIONS: readonly string[] = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'csv', 'hwp', 'hwpx', 'zip',
]
// accept는 OS 파일 선택창의 1차 필터일 뿐 우회 가능하므로, 실제 차단은 아래 검증 로직이 한다.
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')

type BoardCategory = 'board' | 'qna'

interface Props {
  boardCategory: BoardCategory
}

function isHtmlEmpty(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, '').trim() === ''
}

/**
 * 태그를 벗기고 공백을 눌러 정규화한 본문 텍스트.
 *
 * "주입한 양식을 사용자가 손댔는지"를 HTML 문자열끼리 비교해서는 판정할 수 없다 —
 * Quill은 넘겨준 HTML을 자기 방식으로 다시 써서(속성 순서·빈 태그·클래스) onChange로
 * 돌려주므로, 아무것도 건드리지 않아도 원본과 문자열이 달라진다.
 * 눈에 보이는 텍스트로 비교하면 그 정규화 차이를 흡수하면서, 양식 빈칸을 채우는 순간
 * 텍스트가 달라져 "사용자가 썼다"를 정확히 잡아낸다.
 */
function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function extensionOf(fileName: string): string {
  const idx = fileName.lastIndexOf('.')
  return idx === -1 ? '' : fileName.slice(idx + 1).toLowerCase()
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
  const [categoryCd, setCategoryCd] = useState<number | null>(boardData.categoryCd)
  // 작성 중인 내용이 있을 때 양식을 덧붙일지 물어보는 확인 창 (덮어쓰기 사고 방지)
  const [templateConfirm, setTemplateConfirm] = useState<{ open: boolean; html: string }>({ open: false, html: '' })
  // 마지막으로 주입한 양식의 본문 텍스트(plainText). 현재 내용이 이것과 같으면
  // "사용자가 아직 손대지 않았다"는 뜻이라 카테고리를 바꿀 때 안심하고 치울 수 있다.
  // 빈칸을 하나라도 채우면 텍스트가 달라져 사용자 글로 취급된다.
  const injectedTemplateRef = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categories = useBoardCategories()

  // 수정 모드: editSq > 0이면 PUT, 아니면 POST
  const isEdit = editSq > 0
  // 기술태그는 QnA에서만 노출 (Vue 원본 isQna/skillActive 대응)
  const isQna = boardCategory === 'qna'
  // 카테고리는 일반게시판에만 있는 축이다 (백엔드도 1401 외에는 값을 무시한다)
  const isBoard = boardCategory === 'board'

  useEffect(() => {
    return () => { resetBoard() }
  }, [resetBoard])

  /**
   * 카테고리 변경 시 기본 양식 처리.
   *
   * 판단 기준은 "카테고리가 바뀌었는지"가 아니라 **"지금 내용이 사용자가 쓴 것인지"**다.
   * 카테고리가 바뀌면 무조건 비우면 사용자가 쓴 글이 날아가고, 무조건 남기면 안 쓰는
   * 양식이 계속 따라다닌다. 그래서 주입한 양식 원문을 기억해 두고 그것과 똑같으면
   * "아직 손대지 않은 껍데기"로 보고 버린다.
   *
   *  - 내용이 비었거나 손대지 않은 양식 → 새 카테고리의 양식으로 교체(없으면 비움)
   *  - 사용자가 쓴 내용이 있음 → 보존. 새 카테고리에 양식이 있으면 확인받고 덧붙인다
   *  - 수정 모드 → 주입도 제거도 하지 않는다 (기존 글에 손대면 사고다)
   */
  const onCategoryChange = (raw: string) => {
    const next = raw === '' ? null : Number(raw)
    setCategoryCd(next)
    if (isEdit) return

    const tpl = templateFor(next)
    const untouched = isHtmlEmpty(description) || plainText(description) === injectedTemplateRef.current

    if (untouched) {
      setDescription(tpl ?? '')
      injectedTemplateRef.current = tpl === null ? null : plainText(tpl)
      return
    }
    if (tpl) setTemplateConfirm({ open: true, html: tpl })
  }

  const addTag = (val: string) => {
    const tag = val.trim()
    if (tag && !normalTags.includes(tag)) setNormalTags((prev) => [...prev, tag])
    setTagInput('')
  }

  const removeTag = (tag: string) => setNormalTags((prev) => prev.filter((t) => t !== tag))

  const removeSkillTag = (sq: number) => setSkillTags((prev) => prev.filter((t) => t.skillTagSq !== sq))

  // 제출 시점이 아니라 선택 시점에 걸러낸다 — 글을 다 쓰고 등록을 눌렀을 때 실패하면 UX가 나쁘다.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = '' // 같은 파일을 지웠다 다시 고를 수 있게 초기화
    if (picked.length === 0) return

    const accepted: File[] = []
    const rejected: string[] = []
    // 기존 첨부(existingAttachments)는 응답에 용량이 없어 합계에 넣지 못한다.
    // 그래서 합계 한도는 신규 파일 기준이며, 최종 방어선은 백엔드 max-request-size다.
    let total = newFiles.reduce((sum, f) => sum + f.size, 0)

    for (const file of picked) {
      const ext = extensionOf(file.name)
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        rejected.push(`${file.name}(지원하지 않는 형식)`)
      } else if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name}(파일당 ${formatBytes(MAX_FILE_SIZE)} 초과)`)
      } else if (total + file.size > MAX_TOTAL_SIZE) {
        rejected.push(`${file.name}(전체 ${formatBytes(MAX_TOTAL_SIZE)} 초과)`)
      } else if (newFiles.some((f) => f.name === file.name && f.size === file.size)) {
        rejected.push(`${file.name}(이미 첨부됨)`)
      } else {
        total += file.size
        accepted.push(file)
      }
    }

    if (accepted.length > 0) setNewFiles((prev) => [...prev, ...accepted])
    if (rejected.length > 0) {
      const head = rejected.slice(0, 3).join(', ')
      const tail = rejected.length > 3 ? ` 외 ${rejected.length - 3}건` : ''
      alertStore.show(`첨부하지 못한 파일: ${head}${tail}`, 'danger')
    }
  }

  const totalNewSize = newFiles.reduce((sum, f) => sum + f.size, 0)

  const handleCancel = () => {
    // 새 탭/직접 진입 등으로 히스토리가 없으면 router.back()이 무반응이므로 목록으로 이동한다.
    if (typeof window !== 'undefined' && window.history.length > 1) router.back()
    else router.push(`/${boardCategory}`)
  }

  const handleSubmit = async () => {
    if (isBoard && categoryCd === null) { alertStore.show('카테고리를 선택해주세요.', 'danger'); return }
    if (!ttl.trim()) { alertStore.show('제목을 입력해주세요.', 'danger'); return }
    if (isHtmlEmpty(description)) { alertStore.show('내용을 입력해주세요.', 'danger'); return }
    // 선택 시점에 이미 걸렀지만, 상태가 다른 경로로 채워졌을 경우를 대비한 최종 확인
    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE) {
        alertStore.show(`${f.name}의 크기가 ${formatBytes(MAX_FILE_SIZE)}를 초과합니다.`, 'danger')
        return
      }
    }
    if (totalNewSize > MAX_TOTAL_SIZE) {
      alertStore.show(`첨부파일 전체 용량이 ${formatBytes(MAX_TOTAL_SIZE)}를 초과합니다.`, 'danger')
      return
    }

    const formData = new FormData()
    formData.append('ttl', ttl)
    formData.append('description', description)
    // Vue 원본과 동일하게 콤마조인 단일 필드로 전송 — 빈 배열이어도 필드가 존재해야 백엔드 null(NPE) 방지
    if (isBoard && categoryCd !== null) formData.append('categoryCd', String(categoryCd))
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
    } catch (err) {
      // 확장자 거부·용량 초과는 백엔드가 한글 사유를 내려주므로 그대로 보여준다.
      // (일괄 '실패하였습니다'로 덮으면 사용자가 원인을 알 수 없다)
      const serverMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      alertStore.show(serverMessage || '게시글 등록에 실패하였습니다.', 'danger')
    }
  }

  return (
    <div className="space-y-4">
      {/* 카테고리 — 일반게시판 전용 */}
      {isBoard && (
        <div>
          <div className="mb-1 flex items-center gap-2">
            <label className="text-sm font-medium" htmlFor="board-category">
              카테고리 <span className="text-destructive">*</span>
            </label>
            <InfoTooltip label="카테고리 안내">
              <p className="font-semibold">카테고리</p>
              <ul className="mt-1 space-y-1">
                {categories.map((c) => (
                  <li key={c.commonCodeSq}>
                    · <span className="font-medium">{c.commonCodeNm}</span>
                    {BOARD_CATEGORY_TIPS[c.commonCodeSq] ? ` — ${BOARD_CATEGORY_TIPS[c.commonCodeSq]}` : ''}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5">목록에서 카테고리별로 모아 볼 수 있습니다.</p>
            </InfoTooltip>
          </div>
          <select
            id="board-category"
            value={categoryCd === null ? '' : String(categoryCd)}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm sm:w-48"
          >
            {/* 필수 항목이라 빈 값은 선택할 수 없다. 초기 상태 표시용으로만 남긴다 */}
            <option value="" disabled>카테고리를 선택하세요</option>
            {categories.map((c) => (
              <option key={c.commonCodeSq} value={c.commonCodeSq}>{c.commonCodeNm}</option>
            ))}
          </select>
          {categoryCd !== null && BOARD_CATEGORY_TIPS[categoryCd] && (
            <p className="mt-1 text-xs text-muted-foreground">{BOARD_CATEGORY_TIPS[categoryCd]}</p>
          )}
        </div>
      )}

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
          <InfoTooltip label="태그 작성법 안내">
            <p className="font-semibold">태그 작성법</p>
            <ul className="mt-1 space-y-0.5">
              <li>· 태그를 입력하고 <span className="font-medium">엔터</span>를 누르면 추가됩니다.</li>
              <li>· 태그의 # 는 자동으로 붙으므로 입력하지 않아도 됩니다.</li>
              <li>· 같은 태그는 중복으로 추가되지 않습니다.</li>
              <li>· 태그 옆 × 를 누르면 삭제됩니다.</li>
            </ul>
            {isQna && (
              <p className="mt-1.5">기술 태그는 &lsquo;기술 태그 선택하기&rsquo;에서 목록으로 고릅니다.</p>
            )}
          </InfoTooltip>
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
        <div className="mb-1 flex items-center gap-2">
          <label className="text-sm font-medium">첨부파일</label>
          <InfoTooltip label="첨부파일 제한 안내">
            <p className="font-semibold">첨부 제한</p>
            <ul className="mt-1 space-y-0.5">
              <li>· 파일당 최대 {formatBytes(MAX_FILE_SIZE)}</li>
              <li>· 전체 합계 최대 {formatBytes(MAX_TOTAL_SIZE)}</li>
            </ul>
            <p className="mt-1.5 font-semibold">가능한 형식</p>
            <p className="mt-0.5 break-keep">
              이미지(jpg·png·gif·webp·bmp·svg), 문서(pdf·doc·docx·xls·xlsx·ppt·pptx·txt·csv·hwp·hwpx), 압축(zip)
            </p>
          </InfoTooltip>
        </div>

        {/* 기본 file input은 브라우저마다 모양이 달라 숨기고, 버튼으로 대신 연다 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="mr-1 h-3.5 w-3.5" />
            파일 선택
          </Button>
          <span className="text-xs text-muted-foreground">
            {newFiles.length === 0 && existingAttachments.length === 0
              ? '선택된 파일이 없습니다.'
              : `${existingAttachments.length + newFiles.length}개 선택됨${
                  newFiles.length > 0 ? ` · 신규 ${formatBytes(totalNewSize)} / ${formatBytes(MAX_TOTAL_SIZE)}` : ''
                }`}
          </span>
        </div>

        <ul className="mt-2 space-y-1 text-sm">
          {existingAttachments.map((a, i) => (
            <li key={a.fileSq} className="flex items-center gap-2">
              <span className="min-w-0 truncate">{a.fileOriginalNm}</span>
              <span className="shrink-0 text-xs text-muted-foreground">기존</span>
              <button
                type="button"
                aria-label={`${a.fileOriginalNm} 첨부 삭제`}
                onClick={() => setExistingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </li>
          ))}
          {newFiles.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-2">
              <span className="min-w-0 truncate">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(f.size)}</span>
              <button
                type="button"
                aria-label={`${f.name} 첨부 삭제`}
                onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
              >
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

      <ConfirmDialog
        open={templateConfirm.open}
        title="기본 양식 추가"
        message="이미 작성한 내용이 있습니다. 아래에 기본 양식을 추가하시겠습니까?"
        onConfirm={() => {
          setDescription((prev) => prev + templateConfirm.html)
          // 사용자 글 + 양식이 섞였으니 더는 "손대지 않은 양식"이 아니다 —
          // 이후 카테고리를 바꿔도 이 내용을 지우면 안 된다.
          injectedTemplateRef.current = null
          setTemplateConfirm({ open: false, html: '' })
        }}
        onClose={() => setTemplateConfirm({ open: false, html: '' })}
      />

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
