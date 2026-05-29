// 활동 로그 조회 — 상태 관리 Provider
import { createContext, useContext, useState, type ReactNode } from 'react'

// 로그 데이터 타입
export interface AuditLog {
  logSq: number
  createdAt: string
  userTypeCd: string
  userNm: string
  actionType: string
  targetType: string
  targetTitle: string
  ipAddress: string
  beforeData?: string | Record<string, string>
  afterData?: string | Record<string, string>
}

type AuditDialogType = 'view' | null

interface AuditContextType {
  open: AuditDialogType
  setOpen: (open: AuditDialogType) => void
  currentRow: AuditLog | null
  setCurrentRow: (row: AuditLog | null) => void
}

const AuditContext = createContext<AuditContextType | undefined>(undefined)

export function AuditProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<AuditDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AuditLog | null>(null)

  return (
    <AuditContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AuditContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAudit = () => {
  const context = useContext(AuditContext)
  if (!context) throw new Error('useAudit must be used within an AuditProvider')
  return context
}
