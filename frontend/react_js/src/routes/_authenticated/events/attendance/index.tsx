import { createFileRoute } from '@tanstack/react-router'
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Gift,
  Search,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

type AttendanceStatus = '출석 완료' | '미출석'

type AttendanceRecord = {
  id: number
  name: string
  email: string
  attendanceDate: string
  status: AttendanceStatus
  basePoint: number
  bonusPoint: number
  totalPoint: number
  accessInfo: string
  device: string
  memo: string
}

const attendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    name: '김프리',
    email: 'kimfree@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 50,
    totalPoint: 60,
    accessInfo: 'Web / 211.234.123.45',
    device: 'Chrome',
    memo: '연속 7일',
  },
  {
    id: 2,
    name: '이개발',
    email: 'lee.dev@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Mobile / 211.234.123.46',
    device: 'Safari',
    memo: '-',
  },
  {
    id: 3,
    name: '박디자인',
    email: 'park.design@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 50,
    totalPoint: 60,
    accessInfo: 'Web / 211.234.123.47',
    device: 'Edge',
    memo: '연속 27일',
  },
  {
    id: 4,
    name: '최마케팅',
    email: 'choi.marketing@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Mobile / 211.234.123.48',
    device: 'Chrome',
    memo: '-',
  },
  {
    id: 5,
    name: '정기획',
    email: 'jung.plan@example.com',
    attendanceDate: '2025-06-02',
    status: '미출석',
    basePoint: 0,
    bonusPoint: 0,
    totalPoint: 0,
    accessInfo: '-',
    device: '-',
    memo: '-',
  },
  {
    id: 6,
    name: '안퍼블',
    email: 'ahn.publish@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Web / 211.234.123.49',
    device: 'Chrome',
    memo: '-',
  },
  {
    id: 7,
    name: '오영업',
    email: 'oh.sales@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 50,
    totalPoint: 60,
    accessInfo: 'Mobile / 211.234.123.50',
    device: 'Safari',
    memo: '연속 14일',
  },
  {
    id: 8,
    name: '유운영',
    email: 'yu.ops@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Web / 211.234.123.51',
    device: 'Edge',
    memo: '-',
  },
  {
    id: 9,
    name: '장콘텐츠',
    email: 'jang.contents@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 50,
    totalPoint: 60,
    accessInfo: 'Mobile / 211.234.123.52',
    device: 'Chrome',
    memo: '연속 30일',
  },
  {
    id: 10,
    name: '심QA',
    email: 'sim.qa@example.com',
    attendanceDate: '2025-06-02',
    status: '미출석',
    basePoint: 0,
    bonusPoint: 0,
    totalPoint: 0,
    accessInfo: '-',
    device: '-',
    memo: '-',
  },
  {
    id: 11,
    name: '허지원',
    email: 'heo.support@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Web / 211.234.123.53',
    device: 'Chrome',
    memo: '-',
  },
  {
    id: 12,
    name: '배데이터',
    email: 'bae.data@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 50,
    totalPoint: 60,
    accessInfo: 'Mobile / 211.234.123.54',
    device: 'Safari',
    memo: '연속 3일',
  },
  {
    id: 13,
    name: '고보안',
    email: 'go.security@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Web / 211.234.123.55',
    device: 'Edge',
    memo: '-',
  },
  {
    id: 14,
    name: '남법무',
    email: 'nam.legal@example.com',
    attendanceDate: '2025-06-02',
    status: '출석 완료',
    basePoint: 10,
    bonusPoint: 0,
    totalPoint: 10,
    accessInfo: 'Mobile / 211.234.123.56',
    device: 'Chrome',
    memo: '-',
  },
  {
    id: 15,
    name: '염인사',
    email: 'yeom.hr@example.com',
    attendanceDate: '2025-06-02',
    status: '미출석',
    basePoint: 0,
    bonusPoint: 0,
    totalPoint: 0,
    accessInfo: '-',
    device: '-',
    memo: '-',
  },
]

function AttendancePage() {
  const totalMemberCount = 2000
  const todayAttendanceCount = 1245
  const accumulatedParticipantCount = 1245
  const todayPaidPoint = attendanceRecords.reduce(
    (sum, record) => sum + record.totalPoint,
    0
  )

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
              회원들의 출석 내역을 조회하고 상세 정보를 확인할 수 있습니다.
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

      <section className='grid gap-4 md:grid-cols-3'>
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

        <SummaryCard
          icon={<Gift className='size-6 text-purple-600' />}
          iconClassName='bg-purple-100'
          title='지급 포인트'
          value={`${todayPaidPoint.toLocaleString()}P`}
          description='오늘 출석체크로 지급된 포인트'
        />
      </section>

      <Card>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-[260px_180px_1fr_auto_auto] md:items-end'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>조회 기간</label>
              <div className='flex h-9 items-center rounded-md border bg-background px-3 text-sm'>
                <span>2025-06-01</span>
                <span className='mx-3 text-muted-foreground'>~</span>
                <span>2025-06-02</span>
              </div>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>출석상태</label>
              <select className='h-9 w-full rounded-md border bg-background px-3 text-sm outline-none'>
                <option>전체</option>
                <option>출석 완료</option>
                <option>미출석</option>
              </select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>회원 검색</label>
              <div className='relative'>
                <Input className='pr-9' placeholder='이름, 이메일로 검색' />
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
          총 {todayAttendanceCount.toLocaleString()}건
        </p>

        <Card className='overflow-hidden py-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/40'>
                <TableHead className='w-[60px] px-4'>No.</TableHead>
                <TableHead>회원명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>출석일</TableHead>
                <TableHead>출석상태</TableHead>
                <TableHead>지급 포인트</TableHead>
                <TableHead>보너스</TableHead>
                <TableHead>합계 포인트</TableHead>
                <TableHead>접속 채널 / IP</TableHead>
                <TableHead>기기</TableHead>
                <TableHead>비고</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className='px-4'>{record.id}</TableCell>

                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <div className='flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold'>
                        {record.name.slice(0, 1)}
                      </div>
                      <span className='font-medium'>{record.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className='text-muted-foreground'>
                    {record.email}
                  </TableCell>

                  <TableCell>{record.attendanceDate}</TableCell>

                  <TableCell>
                    <AttendanceStatusBadge status={record.status} />
                  </TableCell>

                  <TableCell>{record.basePoint}P</TableCell>
                  <TableCell>{record.bonusPoint}P</TableCell>

                  <TableCell className='font-semibold'>
                    {record.totalPoint}P
                  </TableCell>

                  <TableCell className='text-muted-foreground'>
                    {record.accessInfo}
                  </TableCell>

                  <TableCell className='text-muted-foreground'>
                    {record.device}
                  </TableCell>

                  <TableCell className='text-muted-foreground'>
                    {record.memo}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <p className='text-sm text-muted-foreground'>
            1-15 / {todayAttendanceCount.toLocaleString()}건
          </p>

          <div className='flex items-center justify-center gap-1'>
            <Button variant='outline' size='icon'>
              <ChevronLeft className='size-4' />
            </Button>

            <Button size='icon'>1</Button>
            <Button variant='outline' size='icon'>
              2
            </Button>
            <Button variant='outline' size='icon'>
              3
            </Button>
            <Button variant='outline' size='icon'>
              4
            </Button>
            <Button variant='outline' size='icon'>
              5
            </Button>

            <span className='px-2 text-sm text-muted-foreground'>...</span>

            <Button variant='outline' size='icon'>
              83
            </Button>

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
  icon: React.ReactNode
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

function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  if (status === '출석 완료') {
    return (
      <Badge className='border-green-200 bg-green-100 text-green-700 hover:bg-green-100'>
        출석 완료
      </Badge>
    )
  }

  return (
    <Badge
      variant='secondary'
      className='border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-100'
    >
      미출석
    </Badge>
  )
}
