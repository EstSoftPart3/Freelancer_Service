import { ReactNode } from 'react';

export type Faq = {
  updatedAt: ReactNode;
  content: string;
  id: number;
  question: string;
  category: string;
  isPublic: boolean;
  createdAt: string;
};
