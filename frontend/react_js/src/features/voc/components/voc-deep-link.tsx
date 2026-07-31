import { useEffect, useRef } from 'react'
import type { AdminVoc } from '../data/schema'
import { useVoc } from './voc-provider'

interface Props {
  /** URL 의 ?view={sq} */
  viewSq?: number
  /** 현재 페이지의 목록 행 — 헤더(제목·작성자·비공개 여부)를 채우는 데 쓴다 */
  rows: AdminVoc[]
  isLoading: boolean
}

/**
 * 접수 알림 메일의 바로가기 처리.
 *
 * <p>메일은 {@code /contents/voc?view={sq}} 로 보낸다. 목록만 열면 운영자가 방금 접수된 문의를
 * 다시 찾아야 해서, 이 컴포넌트가 해당 행의 상세 패널을 바로 연다.</p>
 *
 * <p><b>목록에 그 행이 없을 수도 있다</b> — 다른 페이지에 있거나 필터에 걸린 경우다.
 * 그때는 sq 만 채운 임시 행으로 연다. 드로어가 sq 로 상세를 다시 조회하므로 내용은 정상이고,
 * 헤더만 상세 응답이 오기 전까지 비어 보인다.</p>
 *
 * <p>한 번 열고 나면 다시 열지 않는다. 그러지 않으면 사용자가 패널을 닫는 순간
 * (URL 에 view 가 남아 있어) 곧바로 다시 열려 닫을 수가 없다.</p>
 */
export function VocDeepLink({ viewSq, rows, isLoading }: Props) {
  const { setOpen, setCurrentRow } = useVoc()
  const openedRef = useRef<number | null>(null)

  useEffect(() => {
    if (!viewSq || isLoading) return
    if (openedRef.current === viewSq) return

    openedRef.current = viewSq
    const found = rows.find((r) => r.sq === viewSq)
    setCurrentRow(
      found ?? ({ sq: viewSq, ttl: '', createdAt: '' } as AdminVoc)
    )
    setOpen('view')
  }, [viewSq, rows, isLoading, setCurrentRow, setOpen])

  return null
}
