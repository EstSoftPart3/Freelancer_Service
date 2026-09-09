import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

export const btnTitle = [
  { ko: '접속자', en: 'visitors' },
  { ko: '프로젝트', en: 'projects' },
  { ko: '프로젝트 지원', en: 'projectApplications' },
  { ko: '소속 지원', en: 'companyApplications' },
  { ko: '게시글', en: 'posts' },
  { ko: '댓글', en: 'comments' },
]

export const btnFilter = ['오늘', '어제', '일주일', '이번달']

export const getDateRange = (selectedFilterKey: string) => {
  const today = new Date()
  let startDate: string
  let endDate: string

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
