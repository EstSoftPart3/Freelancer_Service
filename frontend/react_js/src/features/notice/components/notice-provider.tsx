// [Freelancer Service] 공지사항 관련
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Notice } from '../data/schema'

// 1. 다이얼로그 타입 명칭 변경
type NoticeDialogType = 'create' | 'update' | 'delete' | 'import' | 'view'

type NoticeContextType = {
  open: NoticeDialogType | null
  setOpen: (str: NoticeDialogType | null) => void
  currentRow: Notice | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Notice | null>>
}

// 2. 컨텍스트 명칭 변경
const NoticeContext = React.createContext<NoticeContextType | null>(null)

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<NoticeDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Notice | null>(null)

  return (
    <NoticeContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </NoticeContext.Provider>
  )
}

// 3. 훅 이름 변경: 이제 다른 파일에서 useNotice()로 불러옵니다.
// eslint-disable-next-line react-refresh/only-export-components
export const useNotice = () => {
  const noticeContext = React.useContext(NoticeContext)

  if (!noticeContext) {
    throw new Error('useNotice는 NoticeProvider 안에서 사용되어야 합니다.')
  }

  return noticeContext
}
