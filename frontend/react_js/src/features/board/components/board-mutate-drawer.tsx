// [Freelancer Service]
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Paperclip, X } from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { toast } from 'sonner'
// Hash 아이콘 추가
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
// 1. [에러 해결] boardApi와 AdminBoard로 임포트 변경
import { ConfirmDialog } from '@/components/confirm-dialog'
import { boardApi } from '../api/board-api'
import {
  templateFor,
  isHtmlEmpty,
  plainText,
} from '../data/board-templates'
import { type AdminBoard } from '../data/schema'
import { SkillTagSelectModal } from './skill-tag-select-modal'

interface Attachment {
  fileSq: number
  fileOriginalNm: string
}

interface SkillTag {
  skillTagSq: number
  skillTagNm: string
}

// 카테고리 코드 목록. FO는 공통코드 API를 쓰지만 BO 작성 폼은 한 곳뿐이라 상수로 둔다.
// 3202 '일반'은 제외됐다(공통코드에서도 비활성) — 게시판 이름이 "일반 게시판"이라 중복된다.
const CATEGORY_OPTIONS = [
  { value: '3201', label: '자유' },
  { value: '3203', label: '현장정보' },
  { value: '3204', label: '기능요청' },
  { value: '3205', label: '정보' },
]

const schema = z.object({
  boardTypeCd: z.string().optional(),
  categoryCd: z.string().optional(),
  title: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '제목을 입력해주세요.')
    .refine((val) => val.length <= 100, '제목은 100자 이내로 입력해주세요.'),
  description: z.string().refine((val) => {
    const stripped = val.replace(/<[^>]*>?/gm, '').trim()
    return stripped.length > 0
  }, '내용을 입력해주세요.'),
})

type BoardForm = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: AdminBoard
  parentBoardSq?: number
}

export function BoardMutateDrawer({ open, onOpenChange, currentRow, parentBoardSq }: Props) {
  const isAnswerMode = parentBoardSq !== undefined
  const isUpdate = !!currentRow

  const [normalTags, setNormalTags] = useState<string[]>([])
  const [skillTags, setSkillTags] = useState<SkillTag[]>([]) // string[] 아님
  const [files, setFiles] = useState<File[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [skillTagModalOpen, setSkillTagModalOpen] = useState(false)
  // 작성 중인 내용이 있을 때 양식을 덧붙일지 물어보는 확인 창 (덮어쓰기 사고 방지)
  const [templateConfirm, setTemplateConfirm] = useState<{
    open: boolean
    html: string
  }>({ open: false, html: '' })
  // 마지막으로 주입한 양식의 본문 텍스트. 현재 내용이 이것과 같으면 "아직 손대지 않은
  // 껍데기"라는 뜻이라 카테고리를 바꿀 때 안심하고 치울 수 있다.
  const injectedTemplateRef = useRef<string | null>(null)

  const { register, handleSubmit, setValue, watch, reset } = useForm<BoardForm>(
    {
      resolver: zodResolver(schema),
      // 카테고리는 필수라 미선택 상태를 두지 않고 '자유'로 시작한다
      defaultValues: { boardTypeCd: '1401', categoryCd: '3201' }, // 기본값 일반게시글·자유
    }
  )

  const descriptionContent = watch('description')
  const boardTypeCdValue = watch('boardTypeCd') // 유형 모니터링
  const categoryCdValue = watch('categoryCd')

  const removeNormalTag = (index: number) => {
    setNormalTags((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * 카테고리 변경 시 기본 양식 처리. FO BoardPostForm 의 규칙을 그대로 옮겼다.
   *
   * 판단 기준은 "카테고리가 바뀌었는지"가 아니라 "지금 내용이 사용자가 쓴 것인지"다.
   *  - 내용이 비었거나 손대지 않은 양식 → 새 카테고리의 양식으로 교체(없으면 비움)
   *  - 사용자가 쓴 내용이 있음 → 보존. 새 카테고리에 양식이 있으면 확인받고 덧붙인다
   *  - 수정 모드 → 주입도 제거도 하지 않는다 (관리자가 남의 글을 건드리면 사고다)
   */
  const onCategoryChange = (val: string) => {
    setValue('categoryCd', val)
    if (isUpdate) return

    const tpl = templateFor(val)
    const current = descriptionContent ?? ''
    const untouched =
      isHtmlEmpty(current) || plainText(current) === injectedTemplateRef.current

    if (untouched) {
      setValue('description', tpl ?? '')
      injectedTemplateRef.current = tpl === null ? null : plainText(tpl)
      return
    }
    if (tpl) setTemplateConfirm({ open: true, html: tpl })
  }

  // 확인 창에서 '추가'를 고른 경우 — 쓰던 내용 아래에 양식을 덧붙인다.
  // 덧붙인 결과는 사용자 글과 섞였으므로 "손대지 않은 껍데기" 추적을 포기한다(ref 초기화).
  const appendTemplate = () => {
    setValue('description', `${descriptionContent ?? ''}${templateConfirm.html}`)
    injectedTemplateRef.current = null
    setTemplateConfirm({ open: false, html: '' })
  }
  useEffect(() => {
    const fetchDetail = async () => {
      if (!currentRow?.sq || !currentRow.boardTypeCd) return

      try {
        setIsFetching(true)
        const response = await boardApi.getBoardDetail(
          currentRow.sq,
          currentRow.boardTypeCd
        )
        const detail = response.output

        reset({
          boardTypeCd: String(detail.boardTypeCd),
          // 카테고리 도입 전 글은 null 일 수 있다 — 필수 항목이므로 '자유'로 채워 보여준다
          categoryCd: detail.boardCategoryCd ? String(detail.boardCategoryCd) : '3201',
          title: detail.ttl,
          description: detail.description || '',
        })
        setNormalTags(detail.normalTags || [])
        if (detail.skillTags) {
          setSkillTags(detail.skillTags as unknown as SkillTag[])
        }
        setAttachments(detail.attachments || [])
      } catch (_) {
        toast.error('데이터를 불러오는데 실패했습니다.')
        onOpenChange(false)
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      if (isUpdate) fetchDetail()
      else {
        reset({
          boardTypeCd: isAnswerMode ? '1404' : '1401',
          categoryCd: '3201',
          title: '',
          description: '',
        })
        setNormalTags([])
        setSkillTags([])
        setFiles([])
        setAttachments([])
        // 새 글이므로 이전 세션에서 주입했던 양식 기억은 버린다
        injectedTemplateRef.current = null
      }
    }
  }, [open, isUpdate, isAnswerMode, currentRow, reset])

  // 태그 추가 로직 (일반/기술 공통 사용 가능하도록 리팩토링 가능)
  const addNormalTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!normalTags.includes(newTag)) setNormalTags([...normalTags, newTag])
      e.currentTarget.value = ''
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // 기존 파일에 새로 선택한 파일들을 추가하여 상태 업데이트
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
      e.target.value = '' // 같은 파일 재선택 가능하도록 초기화
    }
  }

  // const addSkillTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter' && e.currentTarget.value.trim()) {
  //     e.preventDefault()
  //     const newTag = e.currentTarget.value.trim()
  //     if (!skillTags.includes(newTag)) setSkillTags([...skillTags, newTag])
  //     e.currentTarget.value = ''
  //   }
  // }

  const onSubmit = async (data: BoardForm) => {
    try {
      const formData = new FormData()
      formData.append('ttl', data.title)
      formData.append('description', data.description)
      // 백엔드는 일반게시글(1401) 외에는 카테고리를 무시하지만, 빈 문자열을 보내면
      // Long 변환 실패로 400 이 되므로 값이 있을 때만 싣는다.
      if (data.categoryCd) {
        formData.append('categoryCd', data.categoryCd)
      }

      // 일반 태그: List<String>
      normalTags.forEach((tag) => formData.append('normalTags', tag))

      skillTags.forEach((tag, index) => {
        formData.append(
          `skillTags[${index}].skillTagSq`,
          String(tag.skillTagSq)
        )
        formData.append(`skillTags[${index}].skillTagNm`, tag.skillTagNm)
      })

      files.forEach((file) => formData.append('files', file))

      if (isUpdate && currentRow) {
        attachments.forEach((att) =>
          formData.append('attachments', att.fileSq.toString())
        )
        await boardApi.updateBoard(
          currentRow.sq,
          isAnswerMode ? 1404 : Number(data.boardTypeCd),
          formData
        )
        toast.success(isAnswerMode ? '답변이 수정되었습니다.' : '게시글이 수정되었습니다.')
      } else if (isAnswerMode) {
        formData.append('boardSq', String(parentBoardSq))
        await boardApi.createAnswer(formData)
        toast.success('답변이 등록되었습니다.')
      } else {
        await boardApi.createBoard(Number(data.boardTypeCd), formData)
        toast.success('새 게시글이 등록되었습니다.')
      }

      onOpenChange(false)
      if (!isAnswerMode) setTimeout(() => window.location.reload(), 500)
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
            <p className='text-sm text-muted-foreground'>데이터 로딩 중...</p>
          </div>
        ) : (
          <>
            <SheetHeader className='text-left'>
              <SheetTitle>
                {isAnswerMode
                  ? isUpdate ? '답변 수정' : '답변 작성'
                  : isUpdate ? '게시글 수정' : '게시글 작성'}
              </SheetTitle>
              <SheetDescription>
                내용을 입력하고 태그를 분류해주세요.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-6'>
              {/* 게시글 유형 선택 (답변 모드에서는 숨김) */}
              {!isAnswerMode && (
              <div className='space-y-2'>
                <Label>게시글 유형</Label>
                <Select
                  value={boardTypeCdValue}
                  onValueChange={(val) => setValue('boardTypeCd', val)}
                  disabled={isUpdate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='유형 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1401'>일반 게시글</SelectItem>
                    <SelectItem value='1402'>Q&A 질문</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* 카테고리 — 일반 게시글에만 있는 축이다 */}
              {!isAnswerMode && boardTypeCdValue === '1401' && (
                <div className='space-y-2'>
                  <Label>카테고리 <span className='text-destructive'>*</span></Label>
                  <Select
                    value={categoryCdValue}
                    onValueChange={onCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='카테고리 선택' />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 제목/내용 필드는 사용자님 기존 코드와 동일 */}
              <div className='space-y-2'>
                <Label htmlFor='title'>제목</Label>
                <Input
                  id='title'
                  {...register('title')}
                  placeholder='제목을 입력하세요.'
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
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>일반 태그</Label>
                <Input
                  placeholder='일반 태그 입력 후 엔터'
                  onKeyDown={addNormalTag}
                />
                <div className='mt-2 flex flex-wrap gap-2'>
                  {normalTags.map((tag, index) => (
                    <Badge
                      key={`${tag}-${index}`} // 중복 태그 대비 고유 키 설정
                      variant='secondary'
                      className='gap-1 pr-1'
                    >
                      #{tag}
                      {/* Lucide 아이콘 대신 버튼으로 감싸서 클릭 영역 확보 */}
                      <button
                        type='button' // 중요: 폼 제출 방지
                        className='ml-1 rounded-full p-0.5 transition-colors outline-none hover:bg-slate-200'
                        onClick={(e) => {
                          e.preventDefault()
                          removeNormalTag(index)
                        }}
                      >
                        <X size={12} className='text-muted-foreground' />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {boardTypeCdValue === '1402' && (
                <div className='space-y-2'>
                  <Label className='font-bold text-orange-600'>
                    기술 태그 (Skill Tags)
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setSkillTagModalOpen(true)}
                  >
                    기술 태그 선택
                  </Button>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {skillTags.map((tag, index) => (
                      <Badge
                        key={`${tag.skillTagSq}-${index}`}
                        className='gap-1 bg-orange-400 pr-1'
                      >
                        {tag.skillTagNm}
                        <button
                          type='button'
                          className='ml-1 rounded-full p-0.5 transition-colors outline-none hover:bg-orange-500'
                          onClick={(e) => {
                            e.preventDefault()
                            setSkillTags((prev) => prev.filter((_, i) => i !== index))
                          }}
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <SkillTagSelectModal
                    open={skillTagModalOpen}
                    selected={skillTags}
                    onClose={() => setSkillTagModalOpen(false)}
                    onConfirm={(skills) => setSkillTags(skills)}
                  />
                </div>
              )}

              <div className='space-y-2'>
                <Label>첨부파일</Label>
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
                  <Paperclip className='mr-2 h-4 w-4' /> 파일 선택
                </Button>

                <div className='mt-3 space-y-2'>
                  {/* 기존 서버 파일 */}
                  {attachments.map((att) => (
                    <div
                      key={att.fileSq}
                      className='flex items-center justify-between rounded border border-blue-100 bg-blue-50 p-2 text-sm'
                    >
                      <span className='truncate font-medium text-blue-700'>
                        [서버] {att.fileOriginalNm}
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

                  {/* 신규 선택 파일: 사용자님이 요청하신 '등록 후 보이지 않는 문제' 해결 */}
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className='flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-2 text-sm'
                    >
                      <div className='flex items-center gap-2 truncate'>
                        <Paperclip className='h-3 w-3 text-muted-foreground' />
                        <span className='truncate'>{file.name}</span>
                        <Badge
                          variant='outline'
                          className='h-4 px-1 text-[10px]'
                        >
                          New
                        </Badge>
                      </div>
                      <X
                        className='h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive'
                        onClick={() =>
                          setFiles(files.filter((_, idx) => idx !== i))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <SheetFooter>
                <Button type='submit'>
                  {isUpdate ? '수정완료' : '등록하기'}
                </Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>

      {/* 쓰던 내용이 있는데 양식이 있는 카테고리로 바꿨을 때 — 덮어쓰지 않고 물어본다 */}
      <ConfirmDialog
        open={templateConfirm.open}
        onOpenChange={(v) =>
          setTemplateConfirm((prev) => ({ ...prev, open: v }))
        }
        title='기본 양식 추가'
        desc='이미 작성한 내용이 있습니다. 아래에 기본 양식을 추가하시겠습니까?'
        cancelBtnText='취소'
        confirmText='추가'
        handleConfirm={appendTemplate}
      />
    </Sheet>
  )
}
