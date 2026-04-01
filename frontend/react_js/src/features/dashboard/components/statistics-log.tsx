import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  fetchChartData,
  fetchSummaryData,
  fetchLatestPostsData,
} from '../api/statistics-api';
import { btnTitle, btnFilter, getDateRange } from '../data/constants';
import type {
  summaryDataProps,
  chartDataProps,
  latestPostsDataProps,
} from '../data/types';
import { LatestPosts } from './latest-posts';
import { StatisticLogsChart } from './statistic-logs-chart';

export function StatisticsLogs() {
  const [selectedKey, setSelectedKey] = useState(btnTitle[0].en);
  const [selectedFilterKey, setSelectedFilterKey] = useState('일주일');
  const [summaryData, setSummaryData] = useState<summaryDataProps[]>([]);
  const [chartData, setChartData] = useState<chartDataProps[]>([]);
  const [latestPostsData, setLatestPostsData] = useState<
    latestPostsDataProps[]
  >([]);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const { startDate, endDate } = getDateRange(selectedFilterKey);
        const data = await fetchChartData(startDate, endDate);
        setChartData(data);
      } catch (_) {
        toast.error('차트 조회 중 오류가 발생했습니다.');
      }
    };
    fetchChart();
  }, [selectedKey, selectedFilterKey]);

  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const [summary, latestPosts] = await Promise.all([
          fetchSummaryData(),
          fetchLatestPostsData(),
        ]);
        setSummaryData(summary);
        setLatestPostsData(latestPosts);
      } catch (_) {
        toast.error('데이터 조회 중 오류가 발생했습니다.');
      }
    };
    fetchStatic();
  }, [selectedKey, selectedFilterKey]);

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
                <br />
                <br />
                {s.yesterdayCount ?? 0} previous day
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
  );
}
