// 활동 로그 상세 보기 Drawer
import { Calendar, Globe, Monitor, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAudit } from './audit-provider'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditViewDrawer({ open, onOpenChange }: Props) {
  const { currentRow } = useAudit()

  if (!currentRow) return null

  // 행위 유형 라벨/색상
  const actionLabel =
    currentRow.actionType === 'CREATE'
      ? '생성'
      : currentRow.actionType === 'UPDATE'
        ? '수정'
        : '삭제'

  const actionVariant =
    currentRow.actionType === 'CREATE'
      ? 'default'
      : currentRow.actionType === 'UPDATE'
        ? 'secondary'
        : 'destructive'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-2xl'>
        <div className='space-y-6 pt-6'>
          {/* 헤더 */}
          <SheetHeader className='border-b pb-6 text-left'>
            <div className='mb-3 flex items-center gap-2'>
              <Badge
                variant={
                  actionVariant as 'default' | 'secondary' | 'destructive'
                }
              >
                {actionLabel}
              </Badge>
              <Badge
                variant={
                  currentRow.userTypeCd === '기업' ? 'outline' : 'secondary'
                }
              >
                {currentRow.userTypeCd}
              </Badge>
              <Badge variant='outline'>{currentRow.targetType}</Badge>
            </div>
            <SheetTitle className='text-xl'>
              {currentRow.targetTitle}
            </SheetTitle>
          </SheetHeader>

          {/* 기본 정보 */}
          <div className='space-y-4'>
            <h4 className='text-sm font-semibold text-muted-foreground'>
              로그 상세 정보
            </h4>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex items-center gap-2 text-sm'>
                <User size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground'>행위자</span>
                <span className='font-medium'>{currentRow.userNm}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground'>일시</span>
                <span className='font-medium'>{currentRow.createdAt}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Globe size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground'>IP 주소</span>
                <span className='font-mono font-medium'>
                  {currentRow.ipAddress}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <Monitor size={14} className='text-muted-foreground' />
                <span className='text-muted-foreground'>대상 유형</span>
                <span className='font-medium'>{currentRow.targetType}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* UPDATE인 경우: 수정 전/후 비교 */}
          {currentRow.actionType === 'UPDATE' && (
            <div className='space-y-4'>
              <h4 className='text-sm font-semibold text-muted-foreground'>
                변경 내용
              </h4>
              <div className='flex flex-col gap-4'>
                {/* 수정 전 */}
                <div className='space-y-2 rounded-lg border p-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full' />
                    <span className='text-sm font-semibold'>수정 전</span>
                  </div>
                  {currentRow.beforeData &&
                    (typeof currentRow.beforeData === 'string' ? (
                      <div className='text-sm whitespace-pre-wrap'>
                        {currentRow.beforeData}
                      </div>
                    ) : (
                      Object.entries(currentRow.beforeData).map(
                        ([key, value]) => (
                          <div key={key} className='text-sm'>
                            <span className='font-medium text-muted-foreground'>
                              {key}:
                            </span>{' '}
                            <span>{value}</span>
                          </div>
                        )
                      )
                    ))}
                </div>
                {/* 수정 후 */}
                <div className='space-y-2 rounded-lg border p-4'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 rounded-full' />
                    <span className='text-sm font-semibold'>수정 후</span>
                  </div>
                  {currentRow.afterData &&
                    (typeof currentRow.afterData === 'string' ? (
                      <div>{currentRow.afterData}</div>
                    ) : (
                      Object.entries(currentRow.afterData).map(
                        ([key, value]) => (
                          <div key={key} className='text-sm'>
                            <span className='font-medium text-muted-foreground'>
                              {key}:
                            </span>{' '}
                            <span>{value}</span>
                          </div>
                        )
                      )
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* CREATE인 경우: 생성된 데이터 표시 */}
          {currentRow.actionType === 'CREATE' && (
            <div className='space-y-4'>
              <h4 className='text-sm font-semibold text-muted-foreground'>
                내용
              </h4>
              <div className='rounded-lg border p-4'>
                {currentRow.afterData &&
                  (typeof currentRow.afterData === 'string' ? (
                    <div className='text-sm whitespace-pre-wrap'>
                      {currentRow.afterData}
                    </div>
                  ) : (
                    Object.entries(currentRow.afterData).map(([key, value]) => (
                      <div key={key} className='py-1 text-sm'>
                        <span className='font-medium text-muted-foreground'>
                          {key}:
                        </span>{' '}
                        <span>{value}</span>
                      </div>
                    ))
                  ))}
              </div>
            </div>
          )}

          {/* DELETE인 경우: 삭제된 데이터 표시 */}
          {currentRow.actionType === 'DELETE' && (
            <div className='space-y-4'>
              <h4 className='text-sm font-semibold text-muted-foreground'>
                삭제된 내용
              </h4>
              <div className='rounded-lg border p-4'>
                {currentRow.beforeData &&
                  (typeof currentRow.beforeData === 'string' ? (
                    <div className='text-sm whitespace-pre-wrap line-through'>
                      {currentRow.beforeData}
                    </div>
                  ) : (
                    Object.entries(currentRow.beforeData).map(
                      ([key, value]) => (
                        <div key={key} className='py-1 text-sm'>
                          <span className='font-medium text-muted-foreground'>
                            {key}:
                          </span>{' '}
                          <span className='line-through'>{value}</span>
                        </div>
                      )
                    )
                  ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
