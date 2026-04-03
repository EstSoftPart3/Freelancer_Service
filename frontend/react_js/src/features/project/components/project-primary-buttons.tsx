'use client';

import { Button } from '@/components/ui/button';
import { useProject } from './project-provider';

export function ProjectPrimaryButtons() {
  const { setOpen, setCurrentRow } = useProject();

  return (
    <Button
      onClick={() => {
        setCurrentRow(null);
        setOpen('create');
      }}
    >
      프로젝트 등록
    </Button>
  );
}
