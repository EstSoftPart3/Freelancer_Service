import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface StatisticLogsChartProps {
  chartData: chartDataProps[]
  selectedKey: string
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

export function StatisticLogsChart({
  chartData,
  selectedKey,
}: StatisticLogsChartProps) {
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
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
          allowDecimals={false}
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
