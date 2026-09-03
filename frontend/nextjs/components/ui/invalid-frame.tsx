import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 입력 요소가 아닌 블록(체크박스 그룹·태그 선택·목록·Quill 에디터 등)에 빨간 프레임을 씌우는 래퍼.
 *
 * Input/Textarea/SelectTrigger/Checkbox 는 aria-invalid 스타일을 자체적으로 갖고 있으므로
 * 이 래퍼가 필요 없다. 여기서 border 가 아니라 ring 만 쓰는 이유는 border 는 1px 레이아웃
 * 시프트를 만들지만 ring 은 box-shadow 라 주변 배치를 전혀 밀지 않기 때문이다.
 *
 * tabIndex={-1} — 안쪽에 포커스 가능한 요소가 없는 블록도 focusField() 가 포커스할 수 있게 한다.
 */
function InvalidFrame({
  invalid,
  className,
  ...props
}: React.ComponentProps<"div"> & { invalid?: boolean }) {
  return (
    <div
      data-slot="invalid-frame"
      data-invalid={invalid || undefined}
      tabIndex={-1}
      className={cn(
        "rounded-lg outline-none transition-shadow",
        "data-[invalid]:ring-3 data-[invalid]:ring-destructive/30",
        className
      )}
      {...props}
    />
  )
}

/** 필드 아래 빨간 안내 문구. 회원가입 폼 2곳에 중복 정의돼 있던 것을 공용화했다. */
function ErrorMsg({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null
}

export { InvalidFrame, ErrorMsg }
