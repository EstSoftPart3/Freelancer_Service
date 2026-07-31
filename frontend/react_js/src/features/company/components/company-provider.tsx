import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CompanyRow } from '../api/company-api'

type CompanyDialogType = 'edit' | null

interface CompanyContextType {
  open: CompanyDialogType
  setOpen: (open: CompanyDialogType) => void
  currentRow: CompanyRow | null
  setCurrentRow: (row: CompanyRow | null) => void
  /** 수정 저장 후 목록을 다시 읽는다 */
  refresh: () => void
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({
  children,
  refresh,
}: {
  children: ReactNode
  refresh: () => void
}) {
  const [open, setOpen] = useState<CompanyDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CompanyRow | null>(null)

  return (
    <CompanyContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, refresh }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompany = () => {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompany must be used within a CompanyProvider')
  return ctx
}
