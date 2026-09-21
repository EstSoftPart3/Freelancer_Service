import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminInterview } from '../data/schema'

type InterviewDialogType = 'create' | 'update' | 'delete' | 'view'

type InterviewContextType = {
  open: InterviewDialogType | null
  setOpen: (str: InterviewDialogType | null) => void
  currentRow: AdminInterview | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminInterview | null>>
}

const InterviewContext = React.createContext<InterviewContextType | null>(null)

export function InterviewProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<InterviewDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminInterview | null>(null)

  return (
    <InterviewContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </InterviewContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInterview = () => {
  const interviewContext = React.useContext(InterviewContext)

  if (!interviewContext) {
    throw new Error('useInterview는 InterviewProvider 안에서 사용되어야 합니다.')
  }

  return interviewContext
}
