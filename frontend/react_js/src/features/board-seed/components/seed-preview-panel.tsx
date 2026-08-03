import { useState } from 'react'
import DOMPurify from 'dompurify'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  type SeedCount,
  type SeedPlanResponse,
  type SeedPlanRow,
  type SeedSummary,
} from '../api/seed-api'

type Props = {
  plans: SeedPlanResponse[]
}

/**
 * 미리보기 결과.
 *
 * 여기 보이는 값이 그대로 저장된다 — 서버가 미리보기와 등록에서 같은 배분기를 부르고,
 * 등록 요청에 미리보기의 randomSeed 와 plannedAt 을 실어 보내기 때문이다.
 */
export function SeedPreviewPanel({ plans }: Props) {
  const summary = mergeSummaries(plans.map((p) => p.summary))
  const rows = plans.flatMap((p) => p.rows)
  const warnings = [...new Set(plans.flatMap((p) => p.warnings))]

  return (
    <div className='grid gap-4'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
        <Stat label='게시글' value={summary.totalBoards} />
        <Stat label='Q&A' value={summary.totalQna} />
        <Stat label='답변' value={summary.totalAnswers} />
        <Stat label='댓글' value={summary.totalComments} />
        <Stat
          label='작성일 범위'
          value={`${formatDate(summary.createdAtMin)} ~ ${formatDate(summary.createdAtMax)}`}
          small
        />
      </div>

      {warnings.length > 0 && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>확인이 필요합니다</AlertTitle>
          <AlertDescription>
            <ul className='ms-4 list-disc space-y-1'>
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className='grid gap-4 lg:grid-cols-3'>
        <DistributionCard title='카테고리' counts={summary.countByCategory} />
        <DistributionCard
          title='Q&A 채택상태'
          counts={summary.countByAdoptStatus}
        />
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm'>계정별 배분</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-1.5 text-sm'>
            {summary.countByAuthor.length === 0 && (
              <span className='text-muted-foreground'>-</span>
            )}
            {summary.countByAuthor.map((a) => (
              <div key={a.userSq} className='flex items-center justify-between'>
                <span className='truncate'>
                  {a.userNickname}
                  <span className='ms-1 text-xs text-muted-foreground'>
                    {a.userId}
                  </span>
                </span>
                <span className='text-muted-foreground'>
                  글 {a.boards} · 답변 {a.answers} · 댓글 {a.comments}
                </span>
              </div>
            ))}
            <p className='mt-1 text-xs text-muted-foreground'>
              한 닉네임에 몰리면 봇 티가 납니다. 계정을 늘리면 고르게 퍼집니다.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-sm'>
            배분 결과 {rows.length}건 — 행을 누르면 저장될 본문을 볼 수 있습니다
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-8' />
                  <TableHead className='w-16'>유형</TableHead>
                  <TableHead className='min-w-[220px]'>제목</TableHead>
                  <TableHead className='w-24'>작성자</TableHead>
                  <TableHead className='w-36'>작성일시</TableHead>
                  <TableHead className='w-24'>분류/상태</TableHead>
                  <TableHead className='w-16 text-end'>조회</TableHead>
                  <TableHead className='w-16 text-end'>댓글</TableHead>
                  <TableHead className='w-16 text-end'>답변</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <PlanRow key={`${row.index}-${i}`} row={row} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PlanRow({ row }: { row: SeedPlanRow }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow className='cursor-pointer' onClick={() => setOpen((v) => !v)}>
        <TableCell>
          {open ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </TableCell>
        <TableCell>
          <Badge variant={row.type === 'QNA' ? 'secondary' : 'outline'}>
            {row.type === 'QNA' ? 'Q&A' : '게시글'}
          </Badge>
        </TableCell>
        <TableCell className='font-medium'>{row.title}</TableCell>
        <TableCell>{row.userNickname}</TableCell>
        <TableCell className='text-muted-foreground'>
          {row.createdAt.replace('T', ' ').slice(0, 16)}
        </TableCell>
        <TableCell>{row.categoryNm ?? row.adoptStatusNm ?? '-'}</TableCell>
        <TableCell className='text-end'>{row.viewCnt}</TableCell>
        <TableCell className='text-end'>{row.comments.length}</TableCell>
        <TableCell className='text-end'>{row.answers.length}</TableCell>
      </TableRow>

      {open && (
        <TableRow>
          <TableCell colSpan={9} className='bg-muted/40'>
            <div className='grid gap-4 py-2'>
              <RenderedBody html={row.bodyHtml} />

              {row.comments.length > 0 && (
                <CommentList title='댓글' comments={row.comments} />
              )}

              {row.answers.map((answer, i) => (
                <div key={i} className='rounded-md border bg-background p-3'>
                  <div className='mb-2 flex flex-wrap items-center gap-2'>
                    <span className='font-medium'>{answer.title}</span>
                    {answer.adopted && <Badge>채택</Badge>}
                    <span className='text-xs text-muted-foreground'>
                      {answer.userNickname} ·{' '}
                      {answer.createdAt.replace('T', ' ').slice(0, 16)}
                    </span>
                  </div>
                  <RenderedBody html={answer.bodyHtml} />
                  {answer.comments.length > 0 && (
                    <CommentList title='답변 댓글' comments={answer.comments} />
                  )}
                </div>
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function RenderedBody({ html }: { html: string }) {
  return (
    <div
      className='prose prose-sm max-w-none dark:prose-invert [&_li]:ms-4 [&_ul]:list-disc'
      // 본문은 서버 변환기가 원문을 전부 escape 해서 만든 것이라 태그가 섞일 수 없다.
      // 그래도 FO 렌더 경로(BoardPost.tsx)와 같은 방어를 유지한다.
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}

function CommentList({
  title,
  comments,
}: {
  title: string
  comments: { userNickname: string; description: string; createdAt: string }[]
}) {
  return (
    <div className='grid gap-1 text-sm'>
      <span className='text-xs font-medium text-muted-foreground'>{title}</span>
      {comments.map((c, i) => (
        <div key={i} className='flex flex-wrap gap-2'>
          <span className='font-medium'>{c.userNickname}</span>
          <span>{c.description}</span>
          <span className='text-xs text-muted-foreground'>
            {c.createdAt.replace('T', ' ').slice(0, 16)}
          </span>
        </div>
      ))}
    </div>
  )
}

function DistributionCard({
  title,
  counts,
}: {
  title: string
  counts: SeedCount[]
}) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='grid gap-1.5 text-sm'>
        {counts.length === 0 && <span className='text-muted-foreground'>-</span>}
        {counts.map((c) => (
          <div key={c.code} className='flex items-center justify-between'>
            <span>{c.name}</span>
            <span className='text-muted-foreground'>{c.count}건</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  small,
}: {
  label: string
  value: number | string
  small?: boolean
}) {
  return (
    <div className='rounded-md border p-3'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className={small ? 'text-xs font-medium' : 'text-xl font-semibold'}>
        {value}
      </div>
    </div>
  )
}

function formatDate(value: string | null) {
  return value ? value.replace('T', ' ').slice(0, 16) : '-'
}

/** 청크가 여러 개여도 화면에는 하나의 결과로 보여야 한다. */
function mergeSummaries(summaries: SeedSummary[]): SeedSummary {
  const base: SeedSummary = {
    totalBoards: 0,
    totalQna: 0,
    totalAnswers: 0,
    totalComments: 0,
    countByCategory: [],
    countByAdoptStatus: [],
    countByAuthor: [],
    createdAtMin: null,
    createdAtMax: null,
  }

  return summaries.reduce((acc, s) => {
    acc.totalBoards += s.totalBoards
    acc.totalQna += s.totalQna
    acc.totalAnswers += s.totalAnswers
    acc.totalComments += s.totalComments
    acc.countByCategory = mergeCounts(acc.countByCategory, s.countByCategory)
    acc.countByAdoptStatus = mergeCounts(
      acc.countByAdoptStatus,
      s.countByAdoptStatus
    )
    acc.countByAuthor = mergeAuthors(acc.countByAuthor, s.countByAuthor)
    acc.createdAtMin = minDate(acc.createdAtMin, s.createdAtMin)
    acc.createdAtMax = maxDate(acc.createdAtMax, s.createdAtMax)
    return acc
  }, base)
}

function mergeCounts(a: SeedCount[], b: SeedCount[]): SeedCount[] {
  const map = new Map(a.map((c) => [c.code, { ...c }]))
  for (const c of b) {
    const found = map.get(c.code)
    if (found) found.count += c.count
    else map.set(c.code, { ...c })
  }
  return [...map.values()]
}

function mergeAuthors(
  a: SeedSummary['countByAuthor'],
  b: SeedSummary['countByAuthor']
): SeedSummary['countByAuthor'] {
  const map = new Map(a.map((x) => [x.userSq, { ...x }]))
  for (const x of b) {
    const found = map.get(x.userSq)
    if (found) {
      found.boards += x.boards
      found.answers += x.answers
      found.comments += x.comments
      found.total += x.total
    } else {
      map.set(x.userSq, { ...x })
    }
  }
  return [...map.values()].sort((x, y) => y.total - x.total)
}

function minDate(a: string | null, b: string | null) {
  if (!a) return b
  if (!b) return a
  return a < b ? a : b
}

function maxDate(a: string | null, b: string | null) {
  if (!a) return b
  if (!b) return a
  return a > b ? a : b
}
