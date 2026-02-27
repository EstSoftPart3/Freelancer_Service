import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface StatisticLogsChartProps {
  weeklyData: weeklyDataProps[]
  selectedKey: string
}

interface weeklyDataProps {
  day: string
  visitors: number
  projects: number
  jobs: number
  posts: number
}

export function StatisticLogsChart({
  weeklyData,
  selectedKey,
}: StatisticLogsChartProps) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={weeklyData}>
        <XAxis
          dataKey='day'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey={selectedKey}
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
