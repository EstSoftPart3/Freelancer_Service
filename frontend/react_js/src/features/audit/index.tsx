// [Freelancer Service] 활동 로그 조회 (화면설계서용 더미 데이터)
import { useState } from 'react'
import { map } from 'zod'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { Download, RotateCcw, Search as SearchIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { api } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { DatePicker } from '@/components/date-picker'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AuditDialogs } from './components/audit-dialogs'
import {
  AuditProvider,
  useAudit,
  type AuditLog,
} from './components/audit-provider'

interface AuditListResponse {
  totalElements: number
  totalPages: number
  content: AuditLog[]
}

// 행위 유형 Badge 색상 매핑
function ActionBadge({ action }: { action: string }) {
  const variant =
    action === 'CREATE'
      ? 'default'
      : action === 'UPDATE'
        ? 'secondary'
        : 'destructive'

  const label =
    action === 'CREATE' ? '생성' : action === 'UPDATE' ? '수정' : '삭제'

  return <Badge variant={variant}>{label}</Badge>
}

// 유저 유형 Badge
function UserTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={type === '기업' ? 'outline' : 'secondary'}>{type}</Badge>
  )
}

// 테이블 내부 컴포넌트 (useAudit 사용을 위해 분리)
// 대상 유형 옵션 매핑 (유저 유형별)
const targetTypeOptions: Record<string, { value: string; label: string }[]> = {
  개인: [
    { value: 'all', label: '전체' },
    { value: '이력서', label: '이력서' },
    { value: '게시글', label: '게시글' },
    { value: '댓글', label: '댓글' },
  ],
  기업: [
    { value: 'all', label: '전체' },
    { value: '프로젝트', label: '프로젝트' },
    { value: '게시글', label: '게시글' },
    { value: '댓글', label: '댓글' },
  ],
}

function AuditTableContent() {
  const { setOpen, setCurrentRow } = useAudit()

  const [page, setPage] = useState(1)
  const [userType, setUserType] = useState('개인')
  const [actionType, setActionType] = useState('all')
  const [targetType, setTargetType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  )

  const { data, isLoading } = useQuery({
    queryKey: [
      'auditLogs',
      page,
      userType,
      userType,
      actionType,
      targetType,
      keyword,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await api.$get<{ output: AuditListResponse }>(
        '/audit/logs',
        {
          page,
          size: 10,
          userType: userType == 'all' ? '' : userType,
          actionType: actionType === 'all' ? '' : actionType,
          targetType: targetType === 'all' ? '' : targetType,
          keyword: keyword,
          startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
          endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        }
      )
      return response.output
    },
  })

  const logs = data?.content || []
  const totalElements = data?.totalElements || 0
  const totalPages = data?.totalPages || 1

  const handleUserTypeChange = (value: string) => {
    setUserType(value)
    setTargetType('all')
    setPage(1)
  }

  const handleReset = () => {
    setUserType('개인')
    setActionType('all')
    setTargetType('all')
    setSearchInput('')
    setKeyword('')
    setPage(1)
  }

  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  const handleRowClick = (log: AuditLog) => {
    setCurrentRow(log)
    setOpen('view')
  }

  const handleExcelDownload = async () => {
    try {
      const response = await api.$get<{ output: AuditListResponse }>(
        '/audit/logs',
        {
          page: 1,
          size: 9999,
          userType: userType === 'all' ? '' : userType,
          actionType: actionType === 'all' ? '' : actionType,
          targetType: targetType === 'all' ? '' : targetType,
          keyword,
          startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
          endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        }
      )

      const allLogs = response.output?.content || []
      if (allLogs.length === 0) {
        alert('다운로드할 데이터가 없습니다.')
        return
      }

      const excelData = allLogs.map((log) => ({
        '#': log.logSq,
        '유저 유형': log.userTypeCd,
        '유저 명': log.userNm,
        '분류': log.actionType,
        '대상 유형': log.targetType,
        '대상 제목': log.targetTitle,
        'IP 주소': log.ipAddress,
        '일시': format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      const worksbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(worksbook, worksheet, '활동 로그')

      XLSX.writeFile(
        worksbook,
        `활동로그_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
      )
    } catch (error) {
      console.error('엑셀 다운로드 에러:', error)
      alert('엑셀 다운로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* 페이지 제목 */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              활동 로그 조회
            </h2>
            <p className='text-muted-foreground'>
              기업/개인의 활동 이력을 조회하고 Excel로 추출합니다.
            </p>
          </div>
          <Button
            variant='outline'
            className='gap-2'
            onClick={handleExcelDownload}
          >
            <Download className='h-4 w-4' />
            Excel 다운로드
          </Button>
        </div>

        {/* 필터 툴바 */}
        <div className='flex flex-wrap items-center gap-3'>
          {/* 기간 필터 */}
          <div className='flex items-center gap-2'>
            <DatePicker
              selected={startDate}
              onSelect={setStartDate}
              placeholder='시작일 선택'
              className='w-[140px]'
            />
            <span className='text-muted-foreground'>~</span>
            <DatePicker
              selected={endDate}
              onSelect={setEndDate}
              placeholder='종료일 선택'
              className='w-[140px]'
            />
          </div>

          <Select value={userType} onValueChange={handleUserTypeChange}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='유저 유형' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='개인'>개인</SelectItem>
              <SelectItem value='기업'>기업</SelectItem>
            </SelectContent>
          </Select>

          {/* 행위 유형 */}
          <Select
            value={actionType}
            onValueChange={(val) => {
              setActionType(val)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='행위 유형' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체</SelectItem>
              <SelectItem value='CREATE'>생성</SelectItem>
              <SelectItem value='UPDATE'>수정</SelectItem>
              <SelectItem value='DELETE'>삭제</SelectItem>
            </SelectContent>
          </Select>

          {/* 대상 유형 (유저 유형에 따라 동적 변경) */}
          <Select
            value={targetType}
            onValueChange={(val) => {
              setTargetType(val)
              setPage(1)
            }}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='대상 유형' />
            </SelectTrigger>
            <SelectContent>
              {targetTypeOptions[userType]?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 키워드 검색 */}
          <Input
            placeholder='유저명, 대상 제목 검색...'
            className='w-[220px]'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />

          {/* 조회 버튼 */}
          <Button className='gap-2' onClick={handleSearch}>
            <SearchIcon className='h-4 w-4' />
            조회
          </Button>

          {/* 초기화 */}
          <Button
            variant='ghost'
            size='icon'
            title='필터 초기화'
            onClick={handleReset}
          >
            <RotateCcw className='h-4 w-4' />
          </Button>
        </div>

        {/* 테이블 */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[60px]'>#</TableHead>
                <TableHead className='w-[170px]'>일시</TableHead>
                <TableHead className='w-[90px]'>유저 유형</TableHead>
                <TableHead className='w-[100px]'>유저명</TableHead>
                <TableHead className='w-[80px]'>분류</TableHead>
                <TableHead className='w-[100px]'>대상 유형</TableHead>
                <TableHead>대상 제목</TableHead>
                <TableHead className='w-[140px]'>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow
                    key={log.logSq}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => handleRowClick(log)}
                  >
                    <TableCell className='font-medium'>{log.logSq}</TableCell>
                    <TableCell>{log.createdAt}</TableCell>
                    <TableCell>
                      <UserTypeBadge type={log.userTypeCd} />
                    </TableCell>
                    <TableCell>{log.userNm}</TableCell>
                    <TableCell>
                      <ActionBadge action={log.actionType} />
                    </TableCell>
                    <TableCell>{log.targetType}</TableCell>
                    <TableCell className='max-w-[300px] truncate'>
                      {log.targetTitle}
                    </TableCell>
                    <TableCell className='font-mono text-sm'>
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='h-24 text-center text-muted-foreground'
                  >
                    조회된 활동 로그 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 하단 페이징 영역 */}
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            총 <strong>{totalElements}</strong>건
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              이전
            </Button>
            <span className='text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              다음
            </Button>
          </div>
        </div>
      </Main>

      <AuditDialogs />
    </>
  )
}

export function AuditLogList() {
  return (
    <AuditProvider>
      <AuditTableContent />
    </AuditProvider>
  )
}
