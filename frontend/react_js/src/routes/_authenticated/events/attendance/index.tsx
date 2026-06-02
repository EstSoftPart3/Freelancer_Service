import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Main } from '@/components/layout/main'

export const Route = createFileRoute('/_authenticated/events/attendance/')({
  component: AttendancePage,
})

type AttendanceRecord = {
  attendanceSq: number
  userSq: number
  attendanceDt: string
  createdAtDtm: string
}

const attendanceRecords: AttendanceRecord[] = [
  {
    attendanceSq: 1,
    userSq: 101,
    attendanceDt: '2026-06-02',
    createdAtDtm: '2026-06-02 09:12:35',
  },
  {
    attendanceSq: 2,
    userSq: 102,
    attendanceDt: '2026-06-02',
    createdAtDtm: '2026-06-02 09:25:10',
  },
  {
    attendanceSq: 3,
    userSq: 103,
    attendanceDt: '2026-06-02',
    createdAtDtm: '2026-06-02 10:03:48',
  },
]

function AttendancePage() {
  const totalMemberCount = 2000
  const todayAttendanceCount = attendanceRecords.length
  const accumulatedParticipantCount = attendanceRecords.length

  const todayAttendanceRate = (
    (todayAttendanceCount / totalMemberCount) *
    100
  ).toFixed(1)

  return (
    <Main className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              출석 내역 조회
            </h1>
            <p className='text-sm text-muted-foreground'>
              회원들의 출석 내역을 조회하고 출석일과 출석 체크 일시를 확인할 수
              있습니다.
            </p>
          </div>

          <div className='hidden items-center gap-2 text-sm text-muted-foreground md:flex'>
            <span>홈</span>
            <span>&gt;</span>
            <span>이벤트 센터</span>
            <span>&gt;</span>
            <span>출석체크 관리</span>
            <span>&gt;</span>
            <span className='text-foreground'>출석 내역 조회</span>
          </div>
        </div>
      </div>

      <section className='grid gap-4 md:grid-cols-2'>
        <SummaryCard
          icon={<CalendarCheck className='size-6 text-green-600' />}
          iconClassName='bg-green-100'
          title='오늘 출석률'
          value={`${todayAttendanceRate}%`}
          description={`${todayAttendanceCount.toLocaleString()} / ${totalMemberCount.toLocaleString()}명`}
        />

        <SummaryCard
          icon={<Users className='size-6 text-orange-500' />}
          iconClassName='bg-orange-100'
          title='누적 참여자'
          value={`${accumulatedParticipantCount.toLocaleString()}명`}
          description='출석체크 참여 이력이 있는 회원'
        />
      </section>

      <Card>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-[260px_1fr_auto_auto] md:items-end'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>조회 기간</label>
              <div className='flex h-9 items-center rounded-md border bg-background px-3 text-sm'>
                <span>2026-06-01</span>
                <span className='mx-3 text-muted-foreground'>~</span>
                <span>2026-06-02</span>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>회원 번호 검색</label>
              <div className='relative'>
                <Input className='pr-9' placeholder='회원 번호를 입력하세요' />
                <Search className='absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground' />
              </div>
            </div>

            <Button className='h-9'>
              <Search className='size-4' />
              검색
            </Button>

            <Button variant='outline' className='h-9'>
              <Download className='size-4' />
              엑셀 다운로드
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className='space-y-3'>
        <p className='text-sm font-medium'>
          총 {attendanceRecords.length.toLocaleString()}건
        </p>

        <Card className='overflow-hidden py-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/40'>
                <TableHead className='w-[80px] px-4'>No.</TableHead>
                <TableHead>출석 순번</TableHead>
                <TableHead>회원 번호</TableHead>
                <TableHead>출석일</TableHead>
                <TableHead>출석 체크 일시</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {attendanceRecords.map((record, index) => (
                <TableRow key={record.attendanceSq}>
                  <TableCell className='px-4'>{index + 1}</TableCell>
                  <TableCell>{record.attendanceSq}</TableCell>
                  <TableCell>{record.userSq}</TableCell>
                  <TableCell>{record.attendanceDt}</TableCell>
                  <TableCell>{record.createdAtDtm}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <p className='text-sm text-muted-foreground'>
            1-{attendanceRecords.length} /{' '}
            {attendanceRecords.length.toLocaleString()}건
          </p>

          <div className='flex items-center justify-center gap-1'>
            <Button variant='outline' size='icon'>
              <ChevronLeft className='size-4' />
            </Button>

            <Button size='icon'>1</Button>

            <Button variant='outline' size='icon'>
              <ChevronRight className='size-4' />
            </Button>
          </div>

          <select className='h-9 rounded-md border bg-background px-3 text-sm outline-none'>
            <option>15개씩 보기</option>
            <option>30개씩 보기</option>
            <option>50개씩 보기</option>
          </select>
        </div>
      </section>
    </Main>
  )
}

type SummaryCardProps = {
  icon: ReactNode
  iconClassName: string
  title: string
  value: string
  description: string
}

function SummaryCard({
  icon,
  iconClassName,
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent className='flex items-center gap-5'>
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          {icon}
        </div>

        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className='text-2xl font-bold tracking-tight'>{value}</p>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
