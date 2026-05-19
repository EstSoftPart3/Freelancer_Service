'use client'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function CommonPagination({ currentPage, totalPages, onPageChange }: Props) {
  const WINDOW = 5
  const half = Math.floor(WINDOW / 2)
  let start = Math.max(1, currentPage - half)
  const end = Math.min(totalPages, start + WINDOW - 1)
  if (end - start + 1 < WINDOW) start = Math.max(1, end - WINDOW + 1)

  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav className="mt-4 flex items-center justify-center gap-1">
      <Button
        variant="outline" size="icon-sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="icon-sm"
          variant={p === currentPage ? 'default' : 'ghost'}
          className={cn(p === currentPage && 'pointer-events-none')}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline" size="icon-sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
