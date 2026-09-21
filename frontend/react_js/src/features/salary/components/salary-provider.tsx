import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type AdminSalary } from '../data/schema'

type SalaryDialogType = 'create' | 'update' | 'delete' | 'view'

type SalaryContextType = {
  open: SalaryDialogType | null
  setOpen: (str: SalaryDialogType | null) => void
  currentRow: AdminSalary | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AdminSalary | null>>
}

const SalaryContext = React.createContext<SalaryContextType | null>(null)

export function SalaryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SalaryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminSalary | null>(null)

  return (
    <SalaryContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SalaryContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSalary = () => {
  const salaryContext = React.useContext(SalaryContext)

  if (!salaryContext) {
    throw new Error('useSalary는 SalaryProvider 안에서 사용되어야 합니다.')
  }

  return salaryContext
}
