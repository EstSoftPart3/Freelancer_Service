import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Faq } from '../data/schema';

type OpenType = 'create' | 'update' | 'delete' | null;

type FaqContextType = {
  open: OpenType;
  setOpen: (value: OpenType) => void;
  currentRow: Faq | null;
  setCurrentRow: (value: Faq | null) => void;
};

const FaqContext = createContext<FaqContextType | null>(null);

export function FaqProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenType>(null);
  const [currentRow, setCurrentRow] = useState<Faq | null>(null);

  return (
    <FaqContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </FaqContext.Provider>
  );
}

export function useFaq() {
  const context = useContext(FaqContext);
  if (!context) {
    throw new Error('useFaq must be used within a FaqProvider');
  }
  return context;
}
