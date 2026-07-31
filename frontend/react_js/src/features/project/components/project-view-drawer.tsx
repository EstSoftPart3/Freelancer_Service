import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { projectApi } from '../api/project-api'
import {
  RECRUIT_STATUS_LABEL,
  type AdminProject,
  type AdminProjectDetail,
  type AdminProjectUpdate,
} from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AdminProject
  onSaved: () => void
}

/** yyyy-MM-dd 로 자른다 — date input 이 그 형식만 받는다 */
function toDateInput(v?: string | null) {
  if (!v) return ''
  return v.slice(0, 10)
}

/**
 * 프로젝트 상세 + 수정.
 *
 * <p>주소·기술태그·모집직군은 <b>읽기 전용</b>이다. 주소는 좌표·지역코드가 함께 움직여야 하고
 * (지도 검색과 거리 계산이 그 값을 쓴다), 태그·직군은 별도 테이블이라 하나만 바꾸면
 * 검색 필터에서 사라지는 공고가 된다. 그쪽은 등록자가 FO 에서 고치는 것이 안전하다.</p>
 */
export function ProjectViewDrawer({
  open,
  onOpenChange,
  currentRow,
  onSaved,
}: Props) {
  const [detail, setDetail] = useState<AdminProjectDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<AdminProjectUpdate>({})

  useEffect(() => {
    if (!open) return
    let alive = true
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await projectApi.getProjectDetail(currentRow.projectSq)
        if (!alive) return
        const d = res.output
        setDetail(d)
        setForm({
          projectTtl: d.projectTtl ?? '',
          projectSalary: d.projectSalary ?? null,
          salaryNegotiableYn: d.salaryNegotiableYn ?? 'N',
          recruitStartDt: toDateInput(d.recruitStartDt),
          recruitEndDt: toDateInput(d.recruitEndDt),
          projectStartDt: toDateInput(d.projectStartDt),
          projectEndDt: toDateInput(d.projectEndDt),
          descriptionTxt: d.descriptionTxt ?? '',
          preferenceTxt: d.preferenceTxt ?? '',
        })
      } catch (_) {
        toast.error('프로젝트 상세를 불러오지 못했습니다.')
      } finally {
        if (alive) setIsLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [open, currentRow.projectSq])

  const handleSave = async () => {
    if (!form.projectTtl?.trim()) {
      toast.error('프로젝트명을 입력해주세요.')
      return
    }
    try {
      setIsSaving(true)
      // 단가와 '협의 가능'은 함께 성립한다 — "300만원 (협의가능)" 같은 공고가 실제로 있다.
      // 서버 @Positive 는 값이 있을 때만 검사하므로 비워 두는 것도 그대로 통과한다.
      await projectApi.updateProject(currentRow.projectSq, form)
      toast.success('프로젝트가 수정되었습니다.')
      onSaved()
      onOpenChange(false)
    } catch (err) {
      // 날짜 규칙 위반은 서버가 한글 사유를 400 으로 내려준다 — 그대로 보여준다.
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      toast.error(msg || '수정에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const status = RECRUIT_STATUS_LABEL[detail?.recruitStatus ?? '']

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex w-full flex-col gap-0 overflow-y-auto sm:max-w-2xl'>
        <SheetHeader className='space-y-1'>
          <div className='flex items-center gap-2'>
            {status && (
              <Badge className={`${status.color} border-none text-white`}>
                {status.label}
              </Badge>
            )}
            {detail?.isDeletedYn === 'Y' && (
              <Badge variant='outline' className='text-muted-foreground'>
                삭제됨
              </Badge>
            )}
          </div>
          <SheetTitle className='text-start text-lg'>
            {currentRow.projectTtl}
          </SheetTitle>
          <p className='text-start text-xs text-muted-foreground'>
            {detail?.companyNm ?? '-'}
            {detail?.userId ? ` (${detail.userId})` : ''} · 조회 {detail?.viewCnt ?? 0} ·
            스크랩 {detail?.scrapCnt ?? 0} · 지원 {detail?.applicationCnt ?? 0}건
          </p>
        </SheetHeader>

        <Separator className='my-4' />

        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-primary' />
          </div>
        ) : (
          <div className='space-y-4 px-1 pb-8'>
            <div>
              <Label htmlFor='p-ttl'>프로젝트명</Label>
              <Input
                id='p-ttl'
                className='mt-1'
                value={form.projectTtl ?? ''}
                onChange={(e) => setForm({ ...form, projectTtl: e.target.value })}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label htmlFor='p-recruit-start'>모집 시작</Label>
                <Input
                  id='p-recruit-start'
                  type='date'
                  className='mt-1'
                  value={form.recruitStartDt ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, recruitStartDt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='p-recruit-end'>모집 종료</Label>
                <Input
                  id='p-recruit-end'
                  type='date'
                  className='mt-1'
                  value={form.recruitEndDt ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, recruitEndDt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='p-start'>수행 시작</Label>
                <Input
                  id='p-start'
                  type='date'
                  className='mt-1'
                  value={form.projectStartDt ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, projectStartDt: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor='p-end'>수행 종료</Label>
                <Input
                  id='p-end'
                  type='date'
                  className='mt-1'
                  value={form.projectEndDt ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, projectEndDt: e.target.value })
                  }
                />
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              모집 종료는 수행 종료보다 늦을 수 없습니다. 수행 중 추가 모집(모집 종료 &gt; 수행 시작)은
              허용됩니다.
            </p>

            <div className='grid grid-cols-[1fr_auto] items-end gap-3'>
              <div>
                <Label htmlFor='p-salary'>단가 (원)</Label>
                <Input
                  id='p-salary'
                  type='number'
                  className='mt-1'
                  value={form.projectSalary ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      projectSalary: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <label className='flex h-9 items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  className='h-4 w-4 accent-primary'
                  checked={form.salaryNegotiableYn === 'Y'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salaryNegotiableYn: e.target.checked ? 'Y' : 'N',
                    })
                  }
                />
                협의 가능
              </label>
            </div>
            <p className='text-xs text-muted-foreground'>
              단가를 적고 &lsquo;협의 가능&rsquo;을 함께 체크할 수 있습니다 (예: 300만원 · 협의 가능).
            </p>

            <div>
              <Label htmlFor='p-desc'>상세 설명</Label>
              <Textarea
                id='p-desc'
                className='mt-1'
                rows={7}
                value={form.descriptionTxt ?? ''}
                onChange={(e) =>
                  setForm({ ...form, descriptionTxt: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor='p-pref'>우대 사항</Label>
              <Textarea
                id='p-pref'
                className='mt-1'
                rows={4}
                value={form.preferenceTxt ?? ''}
                onChange={(e) =>
                  setForm({ ...form, preferenceTxt: e.target.value })
                }
              />
            </div>

            <Separator />

            {/* 읽기 전용 정보 */}
            <div className='rounded-md border bg-muted/30 p-3 text-sm'>
              <p className='mb-1 font-medium'>근무지 (수정 불가)</p>
              <p className='text-muted-foreground'>
                {detail?.address || '주소 없음'} {detail?.detailAddress || ''}
              </p>
              <p className='mt-2 text-xs text-muted-foreground'>
                주소·기술태그·모집직군은 좌표와 검색 색인이 함께 움직여야 해서 관리자 화면에서는
                수정하지 않습니다. 등록자가 서비스 화면에서 수정해야 합니다.
              </p>
            </div>

            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                닫기
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className='mr-1 h-4 w-4 animate-spin' />}
                저장
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
