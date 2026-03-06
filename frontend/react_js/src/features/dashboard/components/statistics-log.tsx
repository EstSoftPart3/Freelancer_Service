import { useEffect, useState } from 'react'
import { endOfMonth, format, startOfMonth, subDays } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LatestPosts } from './latest-posts'
import { StatisticLogsChart } from './statistic-logs-chart'

interface summaryDataProps {
  title: string
  icon: React.ReactNode
  count: number
  percent: string
}

interface chartDataProps {
  day: string
  visitors: number
  projects: number
  projectApplications: number
  companyApplications: number
  posts: number
  comments: number
}

interface latestPostsDataProps {
  id: number
  title: string
  name: string
  comments: number
  time: string
}

type ApiResponse<T> = {
  status: string
  message: string
  output: T
}
const btnTitle = [
  {
    ko: '접속자',
    en: 'visitors',
  },
  {
    ko: '프로젝트',
    en: 'projects',
  },
  {
    ko: '프로젝트 지원',
    en: 'projectApplications',
  },
  {
    ko: '소속 지원',
    en: 'companyApplications',
  },
  {
    ko: '게시글',
    en: 'posts',
  },
  {
    ko: '댓글',
    en: 'comments',
  },
]
const btnFilter = ['오늘', '어제', '일주일', '이번달']

const getDateRange = (selectedFilterKey: string) => {
  const today = new Date()
  let startDate
  let endDate

  switch (selectedFilterKey) {
    case '오늘':
      startDate = format(today, 'yyyy-MM-dd')
      endDate = format(today, 'yyyy-MM-dd')
      break

    case '어제':
      startDate = format(subDays(today, 1), 'yyyy-MM-dd')
      endDate = format(subDays(today, 1), 'yyyy-MM-dd')
      break

    case '일주일':
      startDate = format(subDays(today, 6), 'yyyy-MM-dd')
      endDate = format(today, 'yyyy-MM-dd')
      break

    case '이번달':
      startDate = format(startOfMonth(today), 'yyyy-MM-dd')
      endDate = format(endOfMonth(today), 'yyyy-MM-dd')
      break

    default:
      startDate = format(subDays(today, 6), 'yyyy-MM-dd')
      endDate = format(today, 'yyyy-MM-dd')
      break
  }

  return { startDate, endDate }
}

export function StatisticsLogs() {
  const [selectedKey, setSelectedKey] = useState(btnTitle[0].en)
  const [selectedFilterKey, setSelectedFilterKey] = useState('일주일')
  const [summaryData, setSummaryData] = useState<summaryDataProps[]>([])
  const [chartData, setChartData] = useState<chartDataProps[]>([])
  const [latestPostsData, setLatestPostsData] = useState<
    latestPostsDataProps[]
  >([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { startDate, endDate } = getDateRange(selectedFilterKey)

        const chartData = await api.$get<ApiResponse<chartDataProps[]>>(
          '/admin/dashboard/chart',
          { startDate, endDate }
        )

        setChartData(chartData.output)
      } catch (_) {
        toast.error('차트 조회 중 오류가 발생했습니다.')
      }
    }
    fetchAll()
  }, [selectedKey, selectedFilterKey])

  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [summaryData, latestPostsData] = await Promise.all([
          api.$get<ApiResponse<summaryDataProps[]>>('/admin/dashboard/summary'),
          api.$get<ApiResponse<latestPostsDataProps[]>>(
            '/admin/dashboard/latestpost'
          ),
        ])
        setSummaryData(summaryData.output)
        setLatestPostsData(latestPostsData.output)
      } catch (_) {
        toast.error('데이터 조회 중 오류가 발생했습니다.')
      }
    }
    fetchStatic()
  }, [selectedKey, selectedFilterKey])

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
        {summaryData.map((s) => (
          <Card key={s.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{s.title}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{s.count}</div>
              <p className='text-xs text-muted-foreground'>
                {Number(s.percent) > 0 ? `+${s.percent}` : s.percent}% from
                yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='gird-cols-1 grid gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle></CardTitle>
            <CardAction className='flex flex-col space-x-2'>
              <div>
                {btnTitle.map((b) => (
                  <Button
                    key={b.ko}
                    onClick={() => setSelectedKey(b.en)}
                    variant={b.en === selectedKey ? 'default' : 'ghost'}
                  >
                    {b.ko}
                  </Button>
                ))}
              </div>
              <div className='mt-2'>
                {btnFilter.map((b) => (
                  <Button
                    key={b}
                    onClick={() => setSelectedFilterKey(b)}
                    variant={b === selectedFilterKey ? 'default' : 'ghost'}
                  >
                    {b}
                  </Button>
                ))}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className='ps-2'>
            <StatisticLogsChart
              chartData={chartData}
              selectedKey={selectedKey}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>최근 게시글</CardTitle>
          </CardHeader>
          <CardContent>
            <LatestPosts data={latestPostsData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
