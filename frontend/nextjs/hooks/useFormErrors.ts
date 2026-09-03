'use client'
// 폼 검증 실패 표시 공용 훅 — 미충족 필드에 빨간 프레임(aria-invalid)을 켜고 첫 필드로 스크롤·포커스한다.
//
// 기존 폼들은 `if (조건) { toast.error('…'); return }` 를 나열해 첫 에러에서 멈췄다.
// validate() 는 같은 문구를 유지한 채 검사를 "전부" 평가해서, 미충족 필드를 한꺼번에 표시한다.
// 이동·문구의 기준은 검사를 나열한 순서가 아니라 화면에 보이는 순서다(아래 firstOnScreen 참고).
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

export interface FieldCheck<K extends string> {
  key: K            // 필드 식별자 — fieldProps/bindRef 와 짝을 이룬다
  invalid: boolean  // true 면 미충족
  message: string   // 기존 toast.error 문구를 그대로 옮긴다
}

// 커서를 받을 「진짜 입력」. Quill 본문은 contenteditable 이라 여기에 포함시킨다.
const FIELD_INPUTS =
  'input:not([type=hidden]):not([disabled]),textarea:not([disabled]),select:not([disabled]),[contenteditable="true"]'
// 입력이 없는 블록(태그 선택·인터뷰 시간처럼 버튼으로만 조작하는 칸)에서 쓰는 차선책.
const FALLBACK_FOCUSABLE = 'button:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** 두 요소의 화면(문서) 순서. a 가 위면 음수, 아래면 양수. */
function compareDocumentOrder(a: Element, b: Element) {
  if (a === b) return 0
  const position = a.compareDocumentPosition(b)
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
  if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
  return 0
}

/** 화면에 그려진 요소인지. display:none 이면 사각형이 하나도 없다. */
function isVisible(el: HTMLElement) {
  return el.getClientRects().length > 0
}

/**
 * 블록 안에서 커서를 줄 요소를 고른다.
 *
 * 두 가지가 Quill 때문에 필요하다.
 *  · 입력을 버튼보다 먼저 찾는다 — 툴바가 본문보다 앞에 있어서 한 번에 찾으면
 *    폰트 드롭다운에 커서가 들어가고 정작 본문에는 안 들어간다.
 *  · 보이는 것만 고른다 — Quill 툴바에는 자기가 감춰 둔 진짜 <select>(ql-header 등)가 남아 있어서,
 *    그걸 집으면 focus() 가 조용히 실패하고 커서가 <body> 에 머문다.
 */
function focusTargetIn(el: HTMLElement): HTMLElement {
  if (el.matches(FIELD_INPUTS) && isVisible(el)) return el
  const firstVisible = (selector: string) =>
    Array.from(el.querySelectorAll<HTMLElement>(selector)).find(isVisible)
  return firstVisible(FIELD_INPUTS) ?? firstVisible(FALLBACK_FOCUSABLE) ?? el
}

/**
 * 요소를 화면 가운데로 부드럽게 옮기고 커서를 넣는다.
 * 이미 필드별 에러 상태를 가진 폼(회원가입 등)도 이 함수만 따로 쓴다.
 */
export function focusInvalidElement(el: HTMLElement | null | undefined) {
  if (!el) return
  scrollIntoViewSafely(el)
  // preventScroll 을 주지 않으면 브라우저가 즉시 점프해 위의 smooth 스크롤이 끊긴다.
  focusTargetIn(el).focus({ preventScroll: true })
}

function isOutOfView(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return r.bottom <= 0 || r.top >= window.innerHeight
}

function scrollIntoViewSafely(el: HTMLElement) {
  // 「동작 줄이기」를 켠 사용자에게는 애니메이션 없이 즉시 이동한다.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    el.scrollIntoView({ behavior: 'auto', block: 'center' })
    return
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // 부드러운 스크롤이 아예 진행되지 않는 환경이 있다(스크롤 애니메이션이 꺼진 브라우저, 자동화 도구 등).
  // 그대로 두면 「빨간 프레임은 떴는데 화면은 그대로」가 되므로, 잠시 뒤에도 화면 밖이면 즉시 이동으로 맞춘다.
  // 애니메이션이 정상적으로 끝났다면 이미 화면 안이라 이 보정은 실행되지 않는다.
  setTimeout(() => { if (isOutOfView(el)) el.scrollIntoView({ behavior: 'auto', block: 'center' }) }, 400)
}

export function useFormErrors<K extends string = string>() {
  const [invalidKeys, setInvalidKeys] = useState<ReadonlySet<K>>(() => new Set<K>())
  const nodes = useRef(new Map<K, HTMLElement>())

  const bindRef = useCallback(
    (key: K) => (el: HTMLElement | null) => {
      if (el) nodes.current.set(key, el)
      else nodes.current.delete(key)
    },
    [],
  )

  const focusField = useCallback((key: K) => {
    focusInvalidElement(nodes.current.get(key))
  }, [])

  const isInvalid = useCallback((key: K) => invalidKeys.has(key), [invalidKeys])

  /** ref + aria-invalid 를 한 번에 붙인다. <Input {...fieldProps('title')} /> */
  const fieldProps = useCallback(
    (key: K) => ({
      ref: bindRef(key),
      'aria-invalid': invalidKeys.has(key) || undefined,
    }),
    [bindRef, invalidKeys],
  )

  /**
   * 미충족 항목 가운데 화면에서 가장 위에 있는 것을 고른다.
   *
   * 검사를 나열한 순서가 화면 순서와 같다는 보장이 없다 — 공고 폼은 검증 순서를 Vue 원본에서
   * 그대로 물려받아 단가가 맨 끝인데 화면에서는 근무 형태·모집 직군보다 위에 있다. 배열 순서로
   * 고르면 비어 있는 단가를 지나쳐 아래 칸으로 커서가 뛰므로, 등록된 ref 의 문서 위치로 판단한다.
   *
   * 같은 칸에 규칙이 여럿이면(주소·등급·단가) 배열에서 먼저 나온 규칙의 문구를 쓴다 —
   * 순회 순서가 곧 배열 순서라 「위에 있을 때만 교체」 조건이 그대로 그 역할을 한다.
   */
  const firstOnScreen = useCallback(<T extends { key: K }>(items: readonly T[]) => {
    let best: T | undefined
    let bestNode: HTMLElement | undefined
    for (const item of items) {
      const node = nodes.current.get(item.key)
      if (!best) { best = item; bestNode = node; continue }
      if (!node) continue                       // 화면에 없는 칸은 이동 대상이 못 된다
      if (!bestNode || compareDocumentOrder(bestNode, node) > 0) { best = item; bestNode = node }
    }
    return best
  }, [])

  /** 이미 개별 검증이 끝난 폼(회원가입·행 단위 수정)이 미충족 key 목록만 넘기는 저수준 API. */
  const markInvalid = useCallback(
    (keys: readonly K[], message?: string) => {
      setInvalidKeys(new Set(keys))
      if (keys.length === 0) return true
      if (message) toast.error(message)
      // 이동은 지금 바로 한다. 프레임이 켜져도 대상은 이미 DOM 에 있고 레이아웃이 밀리지 않으므로
      // requestAnimationFrame 을 끼우면 탭이 백그라운드일 때 콜백이 아예 실행되지 않을 뿐이다.
      focusField((firstOnScreen(keys.map((key) => ({ key }))) ?? { key: keys[0] }).key)
      return false
    },
    [focusField, firstOnScreen],
  )

  /** 검사 배열을 전부 평가 → 미충족 전체에 프레임, 화면에서 가장 위인 칸의 문구로 토스트 + 그리로 이동. */
  const validate = useCallback(
    (checks: readonly FieldCheck<K>[]) => {
      const failed = checks.filter((c) => c.invalid)
      // 같은 key 에 규칙이 여럿일 수 있다(주소·등급·단가). 프레임은 칸마다 하나만 켠다.
      const keys = [...new Set(failed.map((c) => c.key))]
      setInvalidKeys(new Set(keys))
      if (failed.length === 0) return true
      const first = firstOnScreen(failed) ?? failed[0]
      toast.error(first.message)
      focusField(first.key)
      return false
    },
    [focusField, firstOnScreen],
  )

  const clearField = useCallback((key: K) => {
    setInvalidKeys((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setInvalidKeys((prev) => (prev.size === 0 ? prev : new Set<K>()))
  }, [])

  return { validate, markInvalid, fieldProps, bindRef, isInvalid, clearField, clearAll, focusField }
}
