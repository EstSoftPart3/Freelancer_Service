import type { ReactNode } from 'react'
import { format } from 'date-fns'
import { Calendar, ImageIcon, Link2, MousePointerClick } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { type Banner } from '../data/schema'
import { useBanner } from './banner-provider'

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='grid grid-cols-[100px_1fr] gap-2 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <div>{children}</div>
    </div>
  )
}

const formatDtm = (value: string) => {
  try {
    return format(new Date(value), 'yyyy-MM-dd HH:mm')
  } catch {
    return value
  }
}

export function BannerViewDrawer() {
  const { open, setOpen, currentRow } = useBanner()
  const banner: Banner | null = open === 'view' ? currentRow : null

  return (
    <Sheet open={open === 'view'} onOpenChange={() => setOpen(null)}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
        {banner ? (
          <div className='space-y-6 pt-6'>
            <SheetHeader className='border-b pb-6 text-left'>
              <div className='mb-2'>
                <Badge
                  className={cn(
                    banner.isActive
                      ? 'bg-emerald-600 hover:bg-emerald-600'
                      : 'bg-muted-foreground/80'
                  )}
                >
                  {banner.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
              <SheetTitle className='text-2xl'>{banner.bannerTitle}</SheetTitle>
              <div className='mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <Calendar size={14} />
                  {formatDtm(banner.startDtm)} ~ {formatDtm(banner.endDtm)}
                </span>
                <span className='flex items-center gap-1'>
                  <MousePointerClick size={14} />
                  클릭 {banner.bannerClickCount.toLocaleString()}회
                </span>
              </div>
            </SheetHeader>

            {banner.bannerImageUrl ? (
              <img
                src={banner.bannerImageUrl}
                alt={banner.bannerTitle}
                className='w-full rounded-md border object-cover'
              />
            ) : (
              <div className='flex h-40 items-center justify-center rounded-md border bg-muted'>
                <ImageIcon className='h-8 w-8 text-muted-foreground' />
              </div>
            )}

            <div className='space-y-4'>
              <DetailRow label='배너 ID'>{banner.bannerSq}</DetailRow>
              <DetailRow label='노출 순서'>{banner.displayOrder}</DetailRow>
              <Separator />
              <DetailRow label='링크 URL'>
                {banner.bannerLinkUrl ? (
                  <span className='inline-flex items-center gap-1'>
                    <Link2 size={14} />
                    {banner.bannerLinkUrl}
                  </span>
                ) : (
                  <span className='text-muted-foreground'>—</span>
                )}
              </DetailRow>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
