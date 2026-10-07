'use client'
/* eslint-disable @next/next/no-img-element */
import { useState, type ImgHTMLAttributes, type ReactNode } from 'react'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null
  /** src 가 비었거나 불러오지 못했을 때 대신 보여 줄 것 */
  fallback: ReactNode
}

/**
 * 업로드 이미지(로고·프로필)용 <img>. 파일이 없으면(404) alt 글자가 틀 밖으로 튀어나오는 대신 fallback 을 보여 준다.
 * SSR 로 그려진 이미지는 하이드레이션 전에 실패하면 onError 가 오지 않아서, 마운트 때 한 번 더 확인한다.
 */
export default function FallbackImg({ src, fallback, onError, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src) return <>{fallback}</>
  return (
    <img
      {...rest}
      src={src}
      ref={(el) => { if (el?.complete && el.naturalWidth === 0) setFailedSrc(src) }}
      onError={(e) => { setFailedSrc(src); onError?.(e) }}
    />
  )
}
