import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { type SeedOptions } from '../api/seed-api'

type Props = {
  value: SeedOptions
  onChange: (next: SeedOptions) => void
  disabled?: boolean
}

/** 서버가 메타데이터를 배분할 때 쓰는 규칙. AI 는 콘텐츠만 만들고 나머지는 전부 여기서 정해진다. */
export function SeedOptionsPanel({ value, onChange, disabled }: Props) {
  const set = <K extends keyof SeedOptions>(key: K, next: SeedOptions[K]) =>
    onChange({ ...value, [key]: next })

  const ratio = value.adoptRatio
  const ratioSum =
    ratio.inProgress + ratio.adopted + ratio.selfSolved + ratio.unresolved

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>배분 옵션</CardTitle>
        <p className='text-sm text-muted-foreground'>
          작성자·작성일시·카테고리·채택상태·댓글 수는 서버가 정합니다. AI 에게는
          맡기지 않습니다 — 200건의 균등 분배를 AI 가 맞추지 못하기 때문입니다.
        </p>
      </CardHeader>

      <CardContent className='grid gap-6'>
        <section className='grid gap-3'>
          <h4 className='text-sm font-medium'>작성일시</h4>

          <div className='grid gap-2'>
            <div className='inline-flex w-fit rounded-md border p-0.5'>
              <ModeButton
                active={value.spreadMode === 'PAST'}
                disabled={disabled}
                onClick={() => set('spreadMode', 'PAST')}
              >
                과거에 분산
              </ModeButton>
              <ModeButton
                active={value.spreadMode === 'TODAY'}
                disabled={disabled}
                onClick={() => set('spreadMode', 'TODAY')}
              >
                오늘 하루
              </ModeButton>
            </div>
            <p className='text-xs text-muted-foreground'>
              {value.spreadMode === 'TODAY'
                ? '오늘 08시부터 지금 사이에 흩뿌립니다. 매일 조금씩 채울 때 씁니다 — 매일 이 모드로 돌리면 날짜가 자연스럽게 쌓입니다.'
                : '커뮤니티를 처음 채울 때 씁니다. 이 모드로 매일 돌리면 새 글이 계속 과거로 흩어져 목록 상단이 갱신되지 않습니다.'}
            </p>
          </div>

          {value.spreadMode === 'PAST' && (
            <div className='grid gap-4 sm:grid-cols-2'>
              <NumberField
                label='과거 며칠에 분산'
                hint='오늘부터 이 기간 안에 흩뿌립니다'
                value={value.spreadDays}
                min={1}
                max={730}
                disabled={disabled}
                onChange={(v) => set('spreadDays', v)}
              />
              <div className='grid gap-1.5'>
                <Label className='text-sm'>시간대별 비중</Label>
                <div className='grid grid-cols-4 gap-2'>
                  {(['1일내', '7일내', '30일내', '그이전'] as const).map(
                    (label, i) => (
                      <div key={label} className='grid gap-1'>
                        <Input
                          type='number'
                          min={0}
                          disabled={disabled}
                          value={value.hotWindowRatio?.[i] ?? 1}
                          onChange={(e) => {
                            const next = [
                              ...(value.hotWindowRatio ?? [1, 1, 1, 1]),
                            ]
                            next[i] = Number(e.target.value)
                            set('hotWindowRatio', next)
                          }}
                        />
                        <span className='text-center text-xs text-muted-foreground'>
                          {label}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  전부 먼 과거로 보내면 인기글 위젯이 비어 보입니다(1·7·30일 창으로
                  고르기 때문입니다).
                </p>
              </div>
            </div>
          )}
        </section>

        <section className='grid gap-3'>
          <h4 className='text-sm font-medium'>분량</h4>
          <div className='grid gap-4 sm:grid-cols-3'>
            <RangeField
              label='글당 댓글 수'
              hint='계정 수 - 1 을 넘을 수 없습니다'
              min={value.commentMin}
              max={value.commentMax}
              disabled={disabled}
              onChange={(lo, hi) =>
                onChange({ ...value, commentMin: lo, commentMax: hi })
              }
            />
            <RangeField
              label='Q&A 답변 수'
              hint='AI 가 준 개수를 넘을 수 없습니다'
              min={value.answerMin}
              max={value.answerMax}
              disabled={disabled}
              onChange={(lo, hi) =>
                onChange({ ...value, answerMin: lo, answerMax: hi })
              }
            />
            <RangeField
              label='조회수'
              hint='추천수는 넣지 않습니다(재집계로 무너집니다)'
              min={value.viewMin}
              max={value.viewMax}
              disabled={disabled}
              onChange={(lo, hi) =>
                onChange({ ...value, viewMin: lo, viewMax: hi })
              }
            />
          </div>
        </section>

        <section className='grid gap-3'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-medium'>Q&A 채택상태 비율 (%)</h4>
            <span
              className={
                ratioSum === 100
                  ? 'text-xs text-muted-foreground'
                  : 'text-xs font-medium text-destructive'
              }
            >
              합계 {ratioSum}
              {ratioSum !== 100 && ' — 100 이어야 합니다'}
            </span>
          </div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <NumberField
              label='진행중'
              value={ratio.inProgress}
              disabled={disabled}
              onChange={(v) =>
                set('adoptRatio', { ...ratio, inProgress: v })
              }
            />
            <NumberField
              label='채택완료'
              value={ratio.adopted}
              disabled={disabled}
              onChange={(v) => set('adoptRatio', { ...ratio, adopted: v })}
            />
            <NumberField
              label='자체해결'
              value={ratio.selfSolved}
              disabled={disabled}
              onChange={(v) => set('adoptRatio', { ...ratio, selfSolved: v })}
            />
            <NumberField
              label='미해결'
              value={ratio.unresolved}
              disabled={disabled}
              onChange={(v) => set('adoptRatio', { ...ratio, unresolved: v })}
            />
          </div>
          <p className='text-xs text-muted-foreground'>
            답변이 0개인 Q&A 는 채택완료가 될 수 없어 진행중으로 넘어갑니다.
          </p>
        </section>

        <section className='flex items-start justify-between gap-4 rounded-md border p-3'>
          <div className='grid gap-1'>
            <Label htmlFor='balance-categories' className='text-sm'>
              카테고리 균등 배분
            </Label>
            <p className='text-xs text-muted-foreground'>
              카테고리별 글 수를 정확히 1/N 로 맞춥니다. 자리가 남는 한 AI 가 고른
              카테고리를 그대로 씁니다.
            </p>
          </div>
          <Switch
            id='balance-categories'
            checked={value.balanceCategories}
            disabled={disabled}
            onCheckedChange={(v) => set('balanceCategories', v)}
          />
        </section>
      </CardContent>
    </Card>
  )
}

/** 두 모드 중 하나를 고르는 세그먼트 버튼. */
function ModeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded px-3 py-1.5 text-sm transition-colors disabled:opacity-50',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  )
}

function NumberField({
  label,
  hint,
  value,
  min = 0,
  max,
  disabled,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min?: number
  max?: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  return (
    <div className='grid gap-1.5'>
      <Label className='text-sm'>{label}</Label>
      <Input
        type='number'
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  )
}

function RangeField({
  label,
  hint,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string
  hint?: string
  min: number
  max: number
  disabled?: boolean
  onChange: (min: number, max: number) => void
}) {
  return (
    <div className='grid gap-1.5'>
      <Label className='text-sm'>{label}</Label>
      <div className='flex items-center gap-2'>
        <Input
          type='number'
          min={0}
          value={min}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value), max)}
        />
        <span className='text-muted-foreground'>~</span>
        <Input
          type='number'
          min={0}
          value={max}
          disabled={disabled}
          onChange={(e) => onChange(min, Number(e.target.value))}
        />
      </div>
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  )
}
