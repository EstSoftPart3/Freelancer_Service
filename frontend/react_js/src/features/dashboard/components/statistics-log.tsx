import { useEffect, useState } from 'react'
import console from 'node:console'
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

interface weeklyDataProps {
  day: string
  visitors: number
  projects: number
  jobs: number
  posts: number
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
const btnTitle = ['접속자', '프로젝트', '채용', '게시글', '댓글']

export function StatisticsLogs() {
  const [selectedKey, setSelectedKey] = useState('접속자')
  const [summaryData, setSummaryData] = useState<summaryDataProps[]>([])
  const [weeklyData, setWeeklyData] = useState<weeklyDataProps[]>([])
  const [latestPostsData, setLatestPostsData] = useState<
    latestPostsDataProps[]
  >([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [weeklyData, summaryData, latestPostsData] = await Promise.all([
          api.$get<ApiResponse<weeklyDataProps[]>>('/dashboard/weekly'),
          api.$get<ApiResponse<summaryDataProps[]>>('/dashboard/summary'),
          api.$get<ApiResponse<latestPostsDataProps[]>>(
            '/dashboard/latestpost'
          ),
        ])

        setWeeklyData(weeklyData.output)
        setSummaryData(summaryData.output)
        setLatestPostsData(latestPostsData.output)
      } catch (error) {
        console.error(error)
      }
    }
    fetchAll()
  }, [])

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {summaryData.map((s) => (
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{s.title}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{s.count}</div>
              <p className='text-xs text-muted-foreground'>{s.percent}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='gird-cols-1 grid gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>최근 *** 일간의 추의</CardTitle>
            <CardAction className='space-x-2'>
              {btnTitle.map((b) => (
                <Button
                  onClick={() => setSelectedKey(b)}
                  variant={b === selectedKey ? 'default' : 'ghost'}
                >
                  {b}
                </Button>
              ))}
            </CardAction>
          </CardHeader>
          <CardContent className='ps-2'>
            <StatisticLogsChart
              weeklyData={weeklyData}
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
