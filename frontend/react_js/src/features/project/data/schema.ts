import { ReactNode } from 'react';

export type ProjectPost = {
  viewCount: ReactNode;
  id: number;
  title: string;
  author: string;
  category: string;
  status: string;
  createdAt: string;
};
