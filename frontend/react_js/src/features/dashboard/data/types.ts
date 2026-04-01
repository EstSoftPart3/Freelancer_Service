export interface summaryDataProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  percent: string;
  yesterdayCount?: number;
}

export interface chartDataProps {
  day: string;
  visitors: number;
  projects: number;
  projectApplications: number;
  companyApplications: number;
  posts: number;
  comments: number;
}

export interface latestPostsDataProps {
  id: number;
  title: string;
  name: string;
  comments: number;
  time: string;
}

export type ApiResponse<T> = {
  status: string;
  message: string;
  output: T;
};
