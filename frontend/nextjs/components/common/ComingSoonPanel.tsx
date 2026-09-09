// Phase2 작업 중 화면이 아직 없는 라우트가 헤더에서 404 나지 않도록 잡아두는 임시 패널.
// 각 화면을 실제로 만들 때 이 컴포넌트 사용을 지우고 실제 페이지로 교체한다.
import { CircleDot } from 'lucide-react'

interface Props {
  eyebrow: string
  title: string
  description: string
  items: string[]
}

export default function ComingSoonPanel({ eyebrow, title, description, items }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="mb-3 inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="mb-8 text-sm text-muted-foreground">{description}</p>
      <div className="rounded-xl border border-dashed bg-muted/30 p-6">
        <h2 className="mb-3 text-sm font-semibold">준비 중입니다</h2>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
