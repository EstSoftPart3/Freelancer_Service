import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminVote } from '../data/schema'

type VoteDialogType = 'create' | 'update' | 'delete' | 'view'

type VoteContextType = {
  open: VoteDialogType | null
  setOpen: (str: VoteDialogType | null) => void
  currentRow: AdminVote | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminVote | null>>
}

const VoteContext = React.createContext<VoteContextType | null>(null)

export function VoteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<VoteDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminVote | null>(null)

  return (
    <VoteContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </VoteContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVote = () => {
  const voteContext = React.useContext(VoteContext)

  if (!voteContext) {
    throw new Error('useVote는 VoteProvider 안에서 사용되어야 합니다.')
  }

  return voteContext
}
