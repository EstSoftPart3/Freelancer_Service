'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import type { BoardItem } from '@/types'

// h-10 행 높이(px)와 슬라이드 transition 시간 — translateY 계산·리셋 타이밍이 이 값에 묶여 있다.
const ROW_H = 40
const SLIDE_MS = 300
const INTERVAL_MS = 3500

interface Props {
  notices: BoardItem[]
}

// 공지 한 칸 롤링 배너 — 위로 슬라이드하며 전체 공지를 순환한다.
// 무한 롤링: 첫 항목을 끝에 복제해 마지막→처음 구간도 위로 흐르게 하고,
// 복제 항목에 도달하면 transition 없이 index 0으로 리셋한다.
export default function NoticeRollingBanner({ notices }: Props) {
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)
  const paused = useRef(false)

  useEffect(() => {
    if (notices.length < 2) return
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => i + 1)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [notices.length])

  useEffect(() => {
    if (index !== notices.length) return
    const t = setTimeout(() => {
      setAnimate(false)
      setIndex(0)
    }, SLIDE_MS)
    return () => clearTimeout(t)
  }, [index, notices.length])

  useEffect(() => {
    if (animate) return
    const raf = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(raf)
  }, [animate])

  if (notices.length === 0) return null

  const items = notices.length > 1 ? [...notices, notices[0]] : notices

  return (
    <div
      className="mb-4 flex items-center gap-3 rounded-lg border bg-muted/30 px-4"
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
    >
      <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold">
        <Megaphone className="h-4 w-4 text-primary" />
        공지
      </span>
      <div className="h-10 min-w-0 flex-1 overflow-hidden">
        <ul
          className={animate ? 'transition-transform duration-300 ease-in-out' : ''}
          style={{ transform: `translateY(-${index * ROW_H}px)` }}
        >
          {items.map((n, i) => (
            <li key={`${n.sq}-${i}`} className="flex h-10 items-center">
              <Link href={`/notice/${n.sq}`} className="truncate text-sm hover:text-primary hover:underline">
                {n.ttl}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link href="/notice" className="shrink-0 text-xs text-muted-foreground hover:text-primary hover:underline">
        더보기
      </Link>
    </div>
  )
}
