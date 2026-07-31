import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AdminProject } from '../data/schema'

type ProjectDialogType = 'view' | 'delete' | 'restore' | null

interface ProjectContextType {
  open: ProjectDialogType
  setOpen: (open: ProjectDialogType) => void
  currentRow: AdminProject | null
  setCurrentRow: (row: AdminProject | null) => void
  refresh: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({
  children,
  refresh,
}: {
  children: ReactNode
  refresh: () => void
}) {
  const [open, setOpen] = useState<ProjectDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AdminProject | null>(null)

  return (
    <ProjectContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, refresh }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProject = () => {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within a ProjectProvider')
  return ctx
}
