import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LatestPosts } from './latest-posts'
import { StatisticLogsChart } from './statistic-logs-chart'

const btnTitle = ['visitors', 'projects', 'jobs', 'posts', 'comments']

const tableHead = ['사용자', '활동', '시간', 'IP']

const accessLogs = [
  {
    id: 1,
    user: 'kim@example.com',
    action: '로그인',
    time: '10:42',
    ip: '192.168.0.1',
  },
  {
    id: 2,
    user: 'lee@example.com',
    action: '프로젝트 등록',
    time: '10:38',
    ip: '10.0.0.5',
  },
  {
    id: 3,
    user: 'park@example.com',
    action: '채용 공고 지원',
    time: '10:31',
    ip: '172.16.0.3',
  },
  {
    id: 4,
    user: 'choi@example.com',
    action: '댓글 작성',
    time: '10:20',
    ip: '192.168.1.9',
  },
  {
    id: 5,
    user: 'jung@example.com',
    action: '로그인',
    time: '10:15',
    ip: '10.0.1.12',
  },
  {
    id: 6,
    user: 'yoon@example.com',
    action: '프로젝트 지원',
    time: '10:08',
    ip: '192.168.2.7',
  },
]

const summaryData = [
  {
    title: 'Total Clicks',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        className='h-4 w-4 text-muted-foreground'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          d='M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z'
        />
      </svg>
    ),
    count: 110,
    percent: '+12%',
  },
  {
    title: 'New Project',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        className='h-4 w-4 text-muted-foreground'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z'
        />
      </svg>
    ),
    count: 4,
    percent: '+11%,',
  },
  {
    title: 'Active Job Postings',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        className='h-4 w-4 text-muted-foreground'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          d='m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
        />
      </svg>
    ),
    count: 3,
    percent: '+11%,',
  },
  {
    title: 'Today Posts',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        className='h-4 w-4 text-muted-foreground'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          d='M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184'
        />
      </svg>
    ),
    count: 20,
    percent: '+14%,',
  },
  {
    title: 'Today Comment',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        className='h-4 w-4 text-muted-foreground'
      >
        <path
          stroke-linecap='round'
          stroke-linejoin='round'
          d='M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155'
        />
      </svg>
    ),
    count: 137,
    percent: '+15%,',
  },
]

const weeklyData = [
  { day: '월', visitors: 120, projects: 3, jobs: 5, posts: 18, comments: 15 },
  { day: '화', visitors: 98, projects: 5, jobs: 3, posts: 22, comments: 32 },
  { day: '수', visitors: 145, projects: 2, jobs: 7, posts: 15, comments: 28 },
  { day: '목', visitors: 200, projects: 8, jobs: 4, posts: 30, comments: 25 },
  { day: '금', visitors: 178, projects: 6, jobs: 6, posts: 27, comments: 12 },
  { day: '토', visitors: 90, projects: 1, jobs: 2, posts: 12, comments: 13 },
  { day: '일', visitors: 110, projects: 4, jobs: 3, posts: 20, comments: 12 },
]

export function StatisticsLogs() {
  const [selectedKey, setSelectedKey] = useState('visitors')

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
            <CardTitle>Last 7 Days Trend</CardTitle>
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
            <CardTitle>Latest Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <LatestPosts />
          </CardContent>
        </Card>
      </div>
      <div className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Access & Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHead.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLogs.map((log) => {
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell>{log.ip}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
