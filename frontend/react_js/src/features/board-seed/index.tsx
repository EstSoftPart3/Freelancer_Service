import { useMemo, useState } from 'react'
import { ClipboardCopy, Loader2, Play, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  SEED_CHUNK_SIZE,
  seedApi,
  type SeedOptions,
  type SeedPlanResponse,
  type SeedPostInput,
} from './api/seed-api'
import { SeedOptionsPanel } from './components/seed-options-panel'
import { SeedPreviewPanel } from './components/seed-preview-panel'
import { SeedRevokePanel } from './components/seed-revoke-panel'
import { parseSeedJson } from './data/parse-seed-json'
import { saveBatch } from './data/seed-batch-store'

const DEFAULT_OPTIONS: SeedOptions = {
  spreadDays: 60,
  hotWindowRatio: [2, 3, 3, 2],
  authorUserSqs: null,
  commentMin: 1,
  commentMax: 4,
  answerMin: 1,
  answerMax: 3,
  viewMin: 10,
  viewMax: 500,
  adoptRatio: { inProgress: 40, adopted: 30, selfSolved: 15, unresolved: 15 },
  balanceCategories: true,
}

type Previewed = {
  chunks: SeedPostInput[][]
  plans: SeedPlanResponse[]
}

/**
 * 커뮤니티 더미데이터 시드.
 *
 * 흐름은 <b>프롬프트 복사 → 외부 AI → 붙여넣기 → 미리보기 → 등록</b> 이다.
 * AI 는 콘텐츠만 만들고 작성자·작성일시·카테고리·채택상태는 서버가 배분한다.
 */
export function BoardSeed() {
  const [rawJson, setRawJson] = useState('')
  const [options, setOptions] = useState<SeedOptions>(DEFAULT_OPTIONS)
  const [previewed, setPreviewed] = useState<Previewed | null>(null)
  const [promptCount, setPromptCount] = useState(20)
  const [isBusy, setIsBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const parsed = useMemo(() => parseSeedJson(rawJson), [rawJson])
  const chunkCount = Math.ceil(parsed.posts.length / SEED_CHUNK_SIZE)

  /** 입력이나 옵션이 바뀌면 이전 미리보기는 더 이상 그 입력의 결과가 아니다. */
  const invalidatePreview = () => setPreviewed(null)

  const handleCopyPrompt = async () => {
    try {
      const res = await seedApi.getPrompt(promptCount)
      await navigator.clipboard.writeText(res.output)
      toast.success('프롬프트를 복사했습니다. 다른 AI 에 붙여넣어주세요.')
    } catch {
      toast.error('프롬프트를 가져오지 못했습니다.')
    }
  }

  const handlePreview = async () => {
    if (parsed.error) {
      toast.error(parsed.error)
      return
    }

    setIsBusy(true)
    setPreviewed(null)
    try {
      const chunks = chunk(parsed.posts, SEED_CHUNK_SIZE)
      // 청크마다 다른 시드를 써야 같은 콘텐츠가 같은 배분을 받지 않는다.
      const baseSeed = Date.now()
      const plans: SeedPlanResponse[] = []

      for (let i = 0; i < chunks.length; i++) {
        setProgress(`미리보기 ${i + 1}/${chunks.length}`)
        const res = await seedApi.preview({
          randomSeed: baseSeed + i,
          options,
          posts: chunks[i],
        })
        plans.push(res.output)
      }

      setPreviewed({ chunks, plans })
      toast.success(`${parsed.posts.length}건의 배분 계획을 만들었습니다.`)
    } catch (error) {
      toast.error(messageOf(error, '미리보기에 실패했습니다.'))
    } finally {
      setIsBusy(false)
      setProgress('')
    }
  }

  const handleCommit = async () => {
    if (!previewed) return

    setIsBusy(true)
    setConfirmOpen(false)
    const boardSqs: number[] = []
    let boards = 0
    let answers = 0
    let comments = 0

    try {
      for (let i = 0; i < previewed.chunks.length; i++) {
        setProgress(`등록 ${i + 1}/${previewed.chunks.length}`)
        const plan = previewed.plans[i]
        // 미리보기가 준 시드와 기준 시각을 그대로 되돌려줘야 화면에서 본 것이 저장된다.
        const res = await seedApi.commit({
          randomSeed: plan.randomSeed,
          plannedAt: plan.plannedAt,
          options,
          posts: previewed.chunks[i],
        })
        const out = res.output
        boardSqs.push(...out.boardSqs)
        boards += out.insertedBoards
        answers += out.insertedAnswers
        comments += out.insertedComments
      }

      saveBatch({
        executedAt: new Date().toISOString(),
        boardSqs,
        boards,
        answers,
        comments,
      })

      toast.success(
        `게시글 ${boards}건, 답변 ${answers}건, 댓글 ${comments}건을 등록했습니다.`
      )
      setPreviewed(null)
      setRawJson('')
    } catch (error) {
      // 청크 단위 트랜잭션이라 앞 청크는 이미 들어가 있다. 회수 근거를 남긴다.
      if (boardSqs.length > 0) {
        saveBatch({
          executedAt: new Date().toISOString(),
          boardSqs,
          boards,
          answers,
          comments,
        })
        toast.error(
          `등록 도중 실패했습니다. 먼저 들어간 ${boards}건은 회수 탭에서 되돌릴 수 있습니다.`
        )
      } else {
        toast.error(messageOf(error, '등록에 실패했습니다.'))
      }
      setPreviewed(null)
    } finally {
      setIsBusy(false)
      setProgress('')
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
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>커뮤니티 시드</h2>
          <p className='text-muted-foreground'>
            외부 AI 가 만든 글을 붙여넣으면 작성자·작성일시·카테고리·채택상태를
            배분해 등록합니다.
          </p>
        </div>

        <Tabs defaultValue='create'>
          <TabsList>
            <TabsTrigger value='create'>등록</TabsTrigger>
            <TabsTrigger value='revoke'>회수</TabsTrigger>
          </TabsList>

          <TabsContent value='create' className='mt-4 grid gap-4'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>1. 프롬프트 복사</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  카테고리 목록을 공통코드에서 읽어 만듭니다. 다른 AI 에
                  붙여넣으면 이 화면이 받을 수 있는 형태로 답을 줍니다.
                </p>
              </CardHeader>
              <CardContent className='flex flex-wrap items-end gap-3'>
                <div className='grid gap-1.5'>
                  <Label className='text-sm'>요청할 건수</Label>
                  <Input
                    type='number'
                    min={1}
                    max={50}
                    className='w-28'
                    value={promptCount}
                    onChange={(e) => setPromptCount(Number(e.target.value))}
                  />
                </div>
                <Button variant='outline' onClick={handleCopyPrompt}>
                  <ClipboardCopy className='me-1 h-4 w-4' />
                  프롬프트 복사
                </Button>
              </CardContent>
            </Card>

            <SeedOptionsPanel
              value={options}
              disabled={isBusy}
              onChange={(next) => {
                setOptions(next)
                invalidatePreview()
              }}
            />

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-base'>2. 결과 붙여넣기</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  코드펜스(```json)가 붙어 있어도 됩니다. 한 번에 최대{' '}
                  {SEED_CHUNK_SIZE}건씩 나눠 등록합니다.
                </p>
              </CardHeader>
              <CardContent className='grid gap-3'>
                <Textarea
                  className='min-h-[280px] font-mono text-xs'
                  placeholder='[ { "type": "BOARD", "title": "...", "body": "...", "comments": [ ... ] } ]'
                  value={rawJson}
                  disabled={isBusy}
                  onChange={(e) => {
                    setRawJson(e.target.value)
                    invalidatePreview()
                  }}
                />

                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <p className='text-sm'>
                    {rawJson.trim().length === 0 ? (
                      <span className='text-muted-foreground'>
                        아직 입력이 없습니다.
                      </span>
                    ) : parsed.error ? (
                      <span className='font-medium text-destructive'>
                        {parsed.error}
                      </span>
                    ) : (
                      <span className='text-muted-foreground'>
                        {parsed.posts.length}건 인식
                        {chunkCount > 1 && ` · ${chunkCount}회로 나눠 등록`}
                      </span>
                    )}
                  </p>

                  <div className='flex items-center gap-2'>
                    {progress && (
                      <span className='text-sm text-muted-foreground'>
                        {progress}
                      </span>
                    )}
                    <Button
                      variant='outline'
                      disabled={isBusy || !!parsed.error}
                      onClick={handlePreview}
                    >
                      {isBusy && !confirmOpen ? (
                        <Loader2 className='me-1 h-4 w-4 animate-spin' />
                      ) : (
                        <Sparkles className='me-1 h-4 w-4' />
                      )}
                      미리보기
                    </Button>
                    <Button
                      disabled={isBusy || !previewed}
                      onClick={() => setConfirmOpen(true)}
                    >
                      <Play className='me-1 h-4 w-4' />
                      등록
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {previewed && <SeedPreviewPanel plans={previewed.plans} />}
          </TabsContent>

          <TabsContent value='revoke' className='mt-4'>
            <SeedRevokePanel />
          </TabsContent>
        </Tabs>
      </Main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isLoading={isBusy}
        title='등록하시겠습니까?'
        desc={
          previewed ? (
            <>
              미리보기에 보인 <strong>{countRows(previewed)}</strong>건을 그대로
              등록합니다.
              <br />
              등록 후에는 회수 탭에서 이 회차만 되돌릴 수 있습니다.
            </>
          ) : (
            ''
          )
        }
        cancelBtnText='취소'
        confirmText='등록'
        handleConfirm={handleCommit}
      />
    </>
  )
}

function countRows(previewed: Previewed) {
  return previewed.plans.reduce((sum, p) => sum + p.rows.length, 0)
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size))
  }
  return result
}

function messageOf(error: unknown, fallback: string) {
  const message = (
    error as { response?: { data?: { message?: string } } }
  )?.response?.data?.message
  return message || fallback
}
