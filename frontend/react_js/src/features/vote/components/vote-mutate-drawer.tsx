import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { voteApi } from '../api/vote-api'
import { VOTE_CATEGORIES } from '../data/vote-category'
import { type AdminVote } from '../data/schema'

const schema = z.object({
  voteCategoryCd: z.string().optional(),
  voteTtl: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, '제목을 입력해주세요.')
    .refine((val) => val.length <= 100, '제목은 100자 이내로 입력해주세요.'),
  voteDescriptionEdt: z.string().optional(),
  voteEndDt: z.string().refine((val) => val.trim().length > 0, '마감 일시를 선택해주세요.'),
})

type VoteForm = z.infer<typeof schema>

// datetime-local input은 "YYYY-MM-DDTHH:mm"을 그대로 주고받는다 — FO VoteCreateForm과 동일하게
// 백엔드 LocalDateTime이 이 형식을 초 단위 없이도 그대로 파싱하므로 변환이 필요 없다.
function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: AdminVote
}

export function VoteMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const [options, setOptions] = useState<string[]>(['', ''])
  const [ballotCnt, setBallotCnt] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  const { register, handleSubmit, setValue, watch, reset } = useForm<VoteForm>({
    resolver: zodResolver(schema),
    defaultValues: { voteCategoryCd: '', voteTtl: '', voteDescriptionEdt: '', voteEndDt: '' },
  })

  const categoryCdValue = watch('voteCategoryCd')

  // 참여자가 이미 있으면 선택지 자체를 수정할 수 없다(사용자 확정 정책 — 결과 집계 무결성 보호).
  const optionsLocked = isUpdate && ballotCnt > 0

  useEffect(() => {
    const fetchDetail = async () => {
      if (!currentRow?.voteSq) return
      try {
        setIsFetching(true)
        const response = await voteApi.getVoteDetail(currentRow.voteSq)
        const detail = response.output
        reset({
          voteCategoryCd: detail.voteCategoryCd ? String(detail.voteCategoryCd) : '',
          voteTtl: detail.voteTtl,
          voteDescriptionEdt: detail.voteDescriptionEdt ?? '',
          voteEndDt: toDatetimeLocal(detail.voteEndDt),
        })
        setOptions(
          (detail.options ?? [])
            .slice()
            .sort((a, b) => a.voteOptionOrder - b.voteOptionOrder)
            .map((o) => o.voteOptionNm)
        )
        setBallotCnt(detail.totalVoteCnt ?? 0)
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
        reset({ voteCategoryCd: '', voteTtl: '', voteDescriptionEdt: '', voteEndDt: '' })
        setOptions(['', ''])
        setBallotCnt(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isUpdate, currentRow])

  const addOption = () => setOptions((prev) => [...prev, ''])
  const removeOption = (idx: number) =>
    setOptions((prev) => prev.filter((_, i) => i !== idx))
  const changeOption = (idx: number, value: string) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)))

  const onSubmit = async (data: VoteForm) => {
    if (!data.voteCategoryCd) {
      toast.error('카테고리를 선택해주세요.')
      return
    }
    // 서버(VoteService.createVote)가 과거 마감 일시를 400 으로 거절하는데, 이 화면은 실패 사유를
    // 그대로 못 보여주고 일반 실패 문구만 띄우므로 등록 시에는 미리 안내한다.
    if (!isUpdate && new Date(data.voteEndDt).getTime() <= Date.now()) {
      toast.error('마감 일시는 현재 이후여야 합니다.')
      return
    }
    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o.length > 0)
    if (!optionsLocked && trimmedOptions.length < 2) {
      toast.error('선택지는 2개 이상 입력해주세요.')
      return
    }

    try {
      const payload = {
        voteTtl: data.voteTtl,
        voteDescriptionEdt: data.voteDescriptionEdt?.trim() || null,
        voteCategoryCd: Number(data.voteCategoryCd),
        voteEndDt: data.voteEndDt,
        ...(optionsLocked ? {} : { options: trimmedOptions }),
      }

      if (isUpdate && currentRow) {
        await voteApi.updateVote(currentRow.voteSq, payload)
        toast.success('투표가 수정되었습니다.')
      } else {
        await voteApi.createVote(payload)
        toast.success('새 투표가 등록되었습니다.')
      }

      onOpenChange(false)
      setTimeout(() => window.location.reload(), 500)
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
              <SheetTitle>{isUpdate ? '투표 수정' : '투표 등록'}</SheetTitle>
              <SheetDescription>
                제목·카테고리·마감 일시와 선택지를 입력해주세요.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-6'>
              <div className='space-y-2'>
                <Label>
                  카테고리 <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={categoryCdValue}
                  onValueChange={(val) => setValue('voteCategoryCd', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='카테고리 선택' />
                  </SelectTrigger>
                  <SelectContent>
                    {VOTE_CATEGORIES.map((c) => (
                      <SelectItem key={c.code} value={String(c.code)}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='voteTtl'>제목</Label>
                <Input
                  id='voteTtl'
                  {...register('voteTtl')}
                  placeholder='투표 제목을 입력하세요.'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='voteDescriptionEdt'>설명 (선택)</Label>
                <Textarea
                  id='voteDescriptionEdt'
                  {...register('voteDescriptionEdt')}
                  placeholder='투표에 대한 부연 설명을 입력해주세요.'
                  rows={4}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='voteEndDt'>마감 일시</Label>
                <Input id='voteEndDt' type='datetime-local' {...register('voteEndDt')} />
              </div>

              <div className='space-y-2'>
                <Label>
                  선택지 (2개 이상)
                  {optionsLocked && (
                    <span className='ml-2 text-xs font-normal text-muted-foreground'>
                      참여자가 {ballotCnt}명 있어 수정할 수 없습니다.
                    </span>
                  )}
                </Label>
                <div className='space-y-2'>
                  {options.map((opt, idx) => (
                    <div key={idx} className='flex items-center gap-2'>
                      <Input
                        value={opt}
                        disabled={optionsLocked}
                        onChange={(e) => changeOption(idx, e.target.value)}
                        placeholder={`선택지 ${idx + 1}`}
                      />
                      {!optionsLocked && options.length > 2 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeOption(idx)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {!optionsLocked && (
                  <Button type='button' variant='outline' size='sm' onClick={addOption}>
                    <Plus size={14} className='mr-1' /> 선택지 추가
                  </Button>
                )}
              </div>

              <SheetFooter>
                <Button type='submit'>{isUpdate ? '수정완료' : '등록하기'}</Button>
              </SheetFooter>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
