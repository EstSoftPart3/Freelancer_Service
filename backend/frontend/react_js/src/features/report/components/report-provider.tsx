// src/features/report/components/report-provider.tsx
import { createContext, useContext, useState, type ReactNode } from 'react'
import { type AdminReport } from '../data/schema'

// 아까 만든 API 타입 참조

// 신고 관리에서 사용할 다이얼로그 타입 정의
type ReportDialogType =
  | 'view' // 신고 상세 및 처리 (가장 많이 사용)
  | 'delete' // 신고 내역 자체 삭제 (물리 삭제 등 필요시)
  | null

interface ReportContextType {
  open: ReportDialogType
  setOpen: (open: ReportDialogType) => void
  currentRow: AdminReport | null
  setCurrentRow: (row: AdminReport | null) => void
}

const ReportContext = createContext<ReportContextType | undefined>(undefined)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<ReportDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminReport | null>(null)

  return (
    <ReportContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </ReportContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReport = () => {
  const context = useContext(ReportContext)
  if (!context)
    throw new Error('useReport must be used within a ReportProvider')
  return context
}
