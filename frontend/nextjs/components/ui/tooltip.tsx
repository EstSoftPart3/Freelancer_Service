"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "top",
  sideOffset = 6,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-50 max-w-64 origin-(--transform-origin) rounded-lg bg-popover px-2.5 py-2 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

/**
 * 물음표/느낌표 아이콘 하나로 안내를 띄우는 흔한 형태를 묶어둔 것.
 *
 * 터치 기기에는 hover가 없어 순수 툴팁이면 영영 열리지 않는다.
 * 그래서 open을 제어 상태로 두고 탭(click)으로도 토글되게 한다 — 데스크톱의 hover/focus 동작은 그대로다.
 */
function InfoTooltip({
  children,
  label = "안내",
  side = "top",
  align = "center",
  className,
}: {
  children: React.ReactNode
  label?: string
  side?: TooltipPrimitive.Positioner.Props["side"]
  align?: TooltipPrimitive.Positioner.Props["align"]
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        type="button"
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
      >
        <Info className="h-3.5 w-3.5" />
      </TooltipTrigger>
      <TooltipContent side={side} align={align}>
        {children}
      </TooltipContent>
    </Tooltip>
  )
}

export { Tooltip, TooltipContent, TooltipTrigger, InfoTooltip }
