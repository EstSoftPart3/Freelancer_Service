import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ProjectPost } from '../data';

type OpenType = 'view' | 'update' | 'delete' | null;

type ProjectContextType = {
  open: OpenType;
  setOpen: (value: OpenType) => void;
  currentRow: ProjectPost | null;
  setCurrentRow: (value: ProjectPost | null) => void;
};

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenType>(null);
  const [currentRow, setCurrentRow] = useState<ProjectPost | null>(null);

  return (
    <ProjectContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
