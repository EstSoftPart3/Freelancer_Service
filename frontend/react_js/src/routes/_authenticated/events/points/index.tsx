import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Download,
  Search,
  Users,
} from 'lucide-react'
import { api } from '@/lib/api'
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

type AdminPointRecord = {
  pointSq: number
  userSq: number
  pointAmount: number
  pointCreateAtDt: string
  pointUpdatedAtDt: string | null
}

type ApiResponse<T> = {
  status?: string
  message?: string
  output?: T
  data?: T
}

function PointsPage() {
  const [pointRecords, setPointRecords] = useState<AdminPointRecord[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPointRecords = async () => {
      try {
        setIsLoading(true)

        const response =
          await api.$get<ApiResponse<AdminPointRecord[]>>('/admin/points')

        console.log('관리자 포인트 목록 응답:', response)

        const records = response.output ?? response.data ?? []

        setPointRecords(records)
      } catch (error) {
        console.error('관리자 포인트 목록 조회 실패:', error)
        setPointRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPointRecords()
  }, [])

  const filteredPointRecords = useMemo(() => {
    const keyword = searchKeyword.trim()

    if (!keyword) {
      return pointRecords
    }

    return pointRecords.filter((record) =>
      String(record.userSq).includes(keyword)
    )
  }, [pointRecords, searchKeyword])

  const totalPointAmount = pointRecords.reduce(
    (sum, record) => sum + record.pointAmount,
    0
  )

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) {
      return '-'
    }

    return dateTime.replace('T', ' ')
  }

  return (
    <Main className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              포인트 현황 조회
            </h1>
            <p className='text-sm text-muted-foreground'>
              회원별 보유 포인트, 등록일시, 수정일시를 조회할 수 있습니다.
            </p>
          </div>

          <div className='hidden items-center gap-2 text-sm text-muted-foreground md:flex'>
            <span>홈</span>
            <span>&gt;</span>
            <span>이벤트 센터</span>
            <span>&gt;</span>
            <span>포인트 관리</span>
            <span>&gt;</span>
            <span className='text-foreground'>포인트 현황 조회</span>
          </div>
        </div>
      </div>

      <section className='grid gap-4 md:grid-cols-2'>
        <SummaryCard
          icon={<Users className='size-6 text-green-600' />}
          iconClassName='bg-green-100'
          title='포인트 보유 회원'
          value={`${pointRecords.length.toLocaleString()}명`}
          description='포인트 데이터가 등록된 회원 수'
        />

        <SummaryCard
          icon={<Coins className='size-6 text-orange-500' />}
          iconClassName='bg-orange-100'
          title='전체 보유 포인트'
          value={`${totalPointAmount.toLocaleString()}P`}
          description='조회된 회원의 보유 포인트 합계'
        />
      </section>

      <Card>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>회원 번호 검색</label>
              <div className='relative'>
                <Input
                  className='pr-9'
                  placeholder='회원 번호를 입력하세요'
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                />
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
          총 {filteredPointRecords.length.toLocaleString()}건
        </p>

        <Card className='overflow-hidden py-0'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/40'>
                <TableHead className='w-[80px] px-4'>No.</TableHead>
                <TableHead>포인트 순번</TableHead>
                <TableHead>회원 번호</TableHead>
                <TableHead>보유 포인트</TableHead>
                <TableHead>등록일시</TableHead>
                <TableHead>수정일시</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='h-24 text-center text-muted-foreground'
                  >
                    포인트 데이터를 불러오는 중입니다.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                filteredPointRecords.map((record, index) => (
                  <TableRow key={record.pointSq}>
                    <TableCell className='px-4'>{index + 1}</TableCell>
                    <TableCell>{record.pointSq}</TableCell>
                    <TableCell>{record.userSq}</TableCell>
                    <TableCell>
                      {record.pointAmount.toLocaleString()}P
                    </TableCell>
                    <TableCell>
                      {formatDateTime(record.pointCreateAtDt)}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(record.pointUpdatedAtDt)}
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && filteredPointRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='h-24 text-center text-muted-foreground'
                  >
                    조회된 포인트 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <p className='text-sm text-muted-foreground'>
            1-{filteredPointRecords.length} /{' '}
            {filteredPointRecords.length.toLocaleString()}건
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
