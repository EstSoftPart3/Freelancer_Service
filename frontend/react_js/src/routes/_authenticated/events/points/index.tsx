import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  Gift,
  Search,
  TrendingDown,
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

export const Route = createFileRoute('/_authenticated/events/points/')({
  component: PointsPage,
})

type PointType = '지급' | '차감' | '보너스' | '수동 조정'

type PointRecord = {
  id: number
  name: string
  email: string
  type: PointType
  point: number
  remainingPoint: number
  reason: string
  channel: string
  processedAt: string
  memo: string
}

const pointRecords: PointRecord[] = [
  {
    id: 1,
    name: '김프리',
    email: 'kimfree@example.com',
    type: '지급',
    point: 10,
    remainingPoint: 1250,
    reason: '출석체크 보상',
    channel: 'Web / 211.234.123.45',
    processedAt: '2025-06-02 09:15:23',
    memo: '-',
  },
  {
    id: 2,
    name: '이개발',
    email: 'lee.dev@example.com',
    type: '차감',
    point: -30,
    remainingPoint: 1220,
    reason: '포인트 사용 (프로필 강조)',
    channel: 'Mobile / 211.234.123.46',
    processedAt: '2025-06-02 09:12:07',
    memo: '-',
  },
  {
    id: 3,
    name: '박디자인',
    email: 'park.design@example.com',
    type: '지급',
    point: 50,
    remainingPoint: 850,
    reason: '게시글 추천 보상',
    channel: 'Web / 211.234.123.47',
    processedAt: '2025-06-02 09:08:31',
    memo: '-',
  },
  {
    id: 4,
    name: '최마케팅',
    email: 'choi.marketing@example.com',
    type: '차감',
    point: -100,
    remainingPoint: 420,
    reason: '포인트 사용 (상단 노출)',
    channel: 'Mobile / 211.234.123.48',
    processedAt: '2025-06-02 09:05:16',
    memo: '-',
  },
  {
    id: 5,
    name: '정기획',
    email: 'jung.plan@example.com',
    type: '지급',
    point: 20,
    remainingPoint: 660,
    reason: '댓글 작성 보상',
    channel: 'Web / 211.234.123.49',
    processedAt: '2025-06-02 08:58:44',
    memo: '-',
  },
  {
    id: 6,
    name: '안퍼블',
    email: 'ahn.publish@example.com',
    type: '보너스',
    point: 30,
    remainingPoint: 1080,
    reason: '연속 출석 7일 보너스',
    channel: 'Web / 211.234.123.49',
    processedAt: '2025-06-02 08:55:12',
    memo: '연속 7일',
  },
  {
    id: 7,
    name: '오영업',
    email: 'oh.sales@example.com',
    type: '차감',
    point: -10,
    remainingPoint: 540,
    reason: '포인트 사용 (메시지 전송)',
    channel: 'Mobile / 211.234.123.50',
    processedAt: '2025-06-02 08:52:03',
    memo: '-',
  },
  {
    id: 8,
    name: '유운영',
    email: 'yu.ops@example.com',
    type: '지급',
    point: 100,
    remainingPoint: 2050,
    reason: '이벤트 참여 보상',
    channel: 'Web / 211.234.123.51',
    processedAt: '2025-06-02 08:45:27',
    memo: '-',
  },
  {
    id: 9,
    name: '장콘텐츠',
    email: 'jang.contents@example.com',
    type: '수동 조정',
    point: 200,
    remainingPoint: 1800,
    reason: '관리자 지급',
    channel: 'Web / 211.234.123.52',
    processedAt: '2025-06-02 08:40:11',
    memo: '관리자 지급',
  },
  {
    id: 10,
    name: '심QA',
    email: 'sim.qa@example.com',
    type: '차감',
    point: -50,
    remainingPoint: 300,
    reason: '포인트 사용 (프로젝트 지원)',
    channel: 'Mobile / 211.234.123.53',
    processedAt: '2025-06-02 08:35:59',
    memo: '-',
  },
  {
    id: 11,
    name: '허지원',
    email: 'heo.support@example.com',
    type: '지급',
    point: 10,
    remainingPoint: 610,
    reason: '출석체크 보상',
    channel: 'Web / 211.234.123.53',
    processedAt: '2025-06-02 08:30:21',
    memo: '-',
  },
  {
    id: 12,
    name: '배데이터',
    email: 'bae.data@example.com',
    type: '차감',
    point: -20,
    remainingPoint: 1330,
    reason: '포인트 사용 (이력서 열람)',
    channel: 'Mobile / 211.234.123.54',
    processedAt: '2025-06-02 08:25:18',
    memo: '-',
  },
  {
    id: 13,
    name: '고보안',
    email: 'go.security@example.com',
    type: '지급',
    point: 50,
    remainingPoint: 710,
    reason: '게시글 추천 보상',
    channel: 'Web / 211.234.123.55',
    processedAt: '2025-06-02 08:20:02',
    memo: '-',
  },
  {
    id: 14,
    name: '남법무',
    email: 'nam.legal@example.com',
    type: '수동 조정',
    point: -100,
    remainingPoint: 200,
    reason: '관리자 차감 (부정 사용)',
    channel: 'Web / 211.234.123.56',
    processedAt: '2025-06-02 08:15:33',
    memo: '부정 사용',
  },
  {
    id: 15,
    name: '염인사',
    email: 'yeom.hr@example.com',
    type: '보너스',
    point: 20,
    remainingPoint: 420,
    reason: '연속 출석 3일 보너스',
    channel: 'Mobile / 211.234.123.57',
    processedAt: '2025-06-02 08:10:45',
    memo: '연속 3일',
  },
]

function PointsPage() {
  const todayPaidPoint = pointRecords
    .filter((record) => record.point > 0)
    .reduce((sum, record) => sum + record.point, 0)

  const todayDeductedPoint = pointRecords
    .filter((record) => record.point < 0)
    .reduce((sum, record) => sum + Math.abs(record.point), 0)

  const bonusCount = pointRecords.filter(
    (record) => record.type === '보너스'
  ).length

  return (
    <Main className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              포인트 내역 조회
            </h1>
            <p className='text-sm text-muted-foreground'>
              회원별 포인트 적립 및 사용 내역을 검색하고 상세 정보를 확인할 수
              있습니다.
            </p>
          </div>

          <div className='hidden items-center gap-2 text-sm text-muted-foreground md:flex'>
            <span>홈</span>
            <span>&gt;</span>
            <span>이벤트 센터</span>
            <span>&gt;</span>
            <span>포인트 관리</span>
            <span>&gt;</span>
            <span className='text-foreground'>포인트 내역 조회</span>
          </div>
        </div>
      </div>

      <section className='grid gap-4 md:grid-cols-3'>
        <SummaryCard
          icon={<Coins className='size-6 text-green-600' />}
          iconClassName='bg-green-100'
          title='오늘 지급 포인트'
          value={`${todayPaidPoint.toLocaleString()}P`}
          description='오늘 지급 누적'
        />

        <SummaryCard
          icon={<TrendingDown className='size-6 text-orange-500' />}
          iconClassName='bg-orange-100'
          title='오늘 차감 포인트'
          value={`${todayDeductedPoint.toLocaleString()}P`}
          description='오늘 차감 누적'
        />

        <SummaryCard
          icon={<Gift className='size-6 text-purple-600' />}
          iconClassName='bg-purple-100'
          title='보너스 지급 건수'
          value={`${bonusCount.toLocaleString()}건`}
          description='연속 보너스 포함'
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
              <label className='text-sm font-medium'>유형</label>
              <select className='h-9 w-full rounded-md border bg-background px-3 text-sm outline-none'>
                <option>전체</option>
                <option>지급</option>
                <option>차감</option>
                <option>보너스</option>
                <option>수동 조정</option>
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
        <p className='text-sm font-medium'>총 1,245건</p>

        <Card className='overflow-hidden py-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/40'>
                <TableHead className='w-[60px] px-4'>No.</TableHead>
                <TableHead>회원명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>포인트</TableHead>
                <TableHead>잔여 포인트</TableHead>
                <TableHead>사유</TableHead>
                <TableHead>처리 채널 / IP</TableHead>
                <TableHead>처리일시</TableHead>
                <TableHead>비고</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pointRecords.map((record) => (
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

                  <TableCell>
                    <PointTypeBadge type={record.type} />
                  </TableCell>

                  <TableCell>
                    <span
                      className={
                        record.point >= 0
                          ? 'font-semibold text-green-600'
                          : 'font-semibold text-red-600'
                      }
                    >
                      {formatPointChange(record.point)}
                    </span>
                  </TableCell>

                  <TableCell>
                    {record.remainingPoint.toLocaleString()}P
                  </TableCell>

                  <TableCell>{record.reason}</TableCell>

                  <TableCell className='text-muted-foreground'>
                    {record.channel}
                  </TableCell>

                  <TableCell className='text-muted-foreground'>
                    {record.processedAt}
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
          <p className='text-sm text-muted-foreground'>1-15 / 1,245건</p>

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

function PointTypeBadge({ type }: { type: PointType }) {
  if (type === '지급') {
    return (
      <Badge className='border-green-200 bg-green-100 text-green-700 hover:bg-green-100'>
        지급
      </Badge>
    )
  }

  if (type === '차감') {
    return (
      <Badge className='border-red-200 bg-red-100 text-red-700 hover:bg-red-100'>
        차감
      </Badge>
    )
  }

  if (type === '보너스') {
    return (
      <Badge className='border-purple-200 bg-purple-100 text-purple-700 hover:bg-purple-100'>
        보너스
      </Badge>
    )
  }

  return (
    <Badge className='border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100'>
      수동 조정
    </Badge>
  )
}

function formatPointChange(point: number) {
  if (point > 0) {
    return `+${point.toLocaleString()}P`
  }

  if (point < 0) {
    return `${point.toLocaleString()}P`
  }

  return '0P'
}
