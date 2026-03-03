// src/features/board/components/board-provider.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AdminBoard } from '../data/schema'

// [해결] Dialogs에서 사용하는 모든 타입을 명시합니다.
type BoardDialogType =
  | 'view'
  | 'update'
  | 'create'
  | 'delete'
  | 'import'
  | 'add'
  | null

interface BoardContextType {
  open: BoardDialogType
  setOpen: (open: BoardDialogType) => void
  currentRow: AdminBoard | null
  setCurrentRow: (row: AdminBoard | null) => void
}

const BoardContext = createContext<BoardContextType | undefined>(undefined)

export function BoardProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<BoardDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminBoard | null>(null)

  return (
    <BoardContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BoardContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBoard = () => {
  const context = useContext(BoardContext)
  if (!context) throw new Error('useBoard must be used within a BoardProvider')
  return context
}
