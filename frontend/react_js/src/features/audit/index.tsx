// [Freelancer Service] 활동 로그 조회 (화면설계서용 더미 데이터)
import { useState } from 'react'
import { Download, RotateCcw, Search as SearchIcon } from 'lucide-react'
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

// 더미 데이터 (각 대상별 도메인 폼 구조에 맞춰 정비 - 최신 내림차순 정렬)
const dummyLogs: AuditLog[] = [
  {
    logSq: 6,
    createdAt: '2026-05-28 11:20:15',
    userTypeCd: '개인',
    userNm: '홍길동',
    actionType: 'CREATE',
    targetType: '이력서',
    targetTitle: '개발자 홍길동 이력서',
    ipAddress: '192.168.1.104',
    afterData: {
      "이력서제목": "5년차 프론트엔드 개발자 홍길동 이력서",
      "희망직무": "React 프론트엔드 개발자",
      "보유기술": "React, TypeScript, Next.js, Redux",
      "자기소개": "안녕하세요. 사용자 경험을 소중히 생각하는 개발자입니다."
    }
  },
  {
    logSq: 5,
    createdAt: '2026-05-28 10:45:30',
    userTypeCd: '기업',
    userNm: '주식회사 네오',
    actionType: 'CREATE',
    targetType: '프로젝트',
    targetTitle: 'AI 매칭 프리랜서 플랫폼 반응형 퍼블리싱 구축',
    ipAddress: '211.233.19.45',
    afterData: {
      "프로젝트명": "AI 매칭 프리랜서 플랫폼 반응형 퍼블리싱 구축",
      "예산": "12,000,000 원",
      "개발기간": "2개월",
      "필요기술": "HTML5, CSS3, Tailwind CSS, JavaScript",
      "상세내용": "모바일 및 PC 반응형 UI/UX 퍼블리싱 작업을 발주합니다."
    }
  },
  {
    logSq: 4,
    createdAt: '2026-05-27 16:30:10',
    userTypeCd: '기업',
    userNm: '주식회사 테크솔루션',
    actionType: 'UPDATE',
    targetType: '게시글',
    targetTitle: '기업 회원 서비스 이용 수수료 인하 안내',
    ipAddress: '203.242.15.89',
    beforeData: {
      "제목": "기업 회원 서비스 이용 수수료 안내",
      "내용": "기존 기업 회원의 매칭 수수료는 일괄 10%가 적용됩니다."
    },
    afterData: {
      "제목": "기업 회원 서비스 이용 수수료 인하 안내",
      "내용": "신규 이벤트로 인해 당분간 매칭 수수료가 5%로 특별 인하됩니다."
    }
  },
  {
    logSq: 3,
    createdAt: '2026-05-27 14:15:22',
    userTypeCd: '개인',
    userNm: '이순신',
    actionType: 'DELETE',
    targetType: '게시글',
    targetTitle: '개인 개발 외주 시 세금 처리 질문 글',
    ipAddress: '112.223.14.88',
    beforeData: {
      "제목": "개인 개발 외주 시 세금 처리 질문 글",
      "내용": "원천징수 3.3% 제외하고 지급 받는 것이 맞나요?"
    }
  },
  {
    logSq: 2,
    createdAt: '2026-05-27 09:35:40',
    userTypeCd: '기업',
    userNm: '주식회사 리액트',
    actionType: 'CREATE',
    targetType: '댓글',
    targetTitle: '프론트엔드 포트폴리오 리뷰 요청의 댓글',
    ipAddress: '192.168.0.22',
    afterData: '경력 기술이 매우 상세하여 매력적입니다. 저희 공고에도 지원해주세요!'
  },
  {
    logSq: 1,
    createdAt: '2026-05-27 09:30:15',
    userTypeCd: '개인',
    userNm: '김철수',
    actionType: 'UPDATE',
    targetType: '댓글',
    targetTitle: 'AI 프리랜서 플랫폼 반응형 퍼블리싱 구축의 댓글',
    ipAddress: '192.168.0.101',
    beforeData: '경력이 2년인데 퍼블리싱 지원 가능한가요?',
    afterData: '지원 가능한 필요 학력 조건이 혹시 대졸 이상인가요?'
  },
]

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
  individual: [
    { value: 'all', label: '전체' },
    { value: 'resume', label: '이력서' },
    { value: 'board', label: '게시글' },
    { value: 'comment', label: '댓글' },
  ],
  company: [
    { value: 'all', label: '전체' },
    { value: 'project', label: '프로젝트' },
    { value: 'board', label: '게시글' },
    { value: 'comment', label: '댓글' },
  ],
}

function AuditTableContent() {
  const { setOpen, setCurrentRow } = useAudit()
  const [userType, setUserType] = useState('individual')
  const [actionType, setActionType] = useState('all')
  const [targetType, setTargetType] = useState('all')
  const [keyword, setKeyword] = useState('')
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(() => {
    // 최초 접속 시 기본값인 '개인'('individual') 유저 데이터만 노출하도록 초기 필터링 설정
    return dummyLogs.filter(log => log.userTypeCd === '개인')
  })

  // 유저 유형 변경 핸들러
  const handleUserTypeChange = (value: string) => {
    setUserType(value)
    // 현재 선택된 대상 유형이 새 목록에 없으면 '전체'로 초기화
    const newOptions = targetTypeOptions[value]
    const exists = newOptions.some((opt) => opt.value === targetType)
    let nextTargetType = targetType
    if (!exists) {
      setTargetType('all')
      nextTargetType = 'all'
    }

    // 유저 유형 변경 시 바로 실시간 필터 적용
    applyFilters(value, actionType, nextTargetType, keyword)
  }

  // 행위 유형 변경 핸들러
  const handleActionTypeChange = (value: string) => {
    setActionType(value)
    applyFilters(userType, value, targetType, keyword)
  }

  // 대상 유형 변경 핸들러
  const handleTargetTypeChange = (value: string) => {
    setTargetType(value)
    applyFilters(userType, actionType, value, keyword)
  }

  // 필터 초기화 핸들러
  const handleReset = () => {
    setUserType('individual')
    setActionType('all')
    setTargetType('all')
    setKeyword('')
    // 개인에 필터된 기본 목록으로 초기화
    setFilteredLogs(dummyLogs.filter(log => log.userTypeCd === '개인'))
  }

  // 필터링 적용 핵심 로직
  const applyFilters = (
    currentUserType: string,
    currentActionType: string,
    currentTargetType: string,
    currentKeyword: string
  ) => {
    const result = dummyLogs.filter((log) => {
      // 1. 유저 유형 (개인 / 기업)
      const userTypeLabel = currentUserType === 'individual' ? '개인' : '기업'
      if (log.userTypeCd !== userTypeLabel) return false

      // 2. 행위 유형 (생성 / 수정 / 삭제)
      if (currentActionType !== 'all') {
        const actionLabel =
          currentActionType === 'create'
            ? 'CREATE'
            : currentActionType === 'update'
              ? 'UPDATE'
              : 'DELETE'
        if (log.actionType !== actionLabel) return false
      }

      // 3. 대상 유형 (이력서, 프로젝트, 게시글, 댓글)
      if (currentTargetType !== 'all') {
        const targetOption = targetTypeOptions[currentUserType].find(
          (opt) => opt.value === currentTargetType
        )
        if (targetOption && log.targetType !== targetOption.label) {
          return false
        }
      }

      // 4. 키워드 검색 (유저명 또는 대상 제목)
      if (currentKeyword.trim() !== '') {
        const lowerKeyword = currentKeyword.toLowerCase()
        const matchUser = log.userNm.toLowerCase().includes(lowerKeyword)
        const matchTitle = log.targetTitle.toLowerCase().includes(lowerKeyword)
        if (!matchUser && !matchTitle) return false
      }

      return true
    })

    setFilteredLogs(result)
  }

  const handleSearch = () => {
    applyFilters(userType, actionType, targetType, keyword)
  }

  const handleRowClick = (log: AuditLog) => {
    setCurrentRow(log)
    setOpen('view')
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
          <Button variant='outline' className='gap-2'>
            <Download className='h-4 w-4' />
            Excel 다운로드
          </Button>
        </div>

        {/* 필터 툴바 */}
        <div className='flex flex-wrap items-center gap-3'>
          {/* 기간 필터 */}
          <div className='flex items-center gap-2'>
            <Input
              type='date'
              className='w-[150px]'
              defaultValue='2026-05-01'
            />
            <span className='text-muted-foreground'>~</span>
            <Input
              type='date'
              className='w-[150px]'
              defaultValue='2026-05-27'
            />
          </div>

          {/* 유저 유형 */}
          <Select value={userType} onValueChange={handleUserTypeChange}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='유저 유형' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='individual'>개인</SelectItem>
              <SelectItem value='company'>기업</SelectItem>
            </SelectContent>
          </Select>

          {/* 행위 유형 */}
          <Select value={actionType} onValueChange={handleActionTypeChange}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='행위 유형' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>전체</SelectItem>
              <SelectItem value='create'>생성</SelectItem>
              <SelectItem value='update'>수정</SelectItem>
              <SelectItem value='delete'>삭제</SelectItem>
            </SelectContent>
          </Select>

          {/* 대상 유형 (유저 유형에 따라 동적 변경) */}
          <Select value={targetType} onValueChange={handleTargetTypeChange}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='대상 유형' />
            </SelectTrigger>
            <SelectContent>
              {targetTypeOptions[userType].map((opt) => (
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
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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
          <Button variant='ghost' size='icon' title='필터 초기화' onClick={handleReset}>
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
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
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
                  <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
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
            총 <strong>{filteredLogs.length}</strong>건
          </p>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' disabled>
              이전
            </Button>
            <span className='text-sm'>1 / 1</span>
            <Button variant='outline' size='sm' disabled>
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
