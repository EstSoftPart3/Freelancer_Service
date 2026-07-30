import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AdminVoc } from '../data/schema'

type VocDialogType = 'view' | 'delete' | null

interface VocContextType {
  open: VocDialogType
  setOpen: (open: VocDialogType) => void
  currentRow: AdminVoc | null
  setCurrentRow: (row: AdminVoc | null) => void
  /** 목록 새로고침 — 답변 등록·삭제 후 answerCnt 를 다시 읽어야 한다 */
  refresh: () => void
}

const VocContext = createContext<VocContextType | undefined>(undefined)

export function VocProvider({
  children,
  refresh,
}: {
  children: ReactNode
  refresh: () => void
}) {
  const [open, setOpen] = useState<VocDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminVoc | null>(null)

  return (
    <VocContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, refresh }}
    >
      {children}
    </VocContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVoc = () => {
  const context = useContext(VocContext)
  if (!context) throw new Error('useVoc must be used within a VocProvider')
  return context
}
