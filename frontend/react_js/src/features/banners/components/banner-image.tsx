import { useEffect, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { api, baseUrl } from '@/lib/api'

function toApiPath(url: string): string {
  if (url.startsWith(baseUrl)) {
    return url.slice(baseUrl.length)
  }
  return url.startsWith('/') ? url : `/${url}`
}

type Props = {
  src?: string
  alt: string
  className?: string
  placeholderClassName?: string
}

export function BannerImage({
  src,
  alt,
  className,
  placeholderClassName,
}: Props) {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) {
      setDisplaySrc(null)
      return
    }

    if (!src.includes('/files/')) {
      setDisplaySrc(src)
      return
    }

    let objectUrl: string | null = null
    const path = toApiPath(src)

    api
      .$getBlob(path)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setDisplaySrc(objectUrl)
      })
      .catch(() => setDisplaySrc(null))

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (!displaySrc) {
    return (
      <div
        className={
          placeholderClassName ??
          'flex items-center justify-center rounded border bg-muted'
        }
      >
        <ImageIcon className='h-4 w-4 text-muted-foreground' />
      </div>
    )
  }

  return <img src={displaySrc} alt={alt} className={className} />
}
