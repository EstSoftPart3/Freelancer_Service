import { useEffect, useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarCheck,
  Gift,
  Info,
  RotateCcw,
  Save,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/events/points/policy/')({
  component: PointPolicyPage,
})

type ApiResponse<T> = {
  status: string
  message: string
  output: T
}

type PointPolicy = {
  pointPolicySq?: number
  attendancePoint: number
  streakPoint: number
  eventPoint: number
  autoPaymentYn?: string
  duplicateBlockYn?: string
  manualAdjustYn?: string
  regDt?: string
  modDt?: string
}

function PointPolicyPage() {
  const [policy, setPolicy] = useState<PointPolicy>({
    attendancePoint: 0,
    streakPoint: 0,
    eventPoint: 0,
  })

  const [form, setForm] = useState<PointPolicy>({
    attendancePoint: 0,
    streakPoint: 0,
    eventPoint: 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchPolicy = async () => {
    try {
      setIsLoading(true)

      const response = await api.$get<ApiResponse<PointPolicy>>(
        '/admin/points/policy'
      )

      const policyData = response.output

      const normalisedPolicy: PointPolicy = {
        ...policyData,
        attendancePoint: Number(policyData.attendancePoint),
        streakPoint: Number(policyData.streakPoint),
        eventPoint: Number(policyData.eventPoint),
        autoPaymentYn: policyData.autoPaymentYn ?? 'Y',
        duplicateBlockYn: policyData.duplicateBlockYn ?? 'Y',
        manualAdjustYn: policyData.manualAdjustYn ?? 'Y',
      }

      setPolicy(normalisedPolicy)
      setForm(normalisedPolicy)
    } catch (error) {
      console.error('포인트 정책 조회 실패:', error)
      alert('포인트 정책 조회에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key: keyof PointPolicy, value: string) => {
    const cleanedValue = value.replace(/^0+(?=\d)/, '')
    const numberValue = Number(cleanedValue)

    setForm((prev) => ({
      ...prev,
      [key]: cleanedValue === '' || Number.isNaN(numberValue) ? 0 : numberValue,
    }))
  }
  const handleReset = () => {
    setForm(policy)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      await api.$put<ApiResponse<PointPolicy>>('/admin/points/policy', {
        attendancePoint: Number(form.attendancePoint),
        streakPoint: Number(form.streakPoint),
        eventPoint: Number(form.eventPoint),
        autoPaymentYn: form.autoPaymentYn ?? 'Y',
        duplicateBlockYn: form.duplicateBlockYn ?? 'Y',
        manualAdjustYn: form.manualAdjustYn ?? 'Y',
      })

      alert('포인트 정책이 저장되었습니다.')

      await fetchPolicy()
    } catch (error) {
      console.error('포인트 정책 저장 실패:', error)
      alert('포인트 정책 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchPolicy()
  }, [])

  return (
    <Main className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              포인트 정책 설정
            </h1>
            <p className='text-sm text-muted-foreground'>
              이벤트 및 출석 보상 포인트를 간단히 관리합니다.
            </p>
          </div>

          <div className='hidden shrink-0 items-center gap-2 text-sm text-muted-foreground md:flex'>
            <span>홈</span>
            <span>&gt;</span>
            <span>이벤트 센터</span>
            <span>&gt;</span>
            <span>포인트 관리</span>
            <span>&gt;</span>
            <span className='text-foreground'>포인트 정책 설정</span>
          </div>
        </div>
      </div>

      <section className='grid gap-4 md:grid-cols-3'>
        <PolicySummaryCard
          icon={<CalendarCheck className='size-5 text-primary' />}
          title='기본 출석 보상'
          value={`${form.attendancePoint}P`}
          description='매일 1회 출석 시 지급'
        />

        <PolicySummaryCard
          icon={<Star className='size-5 text-primary' />}
          title='연속 출석 보너스'
          value={`${form.streakPoint}P`}
          description='7일 연속 출석 달성 시 지급'
        />

        <PolicySummaryCard
          icon={<Gift className='size-5 text-primary' />}
          title='이벤트 추가 보상'
          value={`${form.eventPoint}P`}
          description='이벤트 참여 조건 충족 시 지급'
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>포인트 지급 정책</CardTitle>
        </CardHeader>

        <CardContent className='space-y-6'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>
              포인트 정책을 불러오는 중입니다.
            </p>
          ) : (
            <>
              <PointInputRow
                label='기본 출석 보상'
                description='회원이 하루 1회 출석체크를 완료했을 때 지급되는 포인트입니다.'
                value={form.attendancePoint}
                onChange={(value) => handleChange('attendancePoint', value)}
              />

              <PointInputRow
                label='연속 출석 보너스'
                description='7일 이상 연속 출석한 회원에게 추가로 지급되는 보너스 포인트입니다.'
                value={form.streakPoint}
                onChange={(value) => handleChange('streakPoint', value)}
              />

              <PointInputRow
                label='이벤트 추가 보상'
                description='특정 이벤트 참여 조건을 달성한 회원에게 지급되는 추가 포인트입니다.'
                value={form.eventPoint}
                onChange={(value) => handleChange('eventPoint', value)}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>옵션</CardTitle>
        </CardHeader>

        <CardContent className='space-y-5'>
          <PolicyOption
            title='자동 지급'
            description='설정된 조건을 충족하면 포인트를 자동으로 지급합니다.'
            checked={form.autoPaymentYn === 'Y'}
          />

          <PolicyOption
            title='중복 지급 방지'
            description='동일한 조건에서 포인트가 중복 지급되지 않도록 방지합니다.'
            checked={form.duplicateBlockYn === 'Y'}
          />

          <PolicyOption
            title='운영자 수동 조정 허용'
            description='운영자가 필요 시 포인트를 수동으로 지급하거나 차감할 수 있습니다.'
            checked={form.manualAdjustYn === 'Y'}
          />
        </CardContent>
      </Card>

      <div className='flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground'>
        <Info className='size-4 shrink-0 text-primary' />
        <p>저장 후 변경된 포인트 정책은 즉시 회원 정책에 반영됩니다.</p>
      </div>

      <div className='flex justify-end gap-2'>
        <Button variant='outline' onClick={handleReset} disabled={isSaving}>
          <RotateCcw className='size-4' />
          초기화
        </Button>

        <Button onClick={handleSave} disabled={isSaving || isLoading}>
          <Save className='size-4' />
          {isSaving ? '저장 중' : '저장'}
        </Button>
      </div>
    </Main>
  )
}

type PolicySummaryCardProps = {
  icon: ReactNode
  title: string
  value: string
  description: string
}

function PolicySummaryCard({
  icon,
  title,
  value,
  description,
}: PolicySummaryCardProps) {
  return (
    <Card>
      <CardContent className='flex items-center gap-5'>
        <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted'>
          {icon}
        </div>

        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='text-3xl font-bold tracking-tight text-foreground'>
            {value}
          </p>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

type PointInputRowProps = {
  label: string
  description: string
  value: number
  onChange: (value: string) => void
}

function PointInputRow({
  label,
  description,
  value,
  onChange,
}: PointInputRowProps) {
  return (
    <div className='grid gap-3 border-b pb-6 last:border-b-0 last:pb-0 md:grid-cols-[220px_1fr] md:items-center'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>{label}</p>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>

      <div className='flex max-w-sm items-center'>
        <Input
          type='text'
          inputMode='numeric'
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className='rounded-r-none'
        />
        <div className='flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-4 text-sm text-muted-foreground'>
          P
        </div>
      </div>
    </div>
  )
}

type PolicyOptionProps = {
  title: string
  description: string
  checked?: boolean
}

function PolicyOption({
  title,
  description,
  checked = false,
}: PolicyOptionProps) {
  return (
    <div className='flex items-start gap-4'>
      <div
        className={
          checked
            ? 'mt-1 flex size-5 items-center justify-center rounded-md bg-primary text-primary-foreground'
            : 'mt-1 size-5 rounded-md border'
        }
      >
        {checked ? <ShieldCheck className='size-3.5' /> : null}
      </div>

      <div className='space-y-1'>
        <p className='text-sm font-medium'>{title}</p>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  )
}
