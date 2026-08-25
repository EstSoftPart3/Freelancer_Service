import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Play, RotateCcw, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  applySeedApi,
  type ApplySeedPlan,
  type ApplySeedProject,
  type ApplySeedStatus,
  type ApplySeedTier,
} from './api/apply-seed-api'

/** 티어별 기본 범위. 서버 기본값과 같아야 화면과 결과가 어긋나지 않는다. */
const DEFAULT_RANGES = {
  hotMin: 15,
  hotMax: 30,
  normalMin: 4,
  normalMax: 12,
  coldMin: 0,
  coldMax: 3,
}

const TIER_LABEL: Record<ApplySeedTier, string> = {
  HOT: '인기',
  NORMAL: '보통',
  COLD: '저조',
}

const TIER_VARIANT: Record<ApplySeedTier, 'default' | 'secondary' | 'outline'> = {
  HOT: 'default',
  NORMAL: 'secondary',
  COLD: 'outline',
}

/**
 * 봇 지원 시드.
 *
 * 흐름은 <b>공고 선택 → 미리보기 → 등록</b> 이고, 언제든 회수로 되돌릴 수 있다.
 * 등록하면 봇 이력서가 없는 계정은 자동으로 이력서가 만들어진다 —
 * 지원 테이블의 resume_sq 가 NOT NULL 이라 이력서 없이는 지원 자체가 불가능하기 때문이다.
 */
export function ApplySeed() {
  const [projects, setProjects] = useState<ApplySeedProject[]>([])
  const [status, setStatus] = useState<ApplySeedStatus | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [ranges, setRanges] = useState(DEFAULT_RANGES)
  const [seed, setSeed] = useState(() => Number(`${new Date().getFullYear()}${new Date().getMonth() + 1}`))
  const [plan, setPlan] = useState<ApplySeedPlan | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, b] = await Promise.all([applySeedApi.projects(), applySeedApi.bots()])
      setProjects(p.output ?? [])
      setStatus(b.output ?? null)
    } catch {
      toast.error('현황을 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  /** 선택이나 옵션이 바뀌면 이전 미리보기는 더 이상 그 입력의 결과가 아니다. */
  const invalidate = () => setPlan(null)

  const targetSqs = useMemo(
    () => (selected.size === 0 ? null : Array.from(selected)),
    [selected]
  )

  const totalBotApplications = useMemo(
    () => projects.reduce((sum, p) => sum + (p.botApplicationCnt ?? 0), 0),
    [projects]
  )

  const toggle = (sq: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(sq)) next.delete(sq)
      else next.add(sq)
      return next
    })
    invalidate()
  }

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === projects.length ? new Set() : new Set(projects.map((p) => p.projectSq))
    )
    invalidate()
  }

  const buildRequest = () => ({ randomSeed: seed, projectSqs: targetSqs, ...ranges })

  const handlePreview = async () => {
    setIsBusy(true)
    try {
      const res = await applySeedApi.preview(buildRequest())
      setPlan(res.output)
      toast.success(`공고 ${res.output.summary.targetProjects}건에 지원 ${res.output.summary.totalApplications}건을 배분했습니다.`)
    } catch {
      toast.error('미리보기에 실패했습니다.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleApply = async () => {
    if (!plan) return
    setApplyOpen(false)
    setIsBusy(true)
    try {
      // plannedAt 을 그대로 실어야 미리보기에서 본 것과 같은 결과가 저장된다.
      const res = await applySeedApi.apply({ ...buildRequest(), plannedAt: plan.plannedAt })
      toast.success(
        `지원 ${res.output.insertedApplications}건 등록 완료` +
          (res.output.createdResumes > 0 ? ` (봇 이력서 ${res.output.createdResumes}건 신규)` : '')
      )
      setPlan(null)
      await load()
    } catch {
      toast.error('등록에 실패했습니다.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleEnsureResumes = async () => {
    setIsBusy(true)
    try {
      const res = await applySeedApi.ensureResumes()
      toast.success(`봇 이력서 ${res.output}건을 생성했습니다.`)
      await load()
    } catch {
      toast.error('이력서 생성에 실패했습니다.')
    } finally {
      setIsBusy(false)
    }
  }

  const handleRevoke = async () => {
    setRevokeOpen(false)
    setIsBusy(true)
    try {
      const res = await applySeedApi.revoke({ projectSqs: targetSqs })
      toast.success(`지원 ${res.output.applications}건을 회수했습니다.`)
      setPlan(null)
      await load()
    } catch {
      toast.error('회수에 실패했습니다.')
    } finally {
      setIsBusy(false)
    }
  }

  const setRange = (key: keyof typeof DEFAULT_RANGES, value: string) => {
    setRanges((prev) => ({ ...prev, [key]: Math.max(0, Number(value) || 0) }))
    invalidate()
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>봇 지원 시드</h2>
            <p className='text-muted-foreground'>
              채용중인 공고에 봇 계정 지원을 붙여 "지원 0건" 상태를 메웁니다. 언제든 회수할 수 있습니다.
            </p>
          </div>
          <Button variant='outline' onClick={() => void load()} disabled={isBusy}>
            <RotateCcw className='mr-2 h-4 w-4' />
            새로고침
          </Button>
        </div>

        {/* ── 봇 현황 ── */}
        <Card className='mb-4'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Users className='h-4 w-4' />
              봇 계정 현황
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap items-center gap-6'>
            <div className='text-sm'>
              전체 <span className='font-semibold'>{status?.totalBots ?? 0}</span>개 · 이력서 보유{' '}
              <span className='font-semibold'>{status?.botsWithResume ?? 0}</span>개 · 미보유{' '}
              <span className='font-semibold text-orange-600'>{status?.botsWithoutResume ?? 0}</span>개
            </div>
            <div className='text-sm text-muted-foreground'>
              현재 붙어 있는 봇 지원 <span className='font-semibold'>{totalBotApplications}</span>건
            </div>
            {(status?.botsWithoutResume ?? 0) > 0 && (
              <Button size='sm' variant='secondary' onClick={() => void handleEnsureResumes()} disabled={isBusy}>
                봇 이력서 생성
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ── 옵션 ── */}
        <Card className='mb-4'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>배분 옵션</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7'>
            <div className='space-y-1'>
              <Label className='text-xs'>랜덤 시드</Label>
              <Input
                type='number'
                value={seed}
                onChange={(e) => {
                  setSeed(Number(e.target.value) || 0)
                  invalidate()
                }}
              />
            </div>
            {(
              [
                ['인기 최소', 'hotMin'],
                ['인기 최대', 'hotMax'],
                ['보통 최소', 'normalMin'],
                ['보통 최대', 'normalMax'],
                ['저조 최소', 'coldMin'],
                ['저조 최대', 'coldMax'],
              ] as const
            ).map(([label, key]) => (
              <div key={key} className='space-y-1'>
                <Label className='text-xs'>{label}</Label>
                <Input type='number' value={ranges[key]} onChange={(e) => setRange(key, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── 공고 목록 ── */}
        <Card className='mb-4'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>
              채용중 공고 {projects.length}건
              <span className='ml-2 text-sm font-normal text-muted-foreground'>
                {selected.size === 0 ? '(선택 없음 — 전체가 대상)' : `(${selected.size}건 선택)`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10'>
                      <Checkbox
                        checked={projects.length > 0 && selected.size === projects.length}
                        onCheckedChange={toggleAll}
                        aria-label='전체 선택'
                      />
                    </TableHead>
                    <TableHead className='w-16'>번호</TableHead>
                    <TableHead>공고명</TableHead>
                    <TableHead>기업</TableHead>
                    <TableHead className='w-28'>모집 마감</TableHead>
                    <TableHead className='w-20 text-right'>조회</TableHead>
                    <TableHead className='w-20 text-right'>지원</TableHead>
                    <TableHead className='w-20 text-right'>봇</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className='py-8 text-center text-muted-foreground'>
                        채용중인 공고가 없습니다. 모집기간이 오늘을 포함해야 대상이 됩니다.
                      </TableCell>
                    </TableRow>
                  )}
                  {projects.map((p) => (
                    <TableRow key={p.projectSq}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(p.projectSq)}
                          onCheckedChange={() => toggle(p.projectSq)}
                          aria-label={`${p.projectTtl} 선택`}
                        />
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{p.projectSq}</TableCell>
                      <TableCell className='max-w-[280px] truncate font-medium'>{p.projectTtl}</TableCell>
                      <TableCell className='max-w-[140px] truncate text-muted-foreground'>
                        {p.companyNm ?? '-'}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>{p.recruitEndDt}</TableCell>
                      <TableCell className='text-right text-muted-foreground'>{p.viewCnt}</TableCell>
                      <TableCell className='text-right'>{p.candidateCnt}</TableCell>
                      <TableCell className='text-right text-muted-foreground'>{p.botApplicationCnt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── 실행 ── */}
        <div className='mb-4 flex flex-wrap gap-2'>
          <Button onClick={() => void handlePreview()} disabled={isBusy || projects.length === 0}>
            {isBusy ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Play className='mr-2 h-4 w-4' />}
            미리보기
          </Button>
          <Button onClick={() => setApplyOpen(true)} disabled={isBusy || !plan || plan.summary.totalApplications === 0}>
            등록
          </Button>
          <Button
            variant='destructive'
            onClick={() => setRevokeOpen(true)}
            disabled={isBusy || totalBotApplications === 0}
          >
            회수
          </Button>
        </div>

        {/* ── 미리보기 결과 ── */}
        {plan && (
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>
                미리보기 — 공고 {plan.summary.targetProjects}건 / 지원 {plan.summary.totalApplications}건
              </CardTitle>
              <p className='text-sm text-muted-foreground'>
                기준시각 {plan.plannedAt} · 이 상태로 등록됩니다. DB 에는 아직 아무것도 쓰지 않았습니다.
              </p>
            </CardHeader>
            <CardContent className='space-y-3'>
              {plan.warnings.length > 0 && (
                <ul className='rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200'>
                  {plan.warnings.map((w, i) => (
                    <li key={i}>· {w}</li>
                  ))}
                </ul>
              )}
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-20'>티어</TableHead>
                      <TableHead className='w-16'>번호</TableHead>
                      <TableHead>공고명</TableHead>
                      <TableHead className='w-24 text-right'>현재</TableHead>
                      <TableHead className='w-24 text-right'>추가</TableHead>
                      <TableHead className='w-24 text-right'>등록 후</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plan.allocations.map((a) => (
                      <TableRow key={a.projectSq}>
                        <TableCell>
                          <Badge variant={TIER_VARIANT[a.tier]}>{TIER_LABEL[a.tier]}</Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>{a.projectSq}</TableCell>
                        <TableCell className='max-w-[320px] truncate'>{a.projectTtl}</TableCell>
                        <TableCell className='text-right text-muted-foreground'>{a.currentCnt}</TableCell>
                        <TableCell className='text-right font-medium'>+{a.plannedCnt}</TableCell>
                        <TableCell className='text-right font-semibold'>
                          {(a.currentCnt ?? 0) + a.plannedCnt}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </Main>

      <ConfirmDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        title='봇 지원을 등록할까요?'
        desc={
          <span>
            공고 {plan?.summary.targetProjects ?? 0}건에 지원 {plan?.summary.totalApplications ?? 0}건이 등록됩니다.
            {(status?.botsWithoutResume ?? 0) > 0 && (
              <> 이력서가 없는 봇 {status?.botsWithoutResume}개는 이력서가 함께 만들어집니다.</>
            )}
            <br />
            되돌리려면 이 화면의 <b>회수</b> 버튼을 쓰면 됩니다.
          </span>
        }
        confirmText='등록'
        handleConfirm={() => void handleApply()}
      />

      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        destructive
        title='봇 지원을 회수할까요?'
        desc={
          <span>
            {selected.size === 0 ? '모든 공고' : `선택한 공고 ${selected.size}건`}에 붙은 봇 지원이 삭제되고
            지원 건수가 원래대로 되돌아갑니다.
            <br />
            실제 사용자가 넣은 지원은 대상이 아닙니다.
          </span>
        }
        confirmText='회수'
        handleConfirm={() => void handleRevoke()}
      />
    </>
  )
}
